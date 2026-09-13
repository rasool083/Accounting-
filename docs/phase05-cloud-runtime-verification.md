# Phase 0.5 — Real Google Apps Script Cloud Runtime Verification

## Status

The local contract/domain implementation is implemented and GitHub Actions is passing on the current main branch. Real Google Apps Script Cloud Runtime execution is **not yet verified**.

The repository now contains `cloud/Phase05_Runtime_Probe.gs` with three isolated probes:

- `p05RuntimeProbe_()` — returns Script ID, active user, timestamp, probe version and service availability.
- `p05ConcurrencyProbe_(opts)` — acquires a script lock, optionally holds it for a bounded interval, then releases it.
- `p05FailureRepairProbe_()` — isolated failure/repair state transition probe using Script Properties.

## Required external setup

1. Create or select a **Standard Google Cloud project** for the Apps Script project.
2. Associate the Apps Script project with that Standard project.
3. Enable the Apps Script API in the Cloud project.
4. Configure OAuth authorization for the calling test client.
5. Create a versioned **API Executable** deployment of the isolated probe script.
6. Run `p05RuntimeProbe_()` remotely and preserve the returned evidence.
7. Run two independent `p05ConcurrencyProbe_()` calls with a non-zero hold time and verify serialized lock acquisition.
8. Run `p05FailureRepairProbe_()` and preserve the `NEEDS_REPAIR` evidence.
9. After these runtime probes, execute the isolated failure/repair, append-only audit, ReceiptAllocation, reversal and reconciliation E2E suites against a disposable test workbook only.

## Gate rule

Do not mark Phase 0.5 as FINAL PASS until actual Cloud Runtime evidence exists for the above probes. Local Node.js tests and GitHub Actions are contract evidence, not substitutes for Cloud Runtime execution.

## Safety

Never use the production/live workbook for these probes. Use a disposable isolated test spreadsheet and test deployment.
