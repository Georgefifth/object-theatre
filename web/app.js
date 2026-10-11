'use strict';
const $ = id => document.getElementById(id);
function roles(){return {suspect:t('嫌疑人'),witness:t('证人'),missing:t('失踪者')};}
const state = {cast:[], script:null, opening:null, art:null, openingArt:null, mode:'demo', choice:'opening', revision:0, busy:false, configured:false, controller:null, exportUrl:null, backend:false, cancelled:false, openingLocale:null};
const el = (tag,text,cls) => {const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e;};
const esc = value => String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function tell(text,error=false){$('status').textContent=text;$('status').className=error?'error':'';}
function byRole(role){return state.cast.find(a=>a.role===role);}
function actor(id){return state.cast.find(a=>a.id===id);}
function svgProp(kind,x,y,scale=1){
  const face='<circle cx="-12" cy="-7" r="3" fill="#342254"/><circle cx="12" cy="-7" r="3" fill="#342254"/><path d="M-8 9 Q0 17 8 9" fill="none" stroke="#342254" stroke-width="3" stroke-linecap="round"/>';
  let shape='';
  if(kind==='cup')shape='<path d="M-43-40h78l-7 89h-64z" fill="#f3dfc9" stroke="#342254" stroke-width="4"/><path d="M35-24c49-12 45 57-5 49" fill="none" stroke="#342254" stroke-width="8"/><ellipse cx="-4" cy="-40" rx="39" ry="9" fill="#85626a" stroke="#342254" stroke-width="3"/><path d="M15-27l-8 19 12 11-7 18" fill="none" stroke="#927485" stroke-width="2"/>'+face;
  else if(kind==='key')shape='<circle cx="-35" cy="0" r="27" fill="#f5d46c" stroke="#342254" stroke-width="4"/><circle cx="-35" cy="0" r="11" fill="#fffdf8" stroke="#342254" stroke-width="3"/><path d="M-10-7h64v14h-10v16H31V7H-10z" fill="#f5d46c" stroke="#342254" stroke-width="4"/><circle cx="25" cy="-1" r="2" fill="#342254"/><path d="M27 3l7 0" stroke="#342254" stroke-width="2"/>';
  else shape='<rect x="-48" y="-31" width="96" height="62" rx="8" fill="#f39bae" stroke="#342254" stroke-width="4"/><path d="M-46-29l21 1v58h-21" fill="#c481b1"/><path d="M31-27l13 11-8 6 9 10" fill="none" stroke="#a3567d" stroke-width="2"/>'+face;
  return `<g transform="translate(${x} ${y}) scale(${scale})">${shape}</g>`;
}
function actorGraphic(a,x,y,scale=1){
  if(a.real)return `<image href="${a.image.url}" x="${x-55*scale}" y="${y-55*scale}" width="${110*scale}" height="${110*scale}"/>`;
  return svgProp(a.kind,x,y,scale);
}
function sampleSvg(kind){return `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320" viewBox="0 0 320 320"><rect width="320" height="320" fill="#f0e9f7"/>${svgProp(kind,160,170,2)}</svg>`;}
async function pngFromSvg(svg){
  const image=new Image();image.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);await image.decode();
  const canvas=document.createElement('canvas');canvas.width=320;canvas.height=320;canvas.getContext('2d').drawImage(image,0,0);const url=canvas.toDataURL('image/png');return {url,mime:'image/png',data:url.split(',')[1]};
}
function clearExport(){if(state.exportUrl)URL.revokeObjectURL(state.exportUrl);state.exportUrl=null;}
function resetStory(){state.revision++;state.controller?.abort();state.script=null;state.opening=null;state.art=null;state.openingArt=null;state.choice='opening';$('stage').hidden=true;document.body.classList.remove('playing');$('export').disabled=true;$('print').disabled=true;$('artRetry').hidden=true;clearExport();}
function renderCast(){
  $('cast').replaceChildren();
  for(const a of state.cast){
    const card=el('article',undefined,'actor');const pic=el('div',undefined,'actor-image');const img=el('img');img.src=a.image.url;img.alt=a.real?t('{name}的照片',{name:a.name}):t('{name}的原创示例插画',{name:a.name});pic.append(img);
    const fields=el('div',undefined,'actor-fields');const label=el('label',t('演员名字'));const name=el('input');name.type='text';name.value=a.name;name.maxLength=30;name.setAttribute('aria-label',t('演员 {id} 名字',{id:a.id}));name.oninput=()=>{a.name=name.value;a.sampleName=false;resetStory();tell(t('演员改名了，请重新开场。'));};label.append(name);fields.append(label);
    const roleLabel=el('label',t('安排角色'));const select=el('select');select.setAttribute('aria-label',t('演员 {id} 角色',{id:a.id}));Object.entries(roles()).forEach(([value,text])=>{const o=el('option',text);o.value=value;select.append(o);});select.value=a.role;
    select.onchange=()=>{const other=state.cast.find(b=>b.id!==a.id&&b.role===select.value);if(other)other.role=a.role;a.role=select.value;resetStory();renderCast();tell(t('角色已交换。演员们准备好新剧本了。'));};roleLabel.append(select);fields.append(roleLabel);
    const uploadLabel=el('label',t('换成我的物件照片'),'photo-label');const upload=el('input');upload.type='file';upload.disabled=!state.backend;upload.accept='image/png,image/jpeg,image/webp';upload.setAttribute('aria-label',t('演员 {id} 照片',{id:a.id}));
    upload.onchange=async()=>{
      const file=upload.files[0];if(!file)return;
      if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>4*1024*1024){upload.value='';return tell(t('请选择不超过 4 MiB 的 PNG、JPEG 或 WebP。'),true);}
      resetStory();const token=Symbol();a.uploadToken=token;
      try{const url=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(file);});const check=new Image();check.src=url;await check.decode();if(a.uploadToken!==token||!state.cast.includes(a))return;a.image={url,mime:file.type,data:url.split(',')[1]};a.real=true;state.mode='live';renderCast();tell(t('照片已就位。开场将根据照片生成剧本和漫画。'));}catch{tell(t('照片无法读取，请换一张。'),true);}
    };uploadLabel.append(upload);if(state.backend)fields.append(uploadLabel);card.append(pic,fields);$('cast').append(card);
  }
  const n=state.cast.filter(a=>a.real).length;$('mode').textContent=n?t('{n} 张自有照片，{samples} 张示例插画。点击开场后将发送给 Google。',{n,samples:3-n}):t('原创预设示例 · 不调用模型，可以试两个结局。');
}
function englishDemo(choice='opening',previous=null){
 const s=byRole('suspect'),w=byRole('witness'),m=byRole('missing');
 const panels=[
 {caption:'23:47. The name remains. The actor is gone.',action:'The missing actor’s empty place, with the other two nearby.',dialogue:[{actor:s.id,text:`Where is ${m.name}? They were right here.`}]},
 {caption:'The director decides: someone must be hiding something.',action:'The witness stands in a spotlight. The suspect is accused.',dialogue:[{actor:w.id,text:'Why do I only get to be the witness?'},{actor:s.id,text:'The director already cast us.'}]},
 {caption:'The witness starts reading their own script.',action:'The witness touches the panel border and looks at the director.',dialogue:[{actor:w.id,text:'You wrote this silence for me.'}]},
 {caption:'For once, the director has to answer.',action:'The missing actor peeks over the panel border.',dialogue:[{actor:m.id,text:'What if I don’t want to come back?'}]}
 ];
 if(choice==='listen'){
 panels[2]={caption:'Not missing. Just returning an unwanted part.',action:'The missing actor crosses out their role label. The witness admits helping.',dialogue:[{actor:w.id,text:'I helped them hide the “missing” label.'},{actor:m.id,text:'Keep my name. Let me choose my part.'}]};
 panels[3]={caption:'No case solved. A new play begins.',action:'All three sit on the panel border with their old labels turned over.',dialogue:[{actor:s.id,text:'Then I’d like one panel off.'},{actor:w.id,text:'Granted. No mandatory villains today.'}]};
 }else if(choice==='insist'){
 panels[2]={caption:'The director insists. The cast follows the lines.',action:'The objects walk along the panel border towards the exit.',dialogue:[{actor:w.id,text:'Fine. You want a silent witness.'},{actor:s.id,text:'We’ll leave the stage to you.'}]};
 panels[3]={caption:'The parts remain. The actors have clocked out.',action:'An empty stage with three role labels. The cast hides behind the page number.',dialogue:[{actor:m.id,text:'We’re behind the page number. Don’t look.'}]};
 }
 return {title:choice==='listen'?'Can I return this part?':choice==='insist'?'The director’s solo':'The missing actor won’t come back',panels:previous?[...previous.panels.slice(0,2),...panels.slice(2)]:panels,protest:{actor:w.id,line:`“${w.name} stays silent.” You never asked me. Don’t write my silence as guilt.`,request:`Let me explain: ${m.name} left on purpose. I only helped.`},ending:choice==='listen'?'You lose a tidy mystery and gain three actors willing to keep playing.':choice==='insist'?'You keep your script, but lose your cast. Someone laughs behind the page number.':'The cast wants a rewrite. For now, the choice is yours.',details:state.cast.map(a=>a.real?`${a.name}: the sample does not analyse photos. Live creation does.`:`${a.name}: ${{cup:'a pale body and fine crack',key:'yellow metal and uneven teeth',eraser:'pink rubber and worn corners'}[a.kind]} in the authored sample.`)};
}

function demoScript(choice='opening',previous=null){
  if(locale==='en')return englishDemo(choice,previous);
  const s=byRole('suspect'),w=byRole('witness'),m=byRole('missing');
  const panels=[
    {caption:'昨晚 23:47，名字还在，演员不见了。',action:'失踪者的空位。证人和嫌疑人在旁边。',dialogue:[{actor:s.id,text:`${m.name}呢？刚才还在第三个位置。`}]},
    {caption:'导演决定：有人一定在隐瞒。',action:'证人被舞台灯照亮，嫌疑人受到怀疑。',dialogue:[{actor:w.id,text:'为什么我只能当证人？'},{actor:s.id,text:'因为导演已经把角色选好了。'}]},
    {caption:'证人开始读自己的剧本。',action:'证人触碰漫画格线，看向画外导演。',dialogue:[{actor:w.id,text:'这段沉默，是你替我写的。'}]},
    {caption:'这一次，等导演回答。',action:'失踪者从漫画边缘探出，证人向画外发问。',dialogue:[{actor:m.id,text:'如果我不想回来呢？'}]},
  ];
  if(choice==='listen'){
    panels[2]={caption:'它没有失踪。它只是把角色还给了你。',action:'失踪者出现，擦掉属于自己的角色纸签。证人承认曾帮它。',dialogue:[{actor:w.id,text:'我帮它藏起了那张“失踪者”纸签。'},{actor:m.id,text:'名字留下。角色我想自己选。'}]};
    panels[3]={caption:'案子没破。今晚的戏，终于开始了。',action:'三件物品坐在漫画边框上，原角色标签被翻到背面。',dialogue:[{actor:s.id,text:'那我申请休息一格。'},{actor:w.id,text:'批准。今天没人必须当坏人。'}]};
  }else if(choice==='insist'){
    panels[2]={caption:'导演坚持照演。演员们照着格线走。',action:'三件物品挤到漫画边缘，向下一格移走。',dialogue:[{actor:w.id,text:'好。你要一个安静的证人。'},{actor:s.id,text:'那我们把舞台留给你。'}]};
    panels[3]={caption:'角色都还在。演员已经下班。',action:'空舞台，三张角色纸签。物件身影出现在画框外边缘。',dialogue:[{actor:m.id,text:'别找了。我们在页码后面。'}]};
  }
  return {title:choice==='listen'?'角色可以退回吗？':choice==='insist'?'导演独角戏':'失踪者不想被找回',panels:previous?[...previous.panels.slice(0,2),...panels.slice(2)]:panels,protest:{actor:w.id,line:`“${w.name}沉默了。”——这段你没问过我。我不想因为沉默就被写成有罪。`,request:`让我说明：${m.name}是自己离开的，我只是帮了它。`},ending:choice==='listen'?'你失去了一场漂亮的破案，得到三个愿意继续演的演员。':choice==='insist'?'你保住了原剧本，舞台却空了。页码后面传来一声笑。':'演员提出改戏。决定权，暂时还在你手里。',details:state.cast.map(a=>a.real?`${a.name}：示例不识别上传照片；真实开场才分析外观。`:`${a.name}：${{cup:'浅色杯身和细裂纹',key:'黄色钥匙与参差齿口',eraser:'粉色橡皮和磨损边角'}[a.kind]}是原创示例画法。`)};
}
function panelSvg(i){
  const s=byRole('suspect'),w=byRole('witness'),m=byRole('missing');let art='';
  if(i===0){art=actorGraphic(s,115,205,1.2)+actorGraphic(w,290,210,1.3)+'<ellipse cx="365" cy="265" rx="45" ry="8" fill="none" stroke="#ae97bc" stroke-width="2" stroke-dasharray="6 6"/>';}
  if(i===1){art='<path d="M260 0L145 320h245L305 0z" fill="#f5d46c55"/>'+actorGraphic(w,260,195,1.8)+actorGraphic(s,75,250,.8);}
  if(i===2){art=actorGraphic(w,130,210,1.5)+actorGraphic(m,300,220,1.1)+'<path d="M410 25v280" stroke="#342254" stroke-width="6" stroke-dasharray="10 8"/>';
    if(state.choice==='listen')art+='<path d="M265 120h115v35H265z" fill="#fff" stroke="#342254" stroke-width="2"/><path d="M270 140l95-12" stroke="#e74767" stroke-width="6"/>';
    if(state.choice==='insist')art=actorGraphic(s,320,185,.9)+actorGraphic(w,375,205,.8)+actorGraphic(m,425,230,.8)+'<path d="M400 40v280" stroke="#342254" stroke-width="5"/>';
  }
  if(i===3){
    if(state.choice==='insist')art='<path d="M30 230h370" stroke="#342254" stroke-width="3"/>'+[s,w,m].map((a,n)=>`<rect x="${60+n*110}" y="190" width="85" height="30" fill="#f5d46c"/><text x="${102+n*110}" y="210" text-anchor="middle" fill="#342254" font-family="sans-serif" font-size="12">${esc(roles()[a.role])}</text>`).join('');
    else art=actorGraphic(s,85,210,1)+actorGraphic(w,230,210,1.2)+actorGraphic(m,350,state.choice==='listen'?210:100,1)+'<path d="M20 270h405" stroke="#342254" stroke-width="5"/>';
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 450 350"><rect width="450" height="350" fill="#fff8e5"/><path d="M0 300H450" stroke="#e5cfcb" stroke-width="2"/>${art}</svg>`;
}
function renderStory(){
  if(!state.script)return;clearExport();$('stage').hidden=false;document.body.classList.add('playing');$('stage').classList.remove('enter');void $('stage').offsetWidth;$('stage').classList.add('enter');$('storyTitle').textContent=state.script.title;
  $('source').textContent=state.mode==='demo'?t('原创示例 · 预设剧情与插画，未调用模型'):state.art?t('根据物件照片生成 · 剧本与漫画均由模型创作'):t('根据物件照片生成 · 剧本已就绪，漫画待生成');
  if(state.mode==='live'&&state.openingLocale!==locale)$('source').textContent+=' — '+t('当前故事仍为原语言。切换界面不会翻译或重新生成它。');
  $('print').disabled=state.busy;const choicesReady=state.mode==='demo'||!!state.openingArt;['listen','insist','otherEnding'].forEach(id=>$(id).disabled=state.busy||!choicesReady);
  $('comic').replaceChildren();state.script.panels.forEach((p,i)=>{
    const panel=el('article',undefined,'panel');const art=el('div',undefined,'panel-art');const image=i<2&&state.choice!=='opening'?state.openingArt:state.art;
    if(state.mode==='demo')art.innerHTML=panelSvg(i);
    else if(image){art.classList.add('generated');const img=el('img');img.src=image;img.alt=t('第 {n} 格',{n:i+1})+': '+p.action;img.style.left=i%2?'-100%':'0';img.style.top=i>=2?'-100%':'0';art.append(img);}
    else art.append(el('div',p.action,'pending-art'));
    panel.append(art,el('span',t('第 {n} 格',{n:i+1}),'panel-label'),el('p',p.caption,'panel-caption'));const dialogue=el('ul',undefined,'dialogue');p.dialogue.forEach(d=>{const line=el('li');line.append(el('strong',actor(d.actor).name),el('span',d.text));dialogue.append(line);});panel.append(dialogue);$('comic').append(panel);
  });
  const done=state.choice!=='opening';$('protest').hidden=done;$('ending').hidden=!done;$('otherEnding').hidden=!done;
  $('protestActor').textContent=t('{name}越过了画格，正在和你说话。',{name:actor(state.script.protest.actor).name});$('protestLine').textContent=state.script.protest.line;$('protestRequest').textContent=state.script.protest.request;
  $('ending').replaceChildren(el('small',state.choice==='listen'?t('你选择了：听它说完'):t('你选择了：导演说了算')),el('span',state.script.ending));
  $('details').replaceChildren(...state.script.details.map(d=>el('li',d)));$('export').disabled=state.mode==='live'&&!state.art;$('artRetry').hidden=state.mode!=='live';$('artRetry').textContent=state.art?t('重新画这一幕'):t('画出这一幕');
}
function setBusy(b,text=t('拉开帷幕')){state.busy=b;['start','quickStart','listen','insist','otherEnding','sample','newShow','artRetry','export','print','language'].forEach(id=>$(id).disabled=b);$('start').textContent=b?t('演员正在准备…'):text;if(!b)$('export').disabled=!state.script||(state.mode==='live'&&!state.art);$('cancel').hidden=!b;document.querySelectorAll('#cast input,#cast select').forEach(n=>n.disabled=b);if(!b){$('print').disabled=!state.script;const ready=!!state.script&&(state.mode==='demo'||!!state.openingArt);['listen','insist','otherEnding'].forEach(id=>$(id).disabled=!ready);}}
function showSettings(){ $('settings').hidden=false;$('settingsToggle').setAttribute('aria-expanded','true');$('key').focus();}
function payload(){return {locale:state.choice==='opening'?locale:(state.openingLocale||locale),key:$('key').value.trim(),textModel:$('textModel').value.trim(),imageModel:$('imageModel').value.trim(),cast:state.cast.map(a=>({id:a.id,name:a.name.trim(),role:a.role,image:{mime:a.image.mime,data:a.image.data}}))};}
async function call(path,body){const response=await fetch(path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),signal:state.controller.signal});let result;try{result=await response.json();}catch{throw new Error(t('服务响应无法读取，请重试。'));}if(!response.ok)throw new Error(locale==='en'?t('本次生成失败。已保留剧本；检查 Key、模型、网络或额度后重试。'):(result.error||t('生成失败，请重试。')));return result;}
async function perform(choice='opening',artOnly=false){
  if(state.busy)return;if(!state.cast.every(a=>a.name.trim()))return tell(t('请给三个演员都起个名字。'),true);
  if(!state.cast.some(a=>a.real)&&!artOnly){
    state.mode='demo';state.choice=choice;state.script=demoScript(choice,choice==='opening'?null:state.opening);if(choice==='opening')state.opening=structuredClone(state.script);renderStory();tell(choice==='opening'?t('演员提出了抗议。下面的选择会改变第三、第四格。'):t('结局已改变。可以看看另一种结局，或带走这出戏。'));focusStage();return;
  }
  if(!state.backend)return tell(t('在线试玩仅运行原创示例。自己的照片创作需要本机 Python 服务；这里不会上传照片或索取 Key。'),true);
  if(!$('key').value.trim()&&!state.configured){showSettings();return tell(t('照片已准备好。请填写 Gemini API Key，再生成真实故事。'),true);}
  const revision=state.revision;const input=payload();input.locale=choice==='opening'?locale:(state.openingLocale||locale);state.cancelled=false;state.controller=new AbortController();setBusy(true);let timer=setTimeout(()=>state.controller?.abort(),320000);
  try{
    if(!artOnly){tell(choice==='opening'?t('编剧正在看你的物件照片，安排开场…'):t('编剧正在回应你的选择，前两格保持不变…'));const result=await call('/api/script',{...input,choice,previous:choice==='opening'?undefined:state.opening});if(revision!==state.revision)return;state.mode='live';state.choice=choice;state.script=result.script;state.art=null;if(choice==='opening'){state.opening=structuredClone(state.script);state.openingLocale=input.locale;state.openingArt=null;}renderStory();}
    tell(t('剧本已就绪。画师正在把三个物件画进同一张四格漫画…'));const result=await call('/api/art',{...input,script:state.script});if(revision!==state.revision)return;state.art=`data:${result.image.mime};base64,${result.image.data}`;if(state.choice==='opening')state.openingArt=state.art;renderStory();tell(t('这一幕已完成。你可以决定，演员是否有权改戏。'));focusStage();
  }catch(error){if(revision===state.revision){tell(error.name==='AbortError'?(state.cancelled?t('已停止等待，剧本保留；Google 仍可能完成已发出的请求并使用额度。'):t('这一幕等待过久，已停止请求。可以重试。')):error.message,true);if(state.script)renderStory();}}
  finally{clearTimeout(timer);state.controller=null;setBusy(false);}
}
async function sample(){if(state.busy)return;resetStory();setBusy(true);const defs=[{id:1,name:locale==='en'?'Key':'钥匙',kind:'key',role:'suspect'},{id:2,name:locale==='en'?'Cup':'杯子',kind:'cup',role:'witness'},{id:3,name:locale==='en'?'Eraser':'橡皮',kind:'eraser',role:'missing'}];try{state.cast=await Promise.all(defs.map(async a=>({...a,real:false,sampleName:true,image:await pngFromSvg(sampleSvg(a.kind))})));state.mode='demo';renderCast();tell(t('演员已就位。你可以换角色，或者直接拉开帷幕。'));}catch{tell(t('示例图片加载失败，请刷新页面。'),true);}finally{setBusy(false);}}
$('quickStart').onclick=()=>perform();$('sample').onclick=sample;$('start').onclick=()=>perform();$('listen').onclick=()=>perform('listen');$('insist').onclick=()=>perform('insist');$('otherEnding').onclick=()=>perform(state.choice==='listen'?'insist':'listen');$('artRetry').onclick=()=>perform(state.choice,true);$('newShow').onclick=()=>{resetStory();tell(t('幕布已落下。给演员换个角色，再开始。'));$('castingPanel').open=true;$('castHeading').focus();$('castHeading').scrollIntoView({block:'start',behavior:'smooth'});};
$('settingsToggle').onclick=()=>{$('settings').hidden=!$('settings').hidden;$('settingsToggle').setAttribute('aria-expanded',String(!$('settings').hidden));};
$('export').onclick=async()=>{
  if(!state.script)return;try{const css=await fetch('./style.css').then(r=>r.text());const title=esc(state.script.title);const work=$('comic').outerHTML;const ending=state.choice==='opening'?state.script.protest.line:state.script.ending;const source=state.mode==='demo'?t('原创预设示例，未调用模型'):t('Gemini 模型创作，使用物件参考照片');const html=`<!doctype html><html lang="${locale}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title><style>${css}body{padding:30px}main{max-width:900px}h1{font-size:35px;letter-spacing:0;margin:15px 0}.source{margin-bottom:20px}@media print{body{padding:0}.panel{break-inside:avoid}.comic{gap:12px}}</style></head><body><main><p>${esc(t('物件剧场'))}</p><h1>${title}</h1><p class="source">${esc(source)} · ${esc({opening:t('开场'),listen:t('听它说完'),insist:t('导演说了算')}[state.choice])}</p>${work}<p class="ending">${esc(ending)}</p><p class="source">${esc(t('这是虚构故事。可用浏览器打印为 PDF。'))}</p></main></body></html>`;const url=URL.createObjectURL(new Blob([html],{type:'text/html;charset=utf-8'}));const a=el('a');a.href=url;a.download='objects-have-a-say.html';document.body.append(a);a.click();a.remove();clearExport();state.exportUrl=url;tell(t('作品已生成。请保存下载的 HTML；也可以直接打印当前作品。'));}catch{tell(t('导出失败，请重试。'),true);}
};
function focusStage(){ $('storyTitle').focus({preventScroll:true});$('stage').scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'}); }
$('cancel').onclick=()=>{state.cancelled=true;state.controller?.abort();};
$('print').onclick=()=>window.print();
$('language').value=locale;
$('language').onchange=()=>{locale=$('language').value;const url=new URL(location.href);url.searchParams.set('lang',locale);history.replaceState(null,'',url);applyLanguage();state.cast.forEach(a=>{if(a.sampleName)a.name=({en:{key:'Key',cup:'Cup',eraser:'Eraser'},'zh-CN':{key:'钥匙',cup:'杯子',eraser:'橡皮'}})[locale][a.kind];});renderCast();if(state.script){if(state.mode==='demo'){state.opening=demoScript();state.script=demoScript(state.choice,state.choice==='opening'?null:state.opening);}renderStory();}tell(state.mode==='live'?t('当前故事仍为原语言。切换界面不会翻译或重新生成它。'):t('原创预设示例 · 不调用模型，可以试两个结局。'));};
async function init(){applyLanguage();await sample();if(['127.0.0.1','localhost'].includes(location.hostname)){try{const response=await fetch('./api/status');if(response.ok){const config=await response.json();state.backend=typeof config.configured==='boolean';state.configured=!!config.configured;}}catch{}}$('settingsToggle').hidden=!state.backend;$('deploymentNotice').hidden=state.backend;$('photoNote').hidden=!state.backend;renderCast();}
init();
