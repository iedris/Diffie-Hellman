# Keyspace

A buildless Diffie–Hellman teaching website based on the supplied Chapter 10 material. The dark interface centers on two people, each with a large private-key box. Open `dist/index.html` directly, or serve `dist` using `python -m http.server 5173 --directory dist`.

- Enter a prime q, a primitive root α, and both private exponents.
- Use Start exchange, the next-step button, or the four step buttons to explore an exchange.
- Man-in-the-middle mode gives Darth two private exponents and shows substitution and both shared secrets.
- Examples and practice are under a collapsible panel. Test yourself hides final answers until a correct answer or Reveal.
- The chapter preset gives YA = 40, YB = 248, and K = 160.

All calculations run locally using JavaScript BigInt. Values are limited to q ≤ 1,000,000,000 so exact primality and primitive-root checks remain responsive. The app is an educational simulation, not a real cryptographic messaging implementation. No keys are uploaded or stored. The optional Google Fonts stylesheet falls back to local fonts when offline.

Run `node test-math.cjs` for mathematical verification.
