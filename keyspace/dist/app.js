'use strict';
const $ = id => document.getElementById(id);
const inputs = ['q','alpha','a','b','da','db'];
const presets = {
  chapter:{q:'353',alpha:'3',a:'97',b:'233',da:'11',db:'17'},
  small:{q:'23',alpha:'5',a:'6',b:'15',da:'7',db:'9'},
  tiny:{q:'7',alpha:'3',a:'3',b:'4',da:'2',db:'5'}
};
let stage = 0, attack = false, timer = null, revealed = false, result = null, values = null;
const raw = () => Object.fromEntries(inputs.map(k=>[k,$(k).value]));
const text = (id,value) => { $(id).textContent = value; };
const expression = (base,exponent,modulus,result) => `${base}<sup>${exponent}</sup> mod ${modulus}${result === undefined ? '' : ` = <b>${result}</b>`}`;
const hiddenAnswer = () => $('practice').checked && !revealed;
function stop() { clearInterval(timer); timer=null; text('play',stage===3?'↺ Run again':'▶ Start exchange'); $('play').setAttribute('aria-label',stage===3?'Run exchange again':'Start exchange'); }
function compute() {
  try {
    values = DH.validate(raw(),attack);
    result = DH.exchange(values,attack);
    $('validation').hidden = true;
    inputs.forEach(k=>$(k).removeAttribute('aria-invalid'));
    return true;
  } catch (error) {
    result=null; values=null; stage=0; stop();
    text('validation',error.message); $('validation').hidden = false;
    return false;
  }
}
function mathContent() {
  if (!values || !result) { text('math-content','Enter valid parameters to explore the math.'); return; }
  const v=values,r=result;
  const equations = factorsText(v.q);
  const safeAnswer = n => hiddenAnswer() ? '?' : n;
  $('math-content').innerHTML = `
    <div class="math-step math-wide"><h4>01 / A prime and a generator</h4><code>q = ${v.q}, α = ${v.alpha}</code><p>q is prime. To check that α is a primitive root, factor q − 1 and check α<sup>(q−1)/p</sup> ≠ 1 mod q for every distinct prime factor p.</p><code>${equations}</code></div>
    <div class="math-step"><h4>02 / Alice’s public key</h4><code>Y<sub>A</sub> = ${expression(v.alpha,v.a,v.q,stage>=1?r.ya:'?')}</code><p>Only this result travels. X<sub>A</sub> stays with Alice.</p></div>
    <div class="math-step"><h4>02 / Bob’s public key</h4><code>Y<sub>B</sub> = ${expression(v.alpha,v.b,v.q,stage>=1?r.yb:'?')}</code><p>Only this result travels. X<sub>B</sub> stays with Bob.</p></div>
    ${attack ? `<div class="math-step math-wide"><h4>03 / Darth replaces the public keys</h4><code>To Alice: Y<sub>DA</sub> = ${expression(v.alpha,v.da,v.q,stage>=2?r.toA:'?')}</code><code>To Bob: Y<sub>DB</sub> = ${expression(v.alpha,v.db,v.q,stage>=2?r.toB:'?')}</code><p>Alice receives Darth’s key instead of Bob’s. Bob receives Darth’s key instead of Alice’s.</p></div>` : '<div class="math-step math-wide"><h4>03 / Exchange public values</h4><p>Alice receives Y<sub>B</sub>. Bob receives Y<sub>A</sub>. The private exponents are never sent.</p></div>'}
    <div class="math-step"><h4>04 / Alice’s secret</h4><code>K<sub>A</sub> = ${stage>=2?expression(r.toA,v.a,v.q,stage>=3?safeAnswer(r.ka):'?'):'(received key)<sup>XA</sup> mod q'}</code>${attack && stage>=3 && !hiddenAnswer()?`<code>Darth: ${expression(r.ya,v.da,v.q,r.dka)}</code>`:''}<p>${attack?'Alice shares this with Darth.':'Alice uses her own private key and Bob’s public key.'}</p></div>
    <div class="math-step"><h4>04 / Bob’s secret</h4><code>K<sub>B</sub> = ${stage>=2?expression(r.toB,v.b,v.q,stage>=3?safeAnswer(r.kb):'?'):'(received key)<sup>XB</sup> mod q'}</code>${attack && stage>=3 && !hiddenAnswer()?`<code>Darth: ${expression(r.yb,v.db,v.q,r.dkb)}</code>`:''}<p>${attack?'Bob shares this with Darth.':'Bob uses his own private key and Alice’s public key.'}</p></div>
    <div class="math-step math-wide"><h4>${attack?'Why the attack works':'Why the keys match'}</h4><p>${attack?'The public keys are unauthenticated. Darth computes each shared secret using the intercepted public key and the private exponent for that side. Even if the two secrets happen to match numerically, Darth still knows them. Verified signatures and certificates bind a key exchange to the intended identity.':'(α<sup>XB</sup>)<sup>XA</sup> ≡ (α<sup>XA</sup>)<sup>XB</sup> ≡ α<sup>XA × XB</sup> (mod q). Both sides do the same multiplication in the exponent, in a different order.'}</p><p>These small numbers are for learning. Real systems use vetted groups, large parameters, authentication, and a key derivation function.</p></div>`;
}
function factorsText(q) { return DH.factors(q-1n).map(p=>`p=${p}: ${DH.modPow(values.alpha,(q-1n)/p,q)} ≠ 1`).join(' · '); }
function render() {
  const valid=!!result;
  const r=result,v=values;
  const hide=hiddenAnswer();
  $('exchange-grid').classList.toggle('exchanged',stage===2);
  $('lab').classList.toggle('attack-active',attack);
  $('classic-channel').hidden=attack; $('attacker').hidden=!attack;
  $('normal-mode').classList.toggle('selected',!attack); $('attack-mode').classList.toggle('selected',attack);
  $('normal-mode').setAttribute('aria-pressed',String(!attack)); $('attack-mode').setAttribute('aria-pressed',String(attack));
  $('channel-label').innerHTML=attack?'<i class="status-dot" style="background:#b17a57"></i> CHANNEL COMPROMISED <span class="subtle">/ Darth replaces public keys</span>':'<i class="status-dot"></i> PUBLIC CHANNEL <span class="subtle">/ private keys stay with their owner</span>';
  text('display-q',v?v.q:'—'); text('display-alpha',v?v.alpha:'—');
  for (const side of ['a','b']) {
    const isA=side==='a', x=v?.[side], pub=isA?r?.ya:r?.yb, received=isA?r?.toA:r?.toB, key=isA?r?.ka:r?.kb;
    text(`public-${side}`,stage>=1&&valid?pub:'—');
    $(`public-formula-${side}`).innerHTML=v?expression(v.alpha,x,v.q):'α<sup>X</sup> mod q';
    text(`received-${side}`,stage>=2&&valid?`${isA?'←':'→'} Received ${attack?'Darth’s replacement':isA?'Bob’s YB':'Alice’s YA'} = ${received}`:`${isA?'←':'→'} Waiting for ${isA?'Bob':'Alice'}’s public key`);
    text(`secret-${side}`,stage>=3&&valid?(hide?'•••':key):'?');
    $(`secret-formula-${side}`).innerHTML=stage>=3&&valid?expression(received,x,v.q):'The secret will appear here';
    $(`secret-block-${side}`).classList.toggle('done',stage===3&&valid&&!hide);
  }
  text('packet-a',stage>=1&&valid?`YA = ${r.ya}`:'YA');text('packet-b',stage>=1&&valid?`YB = ${r.yb}`:'YB');
  const titles=['Ready to connect','Public keys ready','Exchanging keys…','Secrets match'];
  const descriptions=['Only public keys travel.','Each person has a public key.','Private keys stay with their owner.','The secret was never sent.'];
  text('channel-title',titles[stage]);$('channel-description').innerHTML=descriptions[stage];
  text('connection-symbol',stage===3?'✓':'↔');text('channel-badge',stage===3?'KEY AGREEMENT COMPLETE':'OPEN CHANNEL');
  $('forged-keys').innerHTML=stage>=1&&valid?`To Alice: Y<sub>DA</sub> = ${r.toA}<br>To Bob: Y<sub>DB</sub> = ${r.toB}`:'Two identities. Two key exchanges.';
  $('attacker-secrets').hidden=stage<3||!valid;
  if(stage===3&&valid) $('attacker-secrets').innerHTML=hide?'Darth knows both secrets.<br>Check your calculation below.':`With Alice: <b>${r.dka}</b><br>With Bob: <b>${r.dkb}</b>`;
  $('outcome').hidden=stage<3||!valid;
  if(stage===3&&valid) {
    const weak=Object.values(attack?{a:v.a,b:v.b,da:v.da,db:v.db}:{a:v.a,b:v.b}).some(x=>x===v.q-1n);
    $('outcome').innerHTML=attack?`<b>⌁ &nbsp; Darth is in the middle.</b> ${hide?'Calculate Alice’s secret below.':`Alice ↔ Darth: <b>${r.ka}</b> &nbsp; · &nbsp; Darth ↔ Bob: <b>${r.kb}</b>.`} Darth can derive both secrets without knowing Alice’s or Bob’s private key.${r.ka===r.kb?' These values happen to match, but the attacker still knows both.':''}`:`<b>✓ &nbsp; It’s a match.</b> ${hide?'Both calculations agree. Can you find the secret?':`Alice and Bob independently calculated <b>K = ${r.ka}</b>.`} The secret never crossed the channel.`;
    if(weak) $('outcome').innerHTML+='<br>Learning note: a private exponent of q − 1 produces the trivial public key 1. Choose a smaller exponent for a more useful example.';
  }
  document.querySelectorAll('[data-step]').forEach(button=>{const n=Number(button.dataset.step);button.classList.toggle('current',n===stage);button.classList.toggle('complete',n<stage);button.setAttribute('aria-current',n===stage?'step':'false');button.disabled=!valid;});
  const nextLabels=['Public keys','Send keys','Find secret','Reset'];
  $('next').innerHTML=`${nextLabels[stage]} <span>${stage===3?'↺':'→'}</span>`; $('next').disabled=!valid; $('play').disabled=!valid;
  const captions=attack?['Enter the keys. Darth has a private key for each side.','Everyone calculates a public key.','Darth intercepts and replaces both public keys.','Darth now knows a secret with each person.']:['Enter the private keys, then start the exchange.','Public keys = α raised to each private key, modulo q.','Alice and Bob send their public keys to each other.','Both calculate the same secret using their private keys.'];
  text('step-caption',captions[stage]);
  if(!timer) { text('play',stage===3?'↺ Run again':'▶ Start exchange'); $('play').setAttribute('aria-label',stage===3?'Run exchange again':'Start exchange'); }
  $('practice-form').hidden=!$('practice').checked||stage!==3||!valid;
  text('practice-question',attack?'What secret does Alice share with Darth?':'What shared secret did Alice calculate?');
  mathContent();
}
function clearPractice(){revealed=false;$('guess').value='';text('practice-feedback','');}
function reset(validate=true){stop();stage=0;clearPractice();if(validate)compute();render();}
function go(n){if(!compute()){render();return;}stage=n;clearPractice();render();}
inputs.forEach(k=>$(k).addEventListener('input',()=>{$('preset').value='custom';reset();}));
$('preset').addEventListener('change',()=>{const p=presets[$('preset').value];if(p){inputs.forEach(k=>$(k).value=p[k]);reset();}});
function setAttack(value){attack=value;reset();}
$('normal-mode').addEventListener('click',()=>setAttack(false)); $('attack-mode').addEventListener('click',()=>setAttack(true));
$('try-attack').addEventListener('click',()=>{setAttack(true);$('lab').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});});
$('randomize').addEventListener('click',()=>{
  const choices=[{q:23,alpha:5},{q:47,alpha:5},{q:59,alpha:2},{q:83,alpha:2},{q:107,alpha:2},{q:353,alpha:3}];
  const p=choices[Math.floor(Math.random()*choices.length)]; $('q').value=p.q;$('alpha').value=p.alpha;
  for(const k of ['a','b','da','db']) $(k).value=String(2+Math.floor(Math.random()*(p.q-3)));
  $('preset').value='custom';reset();
});
$('next').addEventListener('click',()=>{stop();go((stage+1)%4);});
$('reset').addEventListener('click',()=>reset());
document.querySelectorAll('[data-step]').forEach(button=>button.addEventListener('click',()=>{stop();go(Number(button.dataset.step));}));
$('play').addEventListener('click',()=>{
  if(timer){stop();return;}
  if(!compute()){render();return;}
  if(stage===3) stage=0;
  clearPractice();
  stage=Math.min(stage+1,3);
  render();
  if(stage===3){stop();return;}
  text('play','Ⅱ Pause');$('play').setAttribute('aria-label','Pause playback');
  timer=setInterval(()=>{stage++;render();if(stage>=3)stop();},1700);
});
$('practice').addEventListener('change',()=>{clearPractice();render();});
$('practice-form').addEventListener('submit',event=>{
  event.preventDefault();
  if(!result)return;
  const guess=$('guess').value.trim();
  if(!/^\d{1,10}$/.test(guess)){text('practice-feedback','Enter a whole number to check your answer.');return;}
  if(BigInt(guess)===result.ka){revealed=true;text('practice-feedback','✓ Correct! You found the shared secret. The full calculations are now visible.');render();}
  else text('practice-feedback',`Not quite. Use the received public key (${result.toA}) raised to Alice’s private key (${values.a}), modulo ${values.q}. Try again.`);
});
$('reveal').addEventListener('click',()=>{revealed=true;render();text('practice-feedback','Answer revealed. Open “Behind the math” to follow both calculations.');});
reset();
