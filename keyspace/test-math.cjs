const assert = require('node:assert/strict');
const DH = require('./dist/math.js');
const chapter = DH.validate({q:'353',alpha:'3',a:'97',b:'233',da:'11',db:'17'},true);
const normal = DH.exchange(chapter);
assert.deepEqual([normal.ya,normal.yb,normal.ka,normal.kb],[40n,248n,160n,160n]);
const attacked = DH.exchange(chapter,true);
assert.equal(attacked.ka,attacked.dka);assert.equal(attacked.kb,attacked.dkb);
assert.notEqual(attacked.ka,attacked.kb);
assert.equal(DH.modPow(5n,6n,23n),8n);
for(const q of [3n,7n,23n,47n,59n,83n,107n,353n]){
  const g = q===3n?2n:q===7n?3n:q===23n||q===47n?5n:q===353n?3n:2n;
  assert(DH.prime(q));assert(DH.generator(g,q));
  for(let a=1n;a<q;a+=7n)for(let b=1n;b<q;b+=11n){const r=DH.exchange({q,alpha:g,a,b});assert.equal(r.ka,r.kb);}
}
for(const raw of [{q:'9'}, {alpha:'4'}, {a:'353'}, {a:'-1'}, {b:'1.5'}, {q:'1000000001'}, {q:'1e3'}, {q:''}]) assert.throws(()=>DH.validate({...Object.fromEntries(Object.entries(chapter).map(([k,v])=>[k,String(v)])),...raw}));
// Large products exceed Number's exact integer range; compare against independent linear multiplication.
let expected=1n;for(let i=0;i<123;i++)expected=expected*98765431n%999999937n;
assert.equal(DH.modPow(98765431n,123n,999999937n),expected);
console.log('PASS: chapter example, MITM agreement on each leg, generators, input validation, exact large-integer arithmetic, and 1,500+ key agreements.');
