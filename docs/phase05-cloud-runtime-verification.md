# Phase 0.5 — Cloud Runtime Verification

## Status

The local contract/domain implementation is in the repository, but real Google Apps Script Cloud Runtime execution is **not yet verified**.

The repository now contains `apps-script/Phase05_RuntimeProbe.gs` with two isolated probes:

- `p05RuntimeProbe_()` — returns Script ID, active user, timestamp and probe version.
- `p05ConcurrencyProbe_(opts)` — acquires a script lock, optionally holds it for a bounded interval, then releases it.

## Required external setup

1. Create or select a **Standard Google Cloud project** for the Apps Script project.
2. Associate the Apps Script project with that Standard project.
3. Enable the Apps Script API in the Cloud project.
4. Enable/configure OAuth as required by the calling test client.
5. Create a versioned **API Executable** deployment of the isolated probe script.
6. Execute `p05RuntimeProbe_()` remotely and preserve the returned evidence.
7. Run two concurrent `p05ConcurrencyProbe_()` calls with a non-zero hold time and verify serialized lock acquisition.
8. After runtime verification, execute the isolated failure/repair, audit, ReceiptAllocation and end-to-end suites against a test workbook only.

## Gate rule

Do not mark Phase 0.5 as FINAL PASS until the above Cloud Runtime evidence exists. Local Node.js tests are useful contract evidence but are not equivalent to Apps Script Cloud Runtime execution.

## Safety

Never use the production/live workbook for these probes. Use a disposable isolated test spreadsheet and test deployment.
