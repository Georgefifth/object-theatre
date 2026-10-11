'use strict';
var TheatrePresentation=(()=>{
 const actors={c:{name:['杯子','Cup'],row:'0%',height:'266.80851%'},e:{name:['橡皮','Eraser'],row:'54.39815%',height:'321.53846%'},k:{name:['钥匙','Key'],row:'100%',height:'318.27411%'}};
 const shocked=new Set(['bar','key','jpg','horror2','director','cupTry','cupPartner2','playerFreeze','break','opening']);
 const pleased=new Set(['invite','ceo','ceo3','court3','steal','silence','adjectives','cupRewrite2','cupRescue','keyRescue','keySkill','eraserRescue','showCup','showKey','showEraser','actorFinal','returnPlay']);
 const closeups=new Set(['cupAsk','cupTry','cupPartner2','cupRewrite2','keyWant','keyJoke2','keyCover2','keyDance2','keyKeeper2','eraserDraft','eraserOwn','eraserTogether2','eraserRescue','showEraser','teaFinal']);
 const reactions={playerFreeze:{c:1,e:1,k:1},hr:{e:1,c:2},ceo2:{e:1,k:0},horror2:{c:1,e:2},horror3:{c:1,e:2},court3:{k:2,e:2},director:{c:2,e:0},cupPartner:{c:1,e:2},cupPartner2:{c:2},keyDance:{k:2,c:0,e:2},audience:{e:2,k:2},returnDone:{c:0,e:2}};
 function direction(node,actor,act,scene){const expression=shocked.has(node)?1:pleased.has(node)?2:0;return {actor:actors[actor]?actor:null,expression,closeup:closeups.has(node),background:['teaEnd','teaFinal','returnDone','lastChoice'].includes(node)?1:act===2?1:act===3?2:0,scene,reactions:reactions[node]||{}};}
 function sprite(id,expression=0,extra=''){const a=actors[id];return `<div class="actor-sprite ${extra}" data-actor="${id}" data-expression="${expression}" style="--column:${expression*50}%;--row:${a.row};--sheet-height:${a.height}" aria-hidden="true"></div>`;}
 function stage({node,actor,act,scene,lang=0}){const d=direction(node,actor,act,scene);const label=[['试镜小舞台','Audition stage'],['收工后的夜宵桌','After-rehearsal table'],['正式演出的剧场','Opening-night theatre']][d.background][lang];let html=`<div class="scene-backdrop scene-${d.background}" aria-hidden="true"></div><div class="scene-location">${label}</div><div class="cast ${d.closeup?'closeup':''}" data-focus="${d.actor||''}">`;
 for(const id of ['c','e','k']){if(id==='e'&&['outside','bar'].includes(scene))continue;const expression=d.reactions[id]??(id===d.actor?d.expression:0);html+=sprite(id,expression,`slot-${id} ${id===d.actor?'speaking':''}`);}
 return html+'</div>';}
 function describe({node,actor,act,scene,lang=0}){const d=direction(node,actor,act,scene);const bg=[['试镜舞台。','Audition stage. '],['夜宵桌。','Midnight snack table. '],['正式演出剧场。','Opening-night theatre. ']][d.background][lang];if(!d.actor)return bg;return bg+actors[d.actor].name[lang]+(d.closeup?['的特写，',' in close-up, '][lang]:['正在说话，',' is speaking, '][lang])+[['平常表情。','deadpan expression. '],['惊讶表情。','shocked expression. '],['得意表情。','triumphant expression. ']][d.expression][lang];}
 return {direction,sprite,stage,describe};
})();
if(typeof module!=='undefined')module.exports=TheatrePresentation;
