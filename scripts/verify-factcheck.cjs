/* INS-01..04 regression. Run: node scripts/verify-factcheck.cjs
 * Sources: FSC /po010101/86831 (2026-05-06), /po020201/84975 Q10;
 * NHIS 2026 notice reproduced by KHA articleNo=46119.
 * Annual inputs contain only eligible costs; non-covered exclusions are prefiltered.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const sandbox = { module: { exports: {} } };
vm.runInNewContext(fs.readFileSync(path.join(root, 'js/insure.js'), 'utf8'), sandbox);
const INS = sandbox.module.exports;
let checks = 0;
function near(actual, expected, label) { checks++; assert.ok(Math.abs(actual - expected) < 1e-6, `${label}: ${actual} != ${expected}`); }
const gen5 = INS.SILSON.find(g => g.gen === 5);
assert.equal(gen5.plan, false); assert.equal(gen5.period, '2026.5.6~'); checks += 2;
// A single institution has separate general-contract and accident-benefit limits.
near(INS.protectInsurance(80e6, 50e6).protected, 130e6, 'separate limits');
near(INS.protectInsurance(120e6, 110e6).protected, 200e6, 'both categories capped');
near(INS.protectInsurance(120e6, 110e6).unprotected, 30e6, 'excess remains outside');
near(INS.protectInsurance(0, 0).protected, 0, 'empty holdings');
const caps = [90, 112, 112, 173, 173, 326, 326, 446, 536, 843].map(x => x * 1e4);
caps.forEach((cap, i) => {
 near(INS.NHIS.capByDecile[i], cap, `2026 decile ${i+1}`);
 near(INS.cap(cap - 1, i+1).refund, 0, 'below cap');
 near(INS.cap(cap + 1e6, i+1).refund, 1e6, 'above cap');
});
near(INS.cap(504e4, 7).refund, 178e4, 'manuscript annual refund');
function med(options) { return INS.medical({ gen: 5, cost: 0, nonCov: 0, ...options }); }
// Official worked example: gross covered fee 500k, NHIS pays 300k, insurance 120k.
near(med({ cost: 500000, setting: 'hospital' }).silson, 120000, 'FSC outpatient worked example');
near(med({ cost: 100000, setting: 'clinic' }).oop, 10000, 'clinic minimum');
near(med({ cost: 50000, setting: 'general' }).oop, 20000, 'general minimum');
near(med({ cost: 100000, setting: 'hospital', nhisRate: .05 }).oop, 5000, 'deductible cannot exceed eligible cost');
near(med({ cost: 1e6, setting: 'hospital', nhisRate: .05 }).oop, 10000, '20 percent floor at low NHIS rate');
near(med({ cost: 100000, nonCov: 1, mild: 1, setting: 'clinic' }).silson, 50000, 'mild outpatient 50k deduction');
near(med({ cost: 80000, nonCov: 1, mild: 1, setting: 'clinic' }).oop, 50000, 'mild minimum beats percent');
near(med({ cost: 1e6, nonCov: 1, mild: 1, setting: 'clinic' }).silson, 200000, 'mild daily limit');
near(med({ cost: 1e6, nonCov: 1, mild: 0, setting: 'clinic' }).silson, 200000, 'severe per-visit limit');
near(med({ cost: 30e6, nonCov: 1, mild: 0, setting: 'inpatient', hospital: 'general' }).oop, 5e6, 'general severe inpatient cap');
near(med({ cost: 30e6, nonCov: 1, mild: 0, setting: 'inpatient', hospital: 'tertiary' }).oop, 5e6, 'tertiary severe inpatient cap');
near(med({ cost: 30e6, nonCov: 1, mild: 0, setting: 'inpatient', hospital: 'hospital' }).oop, 9e6, 'no severe cap in ordinary hospital');
near(med({ cost: 30e6, nonCov: 1, mild: 1, setting: 'inpatient', hospital: 'general' }).silson, 10e6, 'mild annual benefit limit');
near(med({ cost: 10e6, nonCov: 1, mild: 1, setting: 'inpatient', hospital: 'hospital' }).silson, 3e6, 'ordinary inpatient episode limit');
near(med({ cost: 60e6, nonCov: 1, mild: 0, setting: 'inpatient', hospital: 'general' }).oop, 10e6, 'cap does not remove losses beyond benefit limit');
// Repeated qualifying admissions share one annual deductible cap.
let self = 0, paid = 0, totalOop = 0;
for (let i=0; i<2; i++) {
 const r = med({cost: 10e6, nonCov: 1, mild: 0, setting: 'inpatient', hospital: 'general', severeSelfYtd: self, severePaidYtd: paid});
 self += r.silsonBreakdown.severeCappedDeductible; paid += r.silsonBreakdown.severePay; totalOop += r.oop;
}
near(self, 5e6, 'annual severe deductible'); near(totalOop, 5e6, 'two admissions share cap');
near(med({ cost: 1e6, nonCov: 1, mild: 0, setting: 'inpatient', hospital: 'general', severePaidYtd: 50e6, severeSelfYtd: 5e6 }).silson, 0, 'exhausted annual benefit');
near(med({ cost: 10e6, setting: 'inpatient', coveredSelfYtd: 2e6 }).oop, 0, 'exhausted covered deductible');
near(INS.medical({ cost: 50000, nonCov: 0, setting: 'general', gen: 4 }).oop, 20000, '4th generation general minimum');
near(INS.medical({ cost: 50000, nonCov: 0, setting: 'hospital', gen: 4 }).oop, 10000, '4th generation hospital minimum');
// Conservation and valid ranges throughout the simulator domain, including empty categories.
let scenarios = 0;
for (const cost of [0, 10000, 50000, 1e6, 10e6, 30e6, 100e6])
for (const setting of ['inpatient','clinic','hospital','general','tertiary'])
for (const hospital of ['hospital','general','tertiary'])
for (const nonCov of [0,.3,1]) for (const mild of [0,.5,1]) {
 const r = med({ cost, setting, hospital, nonCov, mild }); scenarios++;
 for (const key of ['nhis','patient','silson','oop']) assert.ok(Number.isFinite(r[key]) && r[key]>=-1e-8, `${key}: ${JSON.stringify(r)}`);
 assert.ok(r.silson <= r.patient + 1e-8);
 assert.ok(Math.abs(cost - r.nhis - r.silson - r.oop)<1e-6);
}
// Published chapter scripts compile; stale fifth-generation plan labels must disappear.
for (const file of ['health','asymmetry','company','lab','glossary','social']) {
 const html = fs.readFileSync(path.join(root, 'chapters', file+'.html'), 'utf8');
 assert.ok(!/5세대[^\n<>]{0,50}(확정 전|추진 중|개편안)|5세대\(안\)/.test(html), `${file}: outdated plan wording`);
 for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
  if (!/src=|application\/ld\+json/.test(match[1])) new vm.Script(match[2], {filename: file+'.html'});
 }
}
console.log(`INS-01..04: ${checks} fixed-value checks and ${scenarios} conservation scenarios passed; 6 chapter scripts compiled.`);
