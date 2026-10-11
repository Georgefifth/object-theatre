/* Music stays opt-in. Recordings and attribution: MUSIC-CREDITS.md. */
var TheatreMusic=(()=>{
  const tracks=[{file:'audition.mp3',title:'Scheming Weasel (slower version)'},{file:'snack.mp3',title:'Tea Roots'},{file:'curtain.mp3',title:'Carefree'}];
  function cue(act,node){if(['silence','playerFreeze'].includes(node))return -1;if(['teaEnd','teaFinal','returnDone','lastChoice'].includes(node))return 1;return Math.max(0,Math.min(2,act-1));}
  function create({audio,button,slider,volumeLabel,status,document,storage}){
    let enabled=false,lang=0,current=-1,desired=0,generation=0,error=false,pending=false;
    let volume=0.18;try{const saved=storage.getItem('theatre-music-volume');if(saved!==null&&Number.isFinite(Number(saved)))volume=Math.max(0,Math.min(.5,Number(saved)));}catch{}
    audio.loop=true;audio.preload='none';audio.volume=volume;slider.value=Math.round(volume*100);
    const text=(zh,en)=>lang?en:zh;
    function paint(){status.hidden=!error;button.textContent=text(pending?'声音加载中…':enabled?'声音：开':'开启声音',pending?'Loading sound…':enabled?'Sound: on':'Enable sound');button.setAttribute('aria-pressed',String(enabled));slider.setAttribute('aria-label',text('音乐音量','Music volume'));volumeLabel.textContent=text('音量','Volume');status.textContent=error?text('音乐未能播放，请点击重试。','Music could not play. Click to retry.'):!enabled?text('可选配乐 · 默认关闭','Optional soundtrack · off by default'):document.hidden?text('离开页面时暂停','Paused while this page is hidden'):desired<0?text('这一刻，音乐也忘词了。','Even the music forgot its line.'):pending?text('正在加载音乐…','Loading music…'):tracks[desired].title;}
    function sync(){const ticket=++generation;error=false;if(!enabled||document.hidden||desired<0){audio.pause();pending=false;paint();return;}if(current!==desired){audio.pause();audio.src='./assets/music/'+tracks[desired].file;current=desired;audio.load();}if(!audio.paused){pending=false;paint();return;}pending=true;paint();try{Promise.resolve(audio.play()).then(()=>{if(ticket!==generation)return;pending=false;paint();}).catch(()=>{if(ticket!==generation)return;enabled=false;pending=false;error=true;paint();});}catch{enabled=false;pending=false;error=true;paint();}}
    button.onclick=()=>{enabled=!enabled;sync();};slider.oninput=()=>{volume=Math.max(0,Math.min(.5,Number(slider.value)/100||0));audio.volume=volume;try{storage.setItem('theatre-music-volume',String(volume));}catch{}};
    audio.addEventListener('error',()=>{if(!enabled)return;++generation;enabled=false;pending=false;error=true;current=-1;audio.pause();paint();});
    document.addEventListener('visibilitychange',sync);
    function update(act,node,nextLang){lang=nextLang;const next=cue(act,node);if(desired!==next){desired=next;sync();}else paint();}
    paint();return {update,state:()=>({enabled,current,desired,volume})};
  }
  return {create,cue,tracks};
})();
if(typeof module!=='undefined')module.exports=TheatreMusic;
