# Nursing Home Simulation

An agent-based model of airborne COVID-19 and influenza in a nursing home of 112 residents, with and without far-UVC
lamps. It builds to a single HTML page with a narrated explanation and an interactive simulator.

- Live page: https://claude.ai/artifact/5vaQcyk4uZJ3grQehrumGg
- Build: `node web/build.mjs` (Node 22 or later), then open `dist/publish/index.html`
- Tests: `npm test`
- How the project is organised, how to regenerate its data and what is undecided: `CLAUDE.md`
- The full decision log: `NOTES.md`

Lamp calculations use [Illuminate](https://github.com/jvbelenky/guv-calcs/) from OSLUV.
