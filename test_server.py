import base64
import io
import json
import unittest
import urllib.error
import urllib.request
import threading
from http.server import ThreadingHTTPServer
from unittest.mock import patch
from server import Problem, Handler, cast_input, credentials, make_art, make_script, script_valid


def data():
    image={'mime':'image/png','data':base64.b64encode(b'\x89PNG\r\n\x1a\nfixture').decode()}
    return {'key':'mock-key-not-real','cast':[{'id':i+1,'name':name,'role':role,'image':image.copy()} for i,(name,role) in enumerate([('钥匙','suspect'),('杯子','witness'),('橡皮','missing')])]}


def script():
    return {'title':'杯子有话说','panels':[{'caption':f'第{i+1}格','action':'三个物件在桌面。','dialogue':[{'actor':2,'text':'我有意见。'}]} for i in range(4)],'protest':{'actor':2,'line':'我不想被误解。','request':'让我说明。'},'ending':'故事停在这里。','details':['钥匙有齿。','杯子有裂纹。','橡皮是粉色。']}


class Tests(unittest.TestCase):
    def test_valid_three_distinct_roles(self):
        cast,parts=cast_input(data());self.assertEqual(len(cast),3);self.assertEqual(len(parts),6)

    def test_duplicate_roles_rejected(self):
        d=data();d['cast'][0]['role']='witness'
        with self.assertRaises(Problem):cast_input(d)

    def test_bad_image_rejected(self):
        for encoded in ('invalid!','dGV4dA==','A'*6000000):
            d=data();d['cast'][0]['image']['data']=encoded
            with self.assertRaises(Problem):cast_input(d)

    def test_actor_identity_rejected(self):
        d=data();d['cast'][0]['id']=99
        with self.assertRaises(Problem):cast_input(d)

    def test_missing_key_and_invalid_model_rejected(self):
        with patch.dict('os.environ',{},clear=True):
            d=data();d['key']=''
            with self.assertRaises(Problem):credentials(d)
        d=data();d['textModel']='../private'
        with self.assertRaises(Problem):credentials(d)

    def test_four_panels_required(self):
        s=script();s['panels'].pop()
        with self.assertRaises(Problem):script_valid(s,data()['cast'])

    def test_unknown_dialogue_actor_rejected(self):
        s=script();s['panels'][0]['dialogue'][0]['actor']=4
        with self.assertRaises(Problem):script_valid(s,data()['cast'])

    def test_protest_must_be_witness(self):
        s=script();s['protest']['actor']=1
        with self.assertRaises(Problem):script_valid(s,data()['cast'])

    def test_script_request_includes_all_reference_images(self):
        seen=[]
        def opener(req,timeout):
            seen.append(json.loads(req.data));return io.BytesIO(json.dumps({'candidates':[{'content':{'parts':[{'text':json.dumps(script())}]}}]}).encode())
        result=make_script(data(),opener)
        self.assertEqual(result['mode'],'live');self.assertEqual(len([p for p in seen[0]['contents'][0]['parts'] if 'inlineData' in p]),3)

    def test_branch_preserves_first_two_panels_and_same_protest(self):
        d=data();d['choice']='listen';d['previous']=script();changed=script();changed['panels'][0]['caption']='模型试图改写开场';changed['panels'][2]['caption']='听证人的新行动'
        def opener(req,timeout):return io.BytesIO(json.dumps({'candidates':[{'content':{'parts':[{'text':json.dumps(changed)}]}}]}).encode())
        result=make_script(d,opener)['script'];self.assertEqual(result['panels'][:2],d['previous']['panels'][:2]);self.assertEqual(result['panels'][2]['caption'],'听证人的新行动');self.assertEqual(result['protest'],d['previous']['protest'])

    def test_english_language_reaches_writer(self):
        d=data();d['locale']='en';seen=[]
        def opener(req,timeout):
            seen.append(json.loads(req.data));return io.BytesIO(json.dumps({'candidates':[{'content':{'parts':[{'text':json.dumps(script())}]}}]}).encode())
        make_script(d,opener)
        self.assertIn('Write all story fields in English',seen[0]['systemInstruction']['parts'][0]['text'])

    def test_invalid_language_rejected_before_provider_call(self):
        d=data();d['locale']='unknown'
        with self.assertRaisesRegex(Problem,'语言无效'):make_script(d)

    def test_invalid_choice_rejected(self):
        d=data();d['choice']='secret'
        with self.assertRaises(Problem):make_script(d)

    def test_image_request_includes_reference_photos_and_actions(self):
        d=data();d['script']=script();seen=[]
        def opener(req,timeout):
            seen.append(json.loads(req.data));return io.BytesIO(json.dumps({'candidates':[{'content':{'parts':[{'inlineData':{'mimeType':'image/png','data':d['cast'][0]['image']['data']}}]}}]}).encode())
        result=make_art(d,opener);self.assertEqual(result['image']['mime'],'image/png');self.assertEqual(seen[0]['generationConfig']['responseModalities'],['TEXT','IMAGE']);self.assertIn('Panel 4',seen[0]['contents'][0]['parts'][-1]['text'])

    def test_fake_generated_image_rejected(self):
        d=data();d['script']=script()
        def opener(req,timeout):return io.BytesIO(b'{"candidates":[{"content":{"parts":[{"inlineData":{"mimeType":"image/png","data":"dGV4dA=="}}]}}]}')
        with self.assertRaisesRegex(Problem,'格式不符'):make_art(d,opener)

    def test_no_generated_image_is_error_not_fake_success(self):
        d=data();d['script']=script()
        def opener(req,timeout):return io.BytesIO(b'{"candidates":[{"content":{"parts":[{"text":"not an image"}]}}]}')
        with self.assertRaisesRegex(Problem,'没有生成图片'):make_art(d,opener)

    def test_provider_limit_is_actionable(self):
        def opener(req,timeout):raise urllib.error.HTTPError(req.full_url,429,'do not expose provider details',{},None)
        with self.assertRaisesRegex(Problem,'限流'):make_script(data(),opener)


class HttpTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.server=ThreadingHTTPServer(('127.0.0.1',0),Handler);cls.thread=threading.Thread(target=cls.server.serve_forever,daemon=True);cls.thread.start();cls.url=f'http://127.0.0.1:{cls.server.server_port}'

    @classmethod
    def tearDownClass(cls):cls.server.shutdown();cls.server.server_close();cls.thread.join()

    def test_ui_route(self):
        with urllib.request.urlopen(self.url+'/') as r:self.assertIn('杯子有话说'.encode(),r.read())

    def test_cross_origin_rejected(self):
        req=urllib.request.Request(self.url+'/api/script',data=b'{}',headers={'Content-Type':'application/json','Origin':'https://external.example'})
        with self.assertRaises(urllib.error.HTTPError) as e:urllib.request.urlopen(req)
        self.assertEqual(e.exception.code,403)

    def test_private_files_not_served(self):
        with self.assertRaises(urllib.error.HTTPError) as e:urllib.request.urlopen(self.url+'/../server.py')
        self.assertEqual(e.exception.code,404)


if __name__=='__main__':unittest.main()
