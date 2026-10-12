# Gym Class Reservation

A small anonymous reservation demo built with HTML, CSS, and Vanilla JavaScript.
No framework, backend, database, external APIs, or dependencies are used.

## Run the application

Open [src/index.html](src/index.html) directly in your browser. No installation or
development server is needed. JavaScript must be enabled.

Choose a class, session, and participant count, review the summary, and confirm.
After confirmation, you can start another reservation. Remaining places are kept
in memory while the page stays open. Refreshing or freshly reopening the page
restores the initial availability. Returning to a restored page from browser
history also resets availability. Different tabs do not share reservations.

## Project structure
- requirements/ - project requirements
- src/ - application source code
- tests/ - project tests

The three source files have separate responsibilities:
- [src/index.html](src/index.html): reservation form, review, and confirmation.
- [src/styles.css](src/styles.css): responsive styling and focus/validation states.
- [src/app.js](src/app.js): catalog, in-memory state, validation, pricing, and rendering.

## Verify the application

Follow [tests/ACCEPTANCE.md](tests/ACCEPTANCE.md) for browser-based acceptance checks.
The business-rule tests use Node's built-in test runner, with no packages to install:

```sh
node --test tests/reservation.test.js
```

Node.js 18 or newer is needed only to run those automated tests, not the application.

## Project rules
- requirements/REQUIREMENTS.md is the source of truth.
- Do not invent undocumented requirements.
- Application code belongs in src/.