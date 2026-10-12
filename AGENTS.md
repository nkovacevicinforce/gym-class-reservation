# Agent Guidelines

## Source of Truth

- Read [requirements/REQUIREMENTS.md](requirements/REQUIREMENTS.md) before changing business behavior. Do not invent features or change the BRD to fit an implementation.
- See [README.md](README.md) for setup, file responsibilities, and availability lifetime. Keep the project beginner-friendly and dependency-free; do not add a framework, backend, database, or external API.
- Respect the requested phase: analysis-only requests do not authorize implementation or file changes.

## Architecture and Pitfalls

- Keep application code in the existing three `src/` files. Preserve direct browser opening of [src/index.html](src/index.html): no build step, fetched data files, or browser module imports requiring a server.
- Follow [src/app.js](src/app.js): two-space indentation, double-quoted JavaScript strings, and small functions. Keep business rules independent of DOM access; preserve the guarded CommonJS exports for tests and guarded browser initialization.
- Treat `CLASS_CATALOG` as the unchanged baseline; mutate only the state's remaining-place map. Do not use browser storage: even `sessionStorage` survives refresh and violates the required reset.
- Starting another reservation clears the draft/result, not availability. Fresh loads and restored browser-history pages reset availability; do not introduce cross-tab synchronization.
- Validate again inside `confirmReservation`; disabled controls are not the business-rule guard. Deduct only after explicit valid confirmation, once per draft, and preserve the confirmed snapshot.
- Preserve dependent-selection resets: class changes clear session/count; session changes clear count. Derive the review and total from state rather than maintaining duplicate mutable values.

## Verification

- No install or build command is needed. Run `node --test tests/reservation.test.js` from the repository root (Node.js 18+).
- Extend [tests/reservation.test.js](tests/reservation.test.js) for changed business behavior using the existing built-in `node:test` and assertion patterns; do not add a test framework.
- For UI changes, use [tests/ACCEPTANCE.md](tests/ACCEPTANCE.md). Verify the full flow and refresh reset, keyboard focus, narrow-screen text fit, and that review precedes confirmation. Check selected dropdown text for clipping, not just page overflow.
- If `node` is unavailable on Windows, the installed VS Code runtime was verified as a dependency-free fallback. Use it only if the executable exists, and restore the environment afterward:

```powershell
$previousNodeMode = $env:ELECTRON_RUN_AS_NODE
try {
  $env:ELECTRON_RUN_AS_NODE = '1'
  & "$env:ProgramFiles\Microsoft VS Code\Code.exe" --test tests/reservation.test.js
} finally {
  $env:ELECTRON_RUN_AS_NODE = $previousNodeMode
}
```

## Communication

- Explain decisions in beginner-friendly terms and distinguish BRD requirements from recommendations.
- When proposing UI improvements, provide exactly four suggestions labeled `UI-1`, `UI-2`, `UI-3`, and `UI-4`.
- Report which checks actually ran and disclose any unverified behavior; do not treat previous test results as verification of new changes.