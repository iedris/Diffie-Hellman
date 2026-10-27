# Keyspace — Diffie–Hellman Lab

A simple, interactive way to understand Diffie–Hellman key exchange. Enter shared parameters and a private key for Alice and Bob, then watch their public keys travel and their shared secret appear.

**[Open the live website](https://keyspace-diffie-hellman-lab.zanystone515.chatgpt.site)**

- Dark interface with a separate private-key box for each person.
- Automatic playback and individual exchange steps.
- Optional man-in-the-middle simulation showing Darth's two key exchanges.
- Chapter examples, exact calculations, and practice answers.

## Run locally

Open `keyspace/dist/index.html` in a browser, or serve the website from the repository root:

```sh
python -m http.server 5173 --directory keyspace/dist
```

Then open http://localhost:5173.

## Verify the calculations

With Node.js installed:

```sh
node keyspace/test-math.cjs
```

The chapter example (`q = 353`, `α = 3`, private keys `97` and `233`) gives public keys `40` and `248`, and the shared secret `160`.

The site is static HTML, CSS, and JavaScript. It has no build step or server dependencies. All calculations run in the browser using `BigInt`; keys are not uploaded or stored. Small numbers are used for education, not real cryptographic communication.
