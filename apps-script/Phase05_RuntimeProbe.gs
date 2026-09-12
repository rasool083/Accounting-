'use strict';

/** Phase 0.5 Cloud Runtime probes.
 * These functions are intentionally side-effect-light and are for isolated test deployments.
 * Do not point them at the live operational workbook.
 */
function p05RuntimeProbe_() {
  return {
    ok: true,
    probeVersion: 'phase05-cloud-probe-1.0',
    scriptId: ScriptApp.getScriptId(),
    userEmail: Session.getActiveUser().getEmail() || '',
    timestamp: new Date().toISOString(),
    functions: ['p05RuntimeProbe_', 'p05ConcurrencyProbe_'],
    note: 'Cloud Runtime probe only; no financial or inventory mutation.'
  };
}

function p05ConcurrencyProbe_(opts) {
  opts = opts || {};
  var waitMs = Math.max(0, Number(opts.waitMs || 0));
  var holdMs = Math.min(10000, Math.max(0, Number(opts.holdMs || 0)));
  var lock = LockService.getScriptLock();
  var started = Date.now();
  lock.waitLock(Math.max(1000, waitMs + 1000));
  var acquired = Date.now();
  try {
    if (holdMs) Utilities.sleep(holdMs);
    return {
      ok: true,
      probeVersion: 'phase05-cloud-probe-1.0',
      waitMs: acquired - started,
      holdMs: holdMs,
      acquiredAt: new Date(acquired).toISOString(),
      releasedAt: new Date().toISOString()
    };
  } finally {
    lock.releaseLock();
  }
}
