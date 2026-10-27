(function (root) {
  'use strict';
  function modPow(base, exponent, modulus) {
    if (modulus < 2n || exponent < 0n) throw new Error('Invalid modular exponentiation');
    let result = 1n;
    base %= modulus;
    while (exponent > 0n) {
      if (exponent & 1n) result = result * base % modulus;
      base = base * base % modulus;
      exponent >>= 1n;
    }
    return result;
  }
  function prime(n) {
    if (n < 2n) return false;
    if (n % 2n === 0n) return n === 2n;
    for (let i = 3n; i * i <= n; i += 2n) if (n % i === 0n) return false;
    return true;
  }
  function factors(n) {
    const out = [];
    for (let i = 2n; i * i <= n; i++) {
      if (n % i === 0n) { out.push(i); while (n % i === 0n) n /= i; }
    }
    if (n > 1n) out.push(n);
    return out;
  }
  function generator(g, q) { return factors(q - 1n).every(p => modPow(g, (q - 1n) / p, q) !== 1n); }
  function validate(raw, attack = false) {
    const names = { q: 'q', alpha: 'α', a: 'Alice’s private key', b: 'Bob’s private key', da: 'Darth’s key toward Alice', db: 'Darth’s key toward Bob' };
    const v = {};
    for (const k of attack ? ['q','alpha','a','b','da','db'] : ['q','alpha','a','b']) {
      if (!/^\d{1,10}$/.test(String(raw[k]).trim())) throw new Error(`${names[k]} must be a positive whole number (up to 10 digits).`);
      v[k] = BigInt(String(raw[k]).trim());
    }
    if (v.q < 3n || v.q > 1000000000n) throw new Error('Choose a prime q from 3 to 1,000,000,000 for this learning playground.');
    if (!prime(v.q)) throw new Error(`${v.q} is not prime. Try q = 23 or the chapter example q = 353.`);
    if (v.alpha < 2n || v.alpha >= v.q) throw new Error('The generator α must be at least 2 and less than q.');
    if (!generator(v.alpha,v.q)) throw new Error(`α = ${v.alpha} is not a primitive root of ${v.q}. Choose a generator, or load a preset.`);
    for (const k of attack ? ['a','b','da','db'] : ['a','b']) if (v[k] < 1n || v[k] >= v.q) throw new Error(`${names[k]} must be at least 1 and less than q (${v.q}).`);
    return v;
  }
  function exchange(v, attack = false) {
    const ya = modPow(v.alpha,v.a,v.q), yb = modPow(v.alpha,v.b,v.q);
    const toA = attack ? modPow(v.alpha,v.da,v.q) : yb;
    const toB = attack ? modPow(v.alpha,v.db,v.q) : ya;
    return {ya,yb,toA,toB,ka:modPow(toA,v.a,v.q),kb:modPow(toB,v.b,v.q),dka:attack?modPow(ya,v.da,v.q):null,dkb:attack?modPow(yb,v.db,v.q):null};
  }
  const api = {modPow,prime,factors,generator,validate,exchange};
  if (typeof module !== 'undefined') module.exports = api;
  root.DH = api;
})(globalThis);
