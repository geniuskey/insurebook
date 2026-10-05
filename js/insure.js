/* Copyright (c) 2026 geniuskey and InsureBook contributors.
   Executable code: MIT (see ../LICENSE-MIT).
   Educational values and explanations: CC-BY-4.0 (see ../LICENSE.md). */
/* ==========================================================================
   InsureBook 보험 계산 엔진 — 전역 객체 INS
   모든 장이 같은 계산을 쓰도록 모아 둔다. 단위는 원, 비율은 소수, 나이는 만 나이(정수).
   - 제도 값(2026년 기준 대표값): INS.KR, INS.NHIS, INS.SILSON
   - 생명표·발생률(교육용 근사): INS.qx, INS.incidence, INS.prob
   - 보험수리: INS.price(3이원방식 보험료·준비금·해지환급금), INS.natural, INS.renewal
   - 의료비: INS.medical, INS.cap, INS.silsonPremium
   - 설계: INS.needs, INS.incomeGap, INS.pool, INS.expectedLoss
   - 판매: INS.commission
   - 케이스: INS.CASE (지우네)
   브라우저(window.INS)와 node(require) 둘 다에서 쓴다.
   ========================================================================== */
(function (root) {
  "use strict";
  const INS = {};

  /* ------------------------------------------------------------ 제도 값 */
  // 2026년 무렵 한국 제도의 대표값. 해마다 바뀌며, 확실하지 않은 값은 본문에서 '약'을 붙인다.
  INS.KR = {
    year: 2026,
    healthRate: 0.0719,           // 건강보험료율(근로자·회사 합계, 근로자 절반 3.595%)
    ltcRate: 0.1314,              // 장기요양보험료 = 건강보험료 × 13.14%
    coolingOff: { fromPolicy: 15, fromApply: 30 }, // 청약철회: 증권 받은 날부터 15일, 청약일부터 30일 이내
    qualityCancelMonths: 3,       // 품질보증해지: 약관·청약서 미교부, 중요 내용 미설명, 자필서명 누락 → 계약일부터 3개월
    illegalCancel: { knowYears: 1, contractYears: 5 }, // 위법계약해지권(금융소비자보호법): 안 날부터 1년, 계약일부터 5년 이내
    disclosure: { knowMonths: 1, benefitYears: 2, contractYears: 3 }, // 고지의무 위반 해지 제한: 안 날 1개월, 보장개시 후 2년 무사고, 계약일 3년
    claimYears: 3,                // 보험금 청구권 소멸시효 3년
    depositProtect: 1e8,          // 예금자보호 한도(보험사별 해지환급금 등 합산, 2025년 9월부터 1억원)
    commissionCap: 12,            // 첫해 모집수수료 상한: 월 보험료의 12배(1200%)
    premiumCredit: { limit: 1e6, rate: 0.12, disabledRate: 0.15 }, // 보장성보험료 세액공제
    taxFreeSaving: { lump: 1e8, monthly: 1.5e6, holdYears: 10, payYears: 5 }, // 저축성보험 비과세 요건
    interestTax: 0.154,           // 이자소득세(지방세 포함)
    reserveRate: 0.025,           // 표준 예정이율 근처의 교육용 값
    persistency: { 13: 0.86, 25: 0.72, 37: 0.62, 49: 0.55, 61: 0.48 }, // 회차별 계약 유지율(업계 평균 근처의 교육용 근사)
    lifeExp: { pop: { m: 80.6, f: 86.4 }, insured: { m: 86.3, f: 90.7 } }, // 통계청 생명표(2023), 제10회 경험생명표(2024) 근처
  };

  // 국민건강보험: 요양급여 본인부담률(대표값)과 본인부담상한액(소득 10분위, 연, 약)
  INS.NHIS = {
    rate: {
      inpatient: 0.2,             // 입원
      clinic: 0.3,                // 외래: 의원
      hospital: 0.4,              // 외래: 병원
      general: 0.5,               // 외래: 종합병원
      tertiary: 0.6,              // 외래: 상급종합병원
    },
    special: { cancer: 0.05, rare: 0.1, severeBurn: 0.05 }, // 산정특례(암·심장·뇌혈관 중증 등 5%, 희귀질환 10%)
    capByDecile: [870000, 1080000, 1080000, 1670000, 1670000, 3130000, 3130000, 4280000, 5140000, 8080000], // 1~10분위(약, 요양병원 장기입원 제외)
    nonCoveredOutside: true,      // 비급여는 상한제 계산에 들어가지 않는다
  };

  // 실손의료보험 세대(가입 시기). 자기부담 구조는 표준화 이후 대표 상품 기준의 단순화다.
  INS.SILSON = [
    { gen: 1, name: "1세대", period: "~2009.9", inCov: 0, inNon: 0, outDed: 5000, outRateCov: 0, outRateNon: 0, stopLoss: Infinity, renew: "3·5년 갱신(상품마다 다름)", premiumX: 3.2, note: "자기부담이 거의 없다. 보험료가 가장 비싸고 많이 오른다." },
    { gen: 2, name: "2세대", period: "2009.10~2017.3", inCov: 0.1, inNon: 0.1, outDed: 10000, outRateCov: 0, outRateNon: 0, stopLoss: 2e6, renew: "1~3년 갱신, 15년 재가입", premiumX: 2.2, note: "표준화 실손. 자기부담 10%(후기 가입은 20% 선택), 외래 공제 1~2만원." },
    { gen: 3, name: "3세대", period: "2017.4~2021.6", inCov: 0.1, inNon: 0.2, outDed: 10000, outRateCov: 0.1, outRateNon: 0.2, stopLoss: 2e6, renew: "1년 갱신, 15년 재가입", premiumX: 1.4, note: "착한 실손. 도수치료·주사·MRI는 특약(자기부담 30%)으로 분리." },
    { gen: 4, name: "4세대", period: "2021.7~", inCov: 0.2, inNon: 0.3, outDed: 10000, outDedNon: 30000, outRateCov: 0.2, outRateNon: 0.3, stopLoss: 2e6, renew: "1년 갱신, 5년 재가입", premiumX: 1.0, note: "급여·비급여 분리, 비급여 이용량에 따라 다음 해 보험료 할인·할증." },
    { gen: 5, name: "5세대(개편안)", period: "개편 추진", inCov: 0.2, inNon: 0.3, inNonMild: 0.5, outDed: 10000, outDedNon: 30000, outRateCov: 0.2, outRateNon: 0.5, stopLoss: 2e6, renew: "1년 갱신, 5년 재가입", premiumX: 0.7, plan: true, note: "중증 비급여 중심 보장, 비중증 비급여 자기부담 확대. 세부 내용은 확정 전이며 바뀔 수 있다." },
  ];

  /* ------------------------------------------------------------ 기본 수학 */
  INS.clamp = (x, a, b) => Math.min(b, Math.max(a, x));
  INS.monthly = (annual) => Math.pow(1 + annual, 1 / 12) - 1;
  /** 미래가치: 월 이율 r, n개월, 매월 pmt(월말), 현재 pv */
  INS.fv = function (r, n, pmt, pv = 0) {
    if (Math.abs(r) < 1e-12) return pv + pmt * n;
    const g = Math.pow(1 + r, n);
    return pv * g + pmt * (g - 1) / r;
  };
  /** 현재가치: 월 이율 r, n개월, 매월 pmt(월말) */
  INS.pv = function (r, n, pmt) {
    if (Math.abs(r) < 1e-12) return pmt * n;
    return pmt * (1 - Math.pow(1 + r, -n)) / r;
  };
  /** 매월 적립 시 해마다의 잔고: [{year, contrib, value}] */
  INS.grow = function (monthly, rate, years, start = 0) {
    const r = INS.monthly(rate), out = [{ year: 0, contrib: start, value: start }];
    let v = start, c = start;
    for (let m = 1; m <= years * 12; m++) { v = v * (1 + r) + monthly; c += monthly; if (m % 12 === 0) out.push({ year: m / 12, contrib: c, value: v }); }
    return out;
  };
  /** 시드 고정 난수 (mulberry32) */
  INS.rng = function (seed) { let a = seed >>> 0; return function () { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
  INS.gauss = function (seed) {
    const r = INS.rng(seed);
    return function () { let u = 0, v = 0; while (u === 0) u = r(); while (v === 0) v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
  };

  /* ------------------------------------------------------------ 생명표 */
  // Gompertz–Makeham μ(x) = A + B·c^x. 기대수명을 생명표 값에 맞춘 교육용 근사.
  // table: "insured"(경험생명표 근처, 보험료 계산용, 기본) | "pop"(국민 생명표 근처)
  const GM = {
    pop:     { m: [0.0004, 2.473e-5, 1.098], f: [0.0002, 9.317e-6, 1.105] },
    insured: { m: [0.0003, 1.041e-5, 1.103], f: [0.00015, 4.253e-6, 1.11] },
  };
  const MAXAGE = 110;
  /** 1년 사망확률 q(x). sex: "m" | "f" */
  INS.qx = function (age, sex = "m", table = "insured") {
    if (age >= MAXAGE) return 1;
    const [A, B, c] = GM[table][sex];
    return 1 - Math.exp(-(A + B * Math.pow(c, age + 0.5)));
  };
  /** age부터 해마다의 생존확률 [1, p, p·p, ...] (years+1개) */
  INS.survival = function (age, years, sex = "m", table = "insured") {
    const out = [1];
    for (let k = 0; k < years; k++) out.push(out[k] * (1 - INS.qx(age + k, sex, table)));
    return out;
  };
  /** 기대여명 */
  INS.lifeExpectancy = function (age, sex = "m", table = "insured") {
    const s = INS.survival(age, MAXAGE - age, sex, table);
    let e = 0; for (let k = 1; k < s.length; k++) e += (s[k - 1] + s[k]) / 2;
    return e;
  };

  // 연간 발생률(10만 명당, 나이 구간 끝점). 국가 통계의 크기를 따른 교육용 근사이며 실제 통계와 다르다.
  //  cancer: 모든 암(갑상선 포함), stroke: 뇌졸중(뇌출혈+뇌경색), cerebro: 뇌혈관질환 전체,
  //  hemorrhage: 뇌출혈, ami: 급성심근경색, ischemic: 허혈성심장질환 전체, hosp: 1년에 한 번 이상 입원
  const INC_AGES = [0, 20, 30, 40, 50, 60, 70, 80, 90, 110];
  const INC = {
    cancer:     { m: [5, 55, 140, 300, 780, 1550, 2300, 2500, 2400, 2400], f: [5, 115, 370, 700, 800, 880, 1050, 1150, 1150, 1150] },
    stroke:     { m: [2, 8, 30, 100, 250, 550, 1200, 2000, 2600, 2600], f: [2, 6, 20, 60, 150, 350, 850, 1600, 2200, 2200] },
    hemorrhage: { m: [1, 4, 14, 40, 80, 130, 220, 330, 400, 400], f: [1, 3, 10, 30, 55, 90, 160, 260, 320, 320] },
    cerebro:    { m: [4, 20, 70, 250, 650, 1400, 3000, 5000, 6500, 6500], f: [4, 16, 55, 180, 450, 1000, 2300, 4200, 5600, 5600] },
    ami:        { m: [1, 5, 25, 60, 150, 250, 450, 700, 900, 900], f: [1, 1, 4, 12, 35, 80, 200, 420, 650, 650] },
    ischemic:   { m: [2, 15, 70, 220, 550, 1000, 1700, 2400, 2800, 2800], f: [2, 6, 20, 70, 220, 500, 1100, 1800, 2300, 2300] },
    hosp:       { m: [9000, 5000, 6000, 7500, 10000, 14000, 21000, 32000, 42000, 42000], f: [9000, 6500, 8500, 8500, 10500, 14000, 21000, 32000, 42000, 42000] },
  };
  INS.INC_KINDS = { cancer: "암", stroke: "뇌졸중", hemorrhage: "뇌출혈", cerebro: "뇌혈관질환", ami: "급성심근경색", ischemic: "허혈성심장질환", hosp: "입원" };
  /** 그 나이의 1년 발생확률(첫 발생 기준). kind는 INC의 키, 또는 "death" */
  INS.incidence = function (kind, age, sex = "m") {
    if (kind === "death") return INS.qx(age, sex);
    const t = INC[kind][sex];
    let i = 0; while (i < INC_AGES.length - 2 && age >= INC_AGES[i + 1]) i++;
    const a = INC_AGES[i], b = INC_AGES[i + 1], u = INS.clamp((age - a) / (b - a), 0, 1);
    return Math.exp(Math.log(t[i]) * (1 - u) + Math.log(t[i + 1]) * u) / 1e5;
  };
  /** age부터 years년 안에 kind가 (살아 있는 동안) 처음 일어날 확률. 사망과 경쟁한다. */
  INS.prob = function (kind, age, years, sex = "m", table = "pop") {
    let alive = 1, cum = 0;
    for (let k = 0; k < years && age + k < MAXAGE; k++) {
      const h = INS.incidence(kind, age + k, sex);
      if (kind === "death") { cum += alive * h; alive *= 1 - h; continue; }
      cum += alive * h;
      alive *= (1 - h) * (1 - INS.qx(age + k, sex, table));
    }
    return cum;
  };

  /* ------------------------------------------------------------ 보험수리: 3이원방식 */
  /**
   * 보험료·책임준비금·해지환급금 (연 단위, 연초 납입, 연말 지급의 단순 모델)
   *   o = {
   *     type: "term" 정기(사망) | "whole" 종신(사망) | "endow" 양로(사망+만기) | "pure" 순수 만기 저축 |
   *           "cancer" 등 INC 키: 진단 시 1회 지급 후 소멸,
   *     age, sex, S(가입금액), term(보장 연수, whole은 110세까지), pay(납입 연수),
   *     i(예정이율, 기본 2.5%), alpha(신계약비, 첫해 연 영업보험료 대비 배수, 기본 0.9),
   *     beta(유지비, 영업보험료 대비, 기본 0.08), gamma(가입금액 대비 연 유지비, 기본 0), fee(계약 1건당 연 고정비, 납입 중, 기본 0),
   *     amort(신계약비 상각 연수, 기본 7), lapse(연 해지율, 숫자 또는 k=>율, 기본 0),
   *     refund(해지환급 비율: 1 표준형, 0 무해지, 0.5 저해지 50% — 납입기간 중에만 적용),
   *     loadOnly(true면 사업비 없는 순보험료만), table("insured")
   *   }
   * 반환: { annual(연 영업보험료), monthly, net(연 순보험료), parts:{risk, saving, expense}(첫해 월 금액),
   *         rows:[{t, age, inforce, paid, reserve, surrender, ratio}], breakEven(환급률 100% 도달 연차 또는 null),
   *         epv:{benefit, premiumAnnuity} }
   */
  INS.price = function (o) {
    const sex = o.sex || "m", table = o.table || "insured", S = o.S || 1e8;
    const i = o.i == null ? INS.KR.reserveRate : o.i, v = 1 / (1 + i);
    const type = o.type || "term";
    const term = type === "whole" ? MAXAGE - o.age : o.term;
    const pay = Math.min(o.pay || term, term);
    const alpha = o.alpha == null ? 0.9 : o.alpha, beta = o.beta == null ? 0.08 : o.beta, gamma = o.gamma || 0;
    const amort = o.amort || 7;
    const refund = o.refund == null ? 1 : o.refund;
    const lapseF = typeof o.lapse === "function" ? o.lapse : () => o.lapse || 0;
    // 해마다의 사건 확률: b(보험금 사건), d(보험금 없이 소멸하는 사망)
    const b = [], d = [];
    for (let k = 0; k < term; k++) {
      const x = o.age + k;
      if (type === "term" || type === "whole" || type === "endow") { b.push(INS.qx(x, sex, table)); d.push(0); }
      else if (type === "pure") { b.push(0); d.push(INS.qx(x, sex, table)); }
      else { const h = INS.incidence(type, x, sex); b.push(h); d.push((1 - h) * INS.qx(x, sex, table)); }
    }
    if (type === "whole" && term > 0) b[term - 1] = 1; // 110세에 모두 지급되는 것으로 닫는다
    const matur = type === "endow" || type === "pure" ? 1 : 0;
    // 표준형(해지 없음) 순보험료와 준비금
    const pin = [1]; for (let k = 0; k < term; k++) pin.push(pin[k] * (1 - b[k] - d[k]));
    let A = 0, ann = 0;
    for (let k = 0; k < term; k++) { A += Math.pow(v, k + 1) * pin[k] * b[k]; if (k < pay) ann += Math.pow(v, k) * pin[k]; }
    A += matur * Math.pow(v, term) * pin[term];
    const P = A / ann; // 단위 가입금액당 연 순보험료
    // 준비금 재귀: (V_k + P)(1+i) = b_k + (1 - b_k - d_k) V_{k+1}
    const V = [0];
    for (let k = 0; k < term; k++) {
      const pk = k < pay ? P : 0, surv = 1 - b[k] - d[k];
      V.push(surv > 1e-12 ? ((V[k] + pk) * (1 + i) - b[k]) / surv : 0);
    }
    V[term] = matur || type === "whole" ? 1 : 0;
    // 해지를 넣은 유지율로 다시 계산(무해지·저해지 가격의 핵심): 해지자는 refund × 표준 준비금을 받는다
    const pl = [1]; let A2 = 0, ann2 = 0, annT2 = 0;
    for (let k = 0; k < term; k++) {
      const w = k < pay ? lapseF(k) : 0;
      const r = k < pay ? refund : 1;
      A2 += Math.pow(v, k + 1) * pl[k] * (b[k] + (1 - b[k] - d[k]) * w * r * V[k + 1]);
      if (k < pay) ann2 += Math.pow(v, k) * pl[k];
      annT2 += Math.pow(v, k) * pl[k];
      pl.push(pl[k] * (1 - b[k] - d[k]) * (1 - w));
    }
    A2 += matur * Math.pow(v, term) * pl[term];
    const Pn = A2 / ann2;                       // 해지율 반영 순보험료(단위당)
    const net = Pn * S;
    const denom = (1 - beta) * ann2 - alpha;
    const G = o.loadOnly ? net : (A2 * S + gamma * S * annT2 + (o.fee || 0) * ann2) / denom;
    const riskY = b[0] * v * S;                  // 첫해 위험보험료
    const parts = {
      risk: Math.min(riskY, net) / 12,
      saving: Math.max(0, net - riskY) / 12,
      expense: Math.max(0, G - net) / 12,
    };
    // 해지환급금: 표준 준비금 − 미상각 신계약비, 납입기간 중에는 refund 비율 적용
    const alphaAmt = o.loadOnly ? 0 : alpha * G;
    const rows = [];
    let be = null;
    for (let t = 0; t <= term; t++) {
      const paid = G * Math.min(t, pay);
      const unam = alphaAmt * Math.max(0, 1 - t / Math.min(amort, pay));
      let sv = Math.max(0, V[t] * S - unam);
      if (t < pay) sv *= refund;
      if (t === 0) sv = 0;
      const ratio = paid > 0 ? sv / paid : 0;
      if (be == null && t > 0 && ratio >= 1) be = t;
      rows.push({ t, age: o.age + t, inforce: pin[t], persist: pl[t], paid, reserve: V[t] * S, surrender: sv, ratio });
    }
    return { annual: G, monthly: G / 12, net, netStd: P * S, parts, rows, breakEven: be, epv: { benefit: A2 * S, premiumAnnuity: ann2 }, pay, term };
  };

  /** 자연보험료(1년 만기 갱신, 그 나이의 위험만큼): 월 금액 */
  INS.natural = function (kind, age, S, sex = "m", load = 0.25) {
    const h = kind === "death" ? INS.qx(age, sex) : INS.incidence(kind, age, sex);
    return h * S * (1 + load) / (1 + INS.KR.reserveRate) / 12;
  };

  /**
   * 갱신형 보험료의 계단과 비갱신(평준)형 비교
   *   o = { kind:"cancer"|"death"|..., age, sex, S, period(갱신 주기, 기본 10), until(보장 끝 나이, 기본 100),
   *         levelPay(비갱신형 납입 연수, 기본 20), i, alpha, beta, fee(건당 연 고정비, 기본 3만원),
   *         trend(갱신 때 반영되는 위험률·의료비 상승 추세, 연, 기본 0.02), margin(비갱신형의 안전할증, 기본 0.1) }
   * 반환: { steps:[{age, monthly}], level:{monthly, total}, renewTotal, crossAge(누적 납입이 평준형을 넘는 나이) }
   */
  INS.renewal = function (o) {
    const period = o.period || 10, until = o.until || 100, sex = o.sex || "m", S = o.S || 3e7;
    const trend = o.trend == null ? 0.02 : o.trend;
    const type = o.kind === "death" ? "term" : (o.kind || "cancer");
    const base = { sex, S, i: o.i, alpha: o.alpha == null ? 0.6 : o.alpha, beta: o.beta == null ? 0.12 : o.beta, fee: o.fee == null ? 30000 : o.fee };
    const steps = [];
    for (let a = o.age; a < until; a += period) {
      const n = Math.min(period, until - a);
      const p = INS.price(Object.assign({}, base, { type, age: a, term: n, pay: n })).monthly * Math.pow(1 + trend, a - o.age);
      steps.push({ age: a, monthly: p, years: n });
    }
    const lp = Math.min(o.levelPay || 20, until - o.age);
    const lv = INS.price(Object.assign({}, base, { type, age: o.age, term: until - o.age, pay: lp, alpha: o.alpha == null ? 0.9 : o.alpha, beta: o.beta == null ? 0.08 : o.beta })).monthly;
    // 비갱신형은 보험료를 고정하는 대신 미래 위험률 상승에 대비한 안전할증을 붙인다고 본다
    const level = lv * (1 + (o.margin == null ? 0.1 : o.margin));
    let cumR = 0, cumL = 0, cross = null;
    for (let a = o.age; a < until; a++) {
      const st = steps.filter((s) => s.age <= a).pop();
      cumR += st.monthly * 12;
      if (a - o.age < lp) cumL += level * 12;
      if (cross == null && cumR > cumL) cross = a + 1;
    }
    return { steps, level: { monthly: level, total: level * 12 * lp, pay: lp }, renewTotal: cumR, crossAge: cross };
  };

  /* ------------------------------------------------------------ 의료비 */
  /**
   * 진료 한 건의 비용을 건강보험·실손·내 돈으로 나눈다.
   *   o = { cost(총 진료비), nonCov(비급여 비율 0~1), setting("inpatient"|"clinic"|"hospital"|"general"|"tertiary"),
   *         special(null|"cancer"|"rare"), gen(실손 세대 0=없음,1~5), mild(비급여 중 비중증 비율, 5세대용, 기본 0.5) }
   * 반환: { covered, nhis, copay(급여 본인부담), nonCovered, patient(실손 전 내 부담), silson, oop(최종 내 부담) }
   */
  INS.medical = function (o) {
    const cost = o.cost || 0, nc = INS.clamp(o.nonCov || 0, 0, 1);
    const setting = o.setting || "inpatient";
    const covered = cost * (1 - nc), nonCovered = cost * nc;
    const rate = o.special ? INS.NHIS.special[o.special] : INS.NHIS.rate[setting];
    const copay = covered * rate, nhis = covered - copay, patient = copay + nonCovered;
    let silson = 0;
    const g = INS.SILSON.find((s) => s.gen === o.gen);
    if (g) {
      if (setting === "inpatient") {
        let selfCov = copay * g.inCov, selfNon;
        if (g.inNonMild != null) { const mild = o.mild == null ? 0.5 : o.mild; selfNon = nonCovered * (mild * g.inNonMild + (1 - mild) * g.inNon); }
        else selfNon = nonCovered * g.inNon;
        let self = selfCov + selfNon;
        if (g.gen >= 2 && g.gen <= 3) self = Math.min(self, g.stopLoss);
        if (g.gen >= 4) self = Math.min(selfCov, g.stopLoss) + selfNon; // 4세대 이후 비급여는 상한 없음(단순화)
        silson = Math.max(0, patient - self);
      } else {
        const outDed = setting === "clinic" ? g.outDed : g.outDed * 1.5;
        let self;
        if (g.gen >= 4) {
          const sc = copay > 0 ? Math.max(outDed, copay * g.outRateCov) : 0;
          const sn = nonCovered > 0 ? Math.max(g.outDedNon, nonCovered * g.outRateNon) : 0;
          self = Math.min(copay, sc) + Math.min(nonCovered, sn);
        } else if (g.gen === 3) self = Math.max(outDed, copay * g.outRateCov + nonCovered * g.outRateNon);
        else self = Math.min(patient, outDed);
        silson = Math.max(0, patient - self);
      }
      silson = Math.min(silson, 50e6);
    }
    return { covered, nhis, copay, nonCovered, patient, silson, oop: patient - silson, rate };
  };
  /** 본인부담상한제: 1년 급여 본인부담 합계와 소득분위(1~10) → 돌려받는 금액 */
  INS.cap = function (annualCopay, decile = 5) {
    const c = INS.NHIS.capByDecile[INS.clamp(Math.round(decile), 1, 10) - 1];
    return { cap: c, refund: Math.max(0, annualCopay - c), paid: Math.min(annualCopay, c) };
  };
  /** 실손 월 보험료(교육용 곡선): 나이·세대·성별. 4세대 30세 남자 약 1.1만원 기준 */
  INS.silsonPremium = function (age, gen = 4, sex = "m") {
    const g = INS.SILSON.find((s) => s.gen === gen) || INS.SILSON[3];
    const base = 11000 * (sex === "f" ? 1.25 : 1);
    const ageF = Math.exp(0.035 * (age - 30) + 0.0006 * Math.pow(Math.max(0, age - 40), 2));
    return base * ageF * g.premiumX;
  };

  /* ------------------------------------------------------------ 위험 나누기 */
  /** N명이 확률 p, 피해 L을 나눌 때 1인당 부담의 평균과 표준편차 */
  INS.pool = function (N, p, L) { return { mean: p * L, sigma: L * Math.sqrt(p * (1 - p) / Math.max(1, N)) }; };
  /** 기대손실과 부가율 */
  INS.expectedLoss = function (p, L, premium) {
    const el = p * L;
    return { el, premium, load: premium != null ? premium - el : null, ratio: premium != null && el > 0 ? premium / el - 1 : null };
  };

  /* ------------------------------------------------------------ 필요 보장 */
  /**
   * 사망 시 필요 보장액(니즈 분석)
   *   o = { monthlyExpense(남은 가족의 월 생활비, 오늘 돈), years(필요 기간), inflation(기본 0.025), rate(운용 수익률, 기본 0.03),
   *         debt(갚아야 할 빚), education(자녀 교육비 합계), funeral(정리 비용, 기본 1,500만원),
   *         assets(바로 쓸 수 있는 자산), existing(이미 있는 사망보장), survivorPension(유족연금 월액) }
   * 반환: { expensePV, pensionPV, need, have, gap }
   */
  INS.needs = function (o) {
    const inf = o.inflation == null ? 0.025 : o.inflation, rate = o.rate == null ? 0.03 : o.rate;
    const realM = INS.monthly((1 + rate) / (1 + inf) - 1), n = Math.round((o.years || 0) * 12);
    const expensePV = INS.pv(realM, n, o.monthlyExpense || 0);
    const pensionPV = INS.pv(realM, n, o.survivorPension || 0);
    const need = expensePV + (o.debt || 0) + (o.education || 0) + (o.funeral == null ? 1.5e7 : o.funeral);
    const have = (o.assets || 0) + (o.existing || 0) + pensionPV;
    return { expensePV, pensionPV, need, have, gap: Math.max(0, need - have) };
  };
  /** 큰 병의 소득 공백: 월 실수령 × 개월 × (1 − 회사·제도가 보전하는 비율) + 추가 비용 */
  INS.incomeGap = function (monthlyNet, months, opt = {}) {
    const keep = opt.keep || 0, extra = opt.extra || 0;
    return monthlyNet * months * (1 - keep) + extra;
  };

  /* ------------------------------------------------------------ 판매 수수료 */
  /**
   * 설계사 모집수수료의 흐름(교육용 단순화)
   *   o = { monthly(월 보험료), total(총 수수료, 월 보험료의 배수, 기본 17), first(첫해 배수, 기본 12),
   *         years(지급 연수, 기본 7), lapseYear(해지 연차, 없으면 유지), claw(첫해 해지 시 환수 비율 [1~12개월, 13~24개월], 기본 [1, 0.5]) }
   * 반환: { rows:[{year, paid, claw, net}], gross, clawback, net }
   */
  INS.commission = function (o) {
    const m = o.monthly || 0, total = (o.total == null ? 17 : o.total) * m, years = o.years || 7;
    const first = Math.min((o.first == null ? 12 : o.first) * m, total);
    const restY = years > 1 ? (total - first) / (years - 1) : 0;
    const claw = o.claw || [1, 0.5];
    const rows = [];
    let gross = 0, cb = 0;
    for (let y = 1; y <= years; y++) {
      const alive = o.lapseYear == null || y <= o.lapseYear; // 수수료는 연초에 지급된다고 본다
      const paid = alive ? (y === 1 ? first : restY) : 0;
      let c = 0;
      if (o.lapseYear === y && y <= claw.length) c = first * claw[y - 1];
      gross += paid; cb += c;
      rows.push({ year: y, paid, claw: c, net: paid - c });
    }
    return { rows, gross, clawback: cb, net: gross - cb };
  };

  /* ------------------------------------------------------------ 보험나이 */
  /** 보험나이: 만 나이에서 마지막 생일 뒤 6개월이 지났으면 1살을 더한다. 날짜는 "YYYY-MM-DD" 또는 Date */
  INS.insAge = function (birth, ref) {
    const b = new Date(birth), r = ref ? new Date(ref) : new Date();
    let age = r.getFullYear() - b.getFullYear();
    const last = new Date(b); last.setFullYear(b.getFullYear() + age);
    if (last > r) { age--; last.setFullYear(last.getFullYear() - 1); }
    const half = new Date(last); half.setMonth(half.getMonth() + 6);
    const next = new Date(last); if (r >= half) next.setFullYear(last.getFullYear() + 1); else next.setTime(half.getTime());
    if (r >= half) next.setMonth(next.getMonth() + 6);
    return { full: age, insurance: r >= half ? age + 1 : age, nextChange: next };
  };

  /* ------------------------------------------------------------ 케이스: 지우네 상담 노트 */
  // 가상의 인물이며 실제 인물과 무관하다. 보험료는 엔진·교육용 가정으로 정한 값이다.
  INS.CASE = {
    year: 2026,
    jiwoo: { name: "서지우", age: 32, sex: "m", salary: 48e6, monthlyNet: 3.3e6, job: "IT 회사 개발자" },
    minseo: { name: "윤민서", age: 31, sex: "f", salary: 36e6, monthlyNet: 2.6e6, job: "디자인 회사 디자이너" },
    advisor: { name: "한도윤", age: 29, years: 3, channel: "GA(법인보험대리점) 소속 설계사" },
    home: { jeonse: 3e8, jeonseLoan: 2e8, loanRate: 0.04 },
    assets: { cash: 3e7 },
    livingCost: 3.6e6,          // 둘의 월 생활비(전세대출 이자 포함)
    plan: "2027년 첫 아이 계획",
    // 지금 가지고 있는 보험(2026년 10월). monthly는 현재 월 보험료(원)
    policies: [
      { who: "jiwoo", name: "종신보험", insurer: "생명보험사", since: 2012, sinceAge: 18, monthly: 120000, pay: 20, cover: "사망 1억원 + 재해·입원·수술 특약", type: "whole", note: "2012년 부모님이 가입해 줬다(예정이율 약 4%). 20년납, 2032년 납입 완료." },
      { who: "jiwoo", name: "실손의료보험", insurer: "손해보험사", since: 2012, sinceAge: 18, monthly: 28000, gen: 2, cover: "2세대 실손(자기부담 10%)", type: "silson", note: "부모님이 종신과 함께 가입. 갱신 때마다 오른다." },
      { who: "jiwoo", name: "암보험(갱신형)", insurer: "손해보험사", since: 2020, sinceAge: 26, monthly: 32000, cover: "암 진단 3,000만원(유사암 300만원) + 수술·입원 특약, 20년 갱신", type: "cancer", renew: 20, note: "대학 선배 설계사에게 가입." },
      { who: "jiwoo", name: "운전자보험", insurer: "손해보험사", since: 2023, sinceAge: 29, monthly: 15000, cover: "교통사고처리지원금·벌금·변호사 비용, 일상생활배상책임 특약", type: "driver", note: "차를 사면서 가입." },
      { who: "jiwoo", name: "주택화재보험", insurer: "손해보험사", since: 2025, sinceAge: 31, monthly: 9000, cover: "임차자 화재 배상, 일상생활배상책임 특약", type: "fire", note: "전세 계약 때 가입." },
      { who: "jiwoo", name: "자동차보험", insurer: "손해보험사(다이렉트)", since: 2023, sinceAge: 29, monthly: 62000, cover: "대인·대물·자차, 연 74만원", type: "auto", note: "1년 단위 갱신. 연납을 월로 환산." },
      { who: "minseo", name: "실손의료보험", insurer: "손해보험사", since: 2022, sinceAge: 27, monthly: 14000, gen: 4, cover: "4세대 실손", type: "silson", note: "첫 직장 입사 때 가입." },
      { who: "minseo", name: "회사 단체보험", insurer: "회사 부담", since: 2024, sinceAge: 29, monthly: 0, cover: "사망 5,000만원, 단체실손", type: "group", note: "퇴사하면 사라진다." },
    ],
  };
  INS.CASE.total = INS.CASE.policies.reduce((s, p) => s + p.monthly, 0);

  root.INS = INS;
  if (typeof module !== "undefined" && module.exports) module.exports = INS;
})(typeof window !== "undefined" ? window : globalThis);
