'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs');const p=require('./web/play/presentation');
assert.equal(p.direction('bar','e',1,'bar').expression,1);
assert.equal(p.direction('steal','e',1,'outside').expression,2);
assert(p.direction('cupAsk','c',2,'press').closeup);
assert.equal(p.direction('opening','n',3,'press').background,2);
for(const actor of ['c','e','k'])for(let expression=0;expression<3;expression++){assert(p.sprite(actor,expression).includes(`data-expression="${expression}"`));assert(p.sprite(actor,expression).includes(`--column:${expression*50}%`));}
for(let act=1;act<=3;act++)assert(p.stage({node:'start',actor:'n',act,scene:'memo'}).includes(`scene-${act-1}`));
assert(!p.stage({node:'steal',actor:'e',act:1,scene:'outside'}).includes('data-actor="e"'));
assert(p.stage({node:'cupAsk',actor:'c',act:2,scene:'press'}).includes('cast closeup'));
for(const path of ['web/play/assets/actors-v1.png','web/play/assets/scenes-v1.png'])assert(fs.statSync(path).size>10000);
console.log('PASS: 9 atlas expressions, 3 backgrounds, closeups and border-crossing actor placement.');
