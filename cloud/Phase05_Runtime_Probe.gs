/** Phase 0.5 real Google Apps Script Cloud Runtime probe.
 * This file is intentionally isolated from the operational workbook.
 * Run p05RuntimeProbe_ first, then launch two p05ConcurrencyProbe_ calls close together.
 */
function p05RuntimeProbe_() {
  return {
    ok: true,
    probeVersion: 'phase05-cloud-probe-1.0',
    scriptId: ScriptApp.getScriptId(),
    userEmail: Session.getActiveUser().getEmail() || '',
    timestamp: new Date().toISOString(),
    hasLockService: typeof LockService !== 'undefined',
    hasPropertiesService: typeof PropertiesService !== 'undefined',
    hasSpreadsheetApp: typeof SpreadsheetApp !== 'undefined',
    functions: ['p05RuntimeProbe_', 'p05ConcurrencyProbe_', 'p05FailureRepairProbe_']
  };
}

function p05ConcurrencyProbe_(opts) {
  opts = opts || {};
  var waitMs = Math.max(0, Number(opts.waitMs || 30000));
  var holdMs = Math.max(0, Math.min(10000, Number(opts.holdMs || 2000)));
  var started = Date.now();
  var lock = LockService.getScriptLock();
  lock.waitLock(waitMs);
  var acquired = Date.now();
  try {
    Utilities.sleep(holdMs);
    return {
      ok: true,
      acquired: lock.hasLock(),
      waitMs: acquired - started,
      holdMs: Date.now() - acquired,
      timestamp: new Date().toISOString()
    };
  } finally {
    lock.releaseLock();
  }
}

function p05FailureRepairProbe_() {
  var props = PropertiesService.getScriptProperties();
  var key = 'P05_PROBE_' + Utilities.getUuid();
  props.setProperty(key, 'PENDING');
  try {
    props.setProperty(key, 'EFFECT_WRITTEN');
    throw new Error('INJECTED_FAILURE');
  } catch (err) {
    props.setProperty(key, 'NEEDS_REPAIR');
    var status = props.getProperty(key);
    props.deleteProperty(key);
    return {ok: status === 'NEEDS_REPAIR', status: status};
  }
}
