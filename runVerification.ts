import { runSecurityVerificationSuite } from './securityVerification';
import { runPhase2H7aVerificationSuite } from './phase2h7a_auth_hardening.test';
import { runPhase2H7bVerificationSuite } from './phase2h7b_error_resilience.test';
import { runPhase2H7cVerificationSuite } from './phase2h7c_security_headers.test';
import { runPhase2H7dVerificationSuite } from './phase2h7d_audit_chain.test';
import { runPhase2H7eVerificationSuite } from './phase2h7e_lifecycle.test';
import { runPhase2H7fVerificationSuite } from './phase2h7f_durable_audit.test';
import { runPhase2H7gVerificationSuite } from './phase2h7g_observability.test';
import { runPhase2H7hVerificationSuite } from './phase2h7h_finalHardening.test';

console.log('--- STARTING VERIFICATION SUITE ---');
const baselineResults = runSecurityVerificationSuite();
const phase2h7aResults = runPhase2H7aVerificationSuite();
const phase2h7bResults = runPhase2H7bVerificationSuite();
const phase2h7cResults = runPhase2H7cVerificationSuite();
const phase2h7dResults = runPhase2H7dVerificationSuite();
const phase2h7eResults = runPhase2H7eVerificationSuite();
const phase2h7fResults = runPhase2H7fVerificationSuite();
const phase2h7gResults = runPhase2H7gVerificationSuite();
const phase2h7hResults = runPhase2H7hVerificationSuite();

const allResults = [
  ...baselineResults, 
  ...phase2h7aResults, 
  ...phase2h7bResults,
  ...phase2h7cResults,
  ...phase2h7dResults,
  ...phase2h7eResults,
  ...phase2h7fResults,
  ...phase2h7gResults,
  ...phase2h7hResults,
];
const passed = allResults.filter(r => r.passed);
const failed = allResults.filter(r => !r.passed);

console.log(`BASELINE SCENARIOS (1–322): ${baselineResults.length} / ${baselineResults.filter(r => r.passed).length} PASSED`);
console.log(`PHASE 2H-7A SCENARIOS (323–332): ${phase2h7aResults.length} / ${phase2h7aResults.filter(r => r.passed).length} PASSED`);
console.log(`PHASE 2H-7B SCENARIOS (333–345): ${phase2h7bResults.length} / ${phase2h7bResults.filter(r => r.passed).length} PASSED`);
console.log(`PHASE 2H-7C SCENARIOS (346–363): ${phase2h7cResults.length} / ${phase2h7cResults.filter(r => r.passed).length} PASSED`);
console.log(`PHASE 2H-7D SCENARIOS (364–378): ${phase2h7dResults.length} / ${phase2h7dResults.filter(r => r.passed).length} PASSED`);
console.log(`PHASE 2H-7E SCENARIOS (379–390): ${phase2h7eResults.length} / ${phase2h7eResults.filter(r => r.passed).length} PASSED`);
console.log(`PHASE 2H-7F SCENARIOS (391–405): ${phase2h7fResults.length} / ${phase2h7fResults.filter(r => r.passed).length} PASSED`);
console.log(`PHASE 2H-7G SCENARIOS (406–420): ${phase2h7gResults.length} / ${phase2h7gResults.filter(r => r.passed).length} PASSED`);
console.log(`PHASE 2H-7H SCENARIOS (421–435): ${phase2h7hResults.length} / ${phase2h7hResults.filter(r => r.passed).length} PASSED`);
console.log(`TOTAL SCENARIOS: ${allResults.length}`);
console.log(`PASSED: ${passed.length}`);
console.log(`FAILED: ${failed.length}`);

if (failed.length > 0) {
  console.error('Failed Scenarios Details:', JSON.stringify(failed, null, 2));
  process.exit(1);
} else {
  console.log('ALL SCENARIOS PASSED WITH 100% SUCCESS RATE.');
  process.exit(0);
}
