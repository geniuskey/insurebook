# InsureBook 챕터 작성 가이드

빌드 과정 없는 정적 사이트다. `index.html` + `chapters/<slug>.html` + 공통 `css/style.css`, `js/common.js`(전역 `IB`), `js/insure.js`(전역 `INS`).
로컬 실행: `python -m http.server 8000` → http://localhost:8000 (file://로 열어도 동작하게 classic script만 쓴다. ES module 금지.)
레이아웃·헬퍼 코드는 같은 시리즈의 [MoneyBook](https://github.com/geniuskey/moneybook)에서 가져왔다. MoneyBook의 장(특히 `chapters/insurance.html`)을 문체와 시뮬레이터 수준의 본보기로 삼는다. 다만 MoneyBook의 전역 `MB`/`MN`은 여기서 `IB`/`INS`다.

## 기여물의 라이선스
실행 코드는 MIT, 본문·그림·문제·해설 등 교육 콘텐츠는 CC BY 4.0. 구분은 [라이선스 안내](LICENSE.md)를 따른다.

## 이 책이 답하려는 질문
1. **보험은 왜 이렇게 복잡한가.** 위험의 수학(대수의 법칙), 정보 비대칭(역선택·도덕적 해이), 장기 계약(평준보험료·준비금), 판매 구조(수수료·사업비), 규제가 각각 복잡함을 만든다. 복잡함에는 이유가 있는 것과 판매에 유리해서 남은 것이 섞여 있다. 장마다 "이 복잡함은 어디서 왔는가"를 한 번은 짚는다.
2. **보험설계사는 왜 존재하는가.** 보험은 사람들이 스스로 사지 않는 상품(위험 과소평가, 현재 편향, 탐색 비용)이라 판매가 필요하다. 설계사는 니즈 환기·설계·청구 지원의 가치를 주지만 수수료 구조 때문에 이해상충도 생긴다. 양쪽을 다 정직하게 보여 준다.
3. **독자 모두에게 쓸모 있게.** 처음 보험을 드는 사람, 가족의 보험을 정리하는 사람, 현장의 보험설계사까지. 본문은 사전 지식 없는 일반인 기준으로 쓰고, 현장 실무자를 위한 내용은 `.callout.pro`(설계사 노트)로, 가입자가 바로 써먹을 점검 목록은 `.callout.buyer`(가입자 체크)로, 수식·제도의 깊은 이야기는 `.callout.deep`(심화)로 덧붙인다.

## 원칙
- **한국어**, 대상은 보험을 처음 공부하는 성인. 보험 용어는 처음 나올 때 `<span class="term">해지환급금</span><span class="en">(Surrender value)</span>`처럼 쓰고 한 문장으로 풀어 준다. 업계 은어(예: 승환, 시책, 부담보, 갱신 폭탄)는 따옴표 없이 쓰되 바로 뜻을 풀어 준다.
- 이 책의 뼈대는 **만져 보며 배우기**다(Bartosz Ciechanowski의 글이 본보기). 읽고 외우는 책이 아니라, 숫자를 직접 끌고 바꿔 보면서 "아, 그래서"를 얻는 책이다.
  - 개념 하나에 조작 가능한 그림 하나. 정적인 SVG는 조작으로 대신할 수 없을 때만 쓴다(장마다 2~4개: 구조도, 흐름도, 비교표 그림).
  - 한 시뮬레이터는 **한 가지**만 보여 준다. 슬라이더는 1~3개. 장마다 5~8개, 큰 종합 시뮬레이터는 장 끝에 하나.
  - 앞 시뮬레이터에서 만진 것 위에 다음 것을 쌓는다. 글은 시뮬레이터 바로 앞에서 "무엇을 움직여 볼지"를, 바로 뒤에서 "무엇을 봤는지"를 말한다.
  - 슬라이더뿐 아니라 캔버스 위 직접 끌기(`IB.drag`)를 적극적으로 쓴다(곡선 위 점을 끌어 나이를 바꾸기, 세로선을 끌어 해지 시점을 고르기, 카드를 끌어 분류하기). 끌 수 있는 것에는 손잡이를 그린다.
  - 값을 끝까지 밀었을 때 **무너지는 모습**이 보여야 한다(갱신 보험료가 계단처럼 치솟는다, 가입자가 빠져나가 보험이 붕괴한다, 해지환급금이 0이 된다, 보장 공백이 드러난다). 한계가 배울 점이다.
  - 결과는 숫자(`.sim-readout`)로도 함께 보여 준다. 금액은 `IB.won()`으로 "1억 2,346만원"처럼 쓴다.
  - 애니메이션을 아끼지 않는다: 쌓이는 보험료, 떨어지는 사고, 빠져나가는 가입자(`IB.loop`). 화면 밖에서는 멈춘다(`IB.loop`가 자동 처리).
- 순서: 일상의 질문 → 조작 가능한 그림 → 원리(필요하면 수식, KaTeX) → 시뮬레이터 → 실제 제도·수치 → 지우네 상담 노트 → 핵심 정리/퀴즈.
- 수치: **2026년 한국 제도 기준 대표값**. 엔진의 `INS.KR`, `INS.NHIS`, `INS.SILSON`에 모아 두었다. 제도 수치를 본문에 쓸 때는 "2026년 기준", 확실하지 않으면 '약', '~'을 붙인다. 제도·요율·상품은 해마다 바뀐다는 점을 장마다 한 번은 말한다(`.callout.warn`). 개편이 논의 중인 제도(5세대 실손, 수수료 분급 등)는 "추진 중", "확정 전"이라고 분명히 쓴다. 지어낸 통계·판례·사건번호를 쓰지 않는다. 구체적 판례·분쟁 사례는 "이런 유형의 분쟁이 있다" 수준으로 일반화한다.
- **상품 권유를 하지 않는다.** 특정 보험사·상품·설계사·GA 이름을 쓰지 않는다(제도·기관명 금융감독원, 생명보험협회, 손해보험협회, 보험개발원, 국민건강보험공단, 내보험다보여, 실손24 등은 괜찮다). 보험사 이름 대신 "A생명", "B손해보험"처럼 가상의 이름을 쓴다.
- **공정하게.** 보험을 무조건 비판하거나 무조건 권하지 않는다. 종신보험·저축성보험·설계사 같은 주제는 장점과 한계, 맞는 사람과 안 맞는 사람을 함께 쓴다.
- 외부 라이브러리는 KaTeX만. 이미지 대신 인라인 SVG/canvas.
- 색은 CSS 변수(`var(--accent)`)나 `IB.palette()`를 쓴다. 받는 돈(보험금·환급)은 `--ok`, 내는 돈(보험료·손실)은 `--bad`, 주의는 `--warn`, 주제색은 `--accent`(파랑), 보조는 `--accent-2`(금색).
- 모바일(폭 360px)에서 가로 스크롤 금지. SVG는 `viewBox`만 주고 width/height 생략.
- 문체는 평서문 "~다". 이모지 금지. 다른 장을 언급할 때는 `<a href="pricing.html">3장</a>`처럼 링크한다. MoneyBook 장을 참고로 걸 때는 전체 URL(`https://moneybook.euiyun.com/chapters/insurance.html`)을 쓴다.

## head 블록
각 챕터 `<head>`에는 아래 표식만 두고 `python3 tools/head.py <slug>`를 실행한다(인자 없이 실행하면 전체 장 + 사이트맵 + `index.html`의 JSON-LD를 갱신한다). 제목·번호는 `js/common.js`의 `CHAPTERS`에서 읽는다. `js/insure.js`는 항상 함께 불러온다.
```html
<!doctype html>
<!-- Copyright (c) 2026 geniuskey and InsureBook contributors.
     Executable code: MIT (see ../LICENSE-MIT).
     Text, illustrations, questions and explanations: CC-BY-4.0 (see ../LICENSE.md). -->
<html lang="ko">
<head>
<!--head:start {"desc": "한 문장 설명"}-->
<!--head:end-->
</head>
```

## 페이지 골격
```html
<body data-chapter="slug">
<main class="chapter">
  <header class="chapter-hero">
    <div class="eyebrow">Chapter NN</div><h1>제목</h1><p class="lead">…</p>
    <ul class="objectives"><li>…</li></ul>
  </header>
  <section id="영문-id"><h2>절 제목</h2> … </section>
  <section class="keypoints" id="summary"><h2>핵심 정리</h2><ol><li>…</li></ol></section>
  <section class="quiz-sec" id="quiz"><h2>확인 퀴즈</h2><div class="quiz"> … </div></section>
</main>
<script>(function () { "use strict"; /* 시뮬레이터 */ })();</script>
</body>
```
상단바·챕터 목록·다섯 부 띠·오른쪽 목차·h2 번호·이전/다음·푸터·퀴즈 동작·KaTeX 렌더는 `common.js`가 자동으로 만든다. 직접 넣지 않는다.

## 컴포넌트
- 그림: `<figure class="diagram"><svg viewBox="0 0 440 300" role="img" aria-label="…">…</svg><figcaption><b>그림 1. 제목.</b> 설명</figcaption></figure>`. SVG 안에서는 `.lbl`, `.lbl-dim`, `.lbl-b`, `.lbl-acc`, `.lbl-acc2`, `.lbl-bad`, `.t-mono`, `.s-line`, `.s-axis`, `.s-acc`, `.s-acc2`, `.s-ok`, `.s-dash`, `.s-bad`, `.f-surface`, `.f-elev`, `.f-acc`, `.f-acc2`, `.f-ok`, `.f-warn`, `.f-bad`, `.f-acc-soft`, `.f-acc2-soft`, `.f-ok-soft`, `.f-warn-soft`, `.f-bad-soft` 클래스를 쓴다. 색을 직접 적지 않는다(다크 모드). 화살표 머리는 `<marker>`에 `fill="context-stroke"`. marker id는 장 안에서 겹치지 않게 짓는다.
- 시뮬레이터:
```html
<div class="sim" id="sim-x">
  <div class="sim-head"><span class="sim-tag">SIMULATOR</span><h3>제목</h3></div>
  <div class="sim-body side">
    <div class="sim-view"><canvas id="x-cv"></canvas></div>
    <div class="sim-controls">
      <label class="ctrl"><span>이름 <output id="x-a-out"></output></span><input type="range" id="x-a" min="0" max="10" step="0.1" value="3"></label>
      <div class="seg" id="x-mode"><button data-value="a" class="on">A</button><button data-value="b">B</button></div>
      <label class="check"><input type="checkbox" id="x-c"> 옵션</label>
      <div class="btn-row"><button class="btn primary" id="x-go">실행</button><button class="btn" id="x-re">다시</button></div>
    </div>
  </div>
  <div class="sim-readout"><div class="stat"><span class="k">이름</span><span class="v" id="x-o-1">—</span></div></div>
  <div class="sim-note">해볼 것: ① … ② … ③ … (모델의 가정)</div>
</div>
```
  컨트롤이 없거나 캔버스를 직접 끄는 시뮬레이터는 `.sim-body`에서 `side`를 빼고 `.sim-view` 안에 `<span class="hint">끌어서 움직인다</span>`를 둔다. `<select>`는 쓰지 않는다(`.seg`를 쓴다).
- 수식: `<div class="formula">$$…$$<div class="where">기호 설명</div></div>`, 문장 속은 `\(…\)`. 수식은 꼭 필요한 곳에만(장마다 0~3개). 수식보다 그림과 숫자가 먼저다.
- 강조 상자: `.callout`, `.callout.tip`, `.callout.warn`, `.callout.deep`(심화), `.callout.pro`(설계사 노트), `.callout.buyer`(가입자 체크). 첫 `<strong>`이 제목이다(라벨은 CSS가 앞에 붙인다). **장마다 `.callout.pro` 1~3개, `.callout.buyer` 1~2개**를 넣는다. 설계사 노트는 현장 실무(상담 화법, 설명의무, 서류, 흔한 실수, 고객이 자주 묻는 질문)를, 가입자 체크는 설계서·증권에서 직접 확인할 항목을 담는다.
- 표: `<div class="table-wrap"><table>…</table></div>`. 숫자 칸은 `class="num"`.
- 설계서·영수증: `<div class="slip"><div class="row"><span>주계약</span><span>98,500</span></div>…<div class="row total"><span>합계</span><span>163,000</span></div></div>`.
- 금액 색: `<span class="won plus">+50만원</span>`, `<span class="won minus">−12만원</span>`.
- 범례: `<div class="legend"><span><i style="background:var(--bad)"></i>보험료</span></div>`, `.pill`, `.ok-t` `.bad-t` `.warn-t`.
- 퀴즈: `<div class="quiz-q"><p>문제</p><div class="opts"><button class="opt">…</button><button class="opt" data-correct>정답</button></div><div class="quiz-exp">해설</div></div>` (장마다 4문항, 정답 위치를 섞는다).
- 지우네 상담 노트(아래 참조):
```html
<div class="casefile">
  <div class="tag"><b>CASE 지우네</b><span>상담 노트 · 7장</span></div>
  <h4>갱신형 암보험, 46세에 몇 배가 될까</h4>
  <p>…이 장의 방법을 지우네에게 적용한 결과. 도윤(설계사)의 시각과 지우네(가입자)의 시각을 함께…</p>
  <div class="clue"><div><b>이 장에서 정한 것</b>…</div><div><b>아직 남은 문제</b>…</div><div><b>다음 단계</b>…</div></div>
</div>
```

## 이어지는 케이스: 지우네 상담 노트
모든 장은 같은 가상의 가족과 설계사 한 명의 상담을 한 걸음씩 진전시킨다. 각 장 끝(핵심 정리 앞)에 `.casefile` 하나를 넣고, **아래 표에서 자기 장에 해당하는 내용만** 다룬다. 뒤 장의 결론을 미리 말하지 않는다. 숫자는 `INS.CASE`와 엔진으로 직접 계산해서 쓴다(`node -e "require('./js/insure.js'); const I = INS; …"`로 확인). 가입자 시각(지우·민서)과 설계사 시각(도윤)이 둘 다 드러나게 쓴다.

- 가입자: 서지우(가상, 32세, IT 회사 개발자, 연봉 4,800만원, 월 실수령 약 330만원), 배우자 윤민서(가상, 31세, 디자이너, 연봉 3,600만원, 월 실수령 약 260만원). 결혼 1년차, 2027년 첫 아이 계획. 전세 3억원(전세대출 2억원, 연 4%), 예금 3,000만원, 둘의 월 생활비 약 360만원.
- 설계사: 한도윤(가상, 29세, GA(법인보험대리점) 소속 3년차). 지우의 대학 동기. 원칙은 "팔기 전에 분석". 도윤이 받는 수수료와 고객의 이익이 부딪히는 순간도 숨기지 않는다.
- 지금 가진 보험(`INS.CASE.policies`, 2026년 10월): 지우 — 종신보험(2012년 18세 부모님 가입, 사망 1억원+특약, 월 12만원, 20년납), 2세대 실손(월 2.8만원), 갱신형 암보험(2020년 26세, 암 진단 3,000만원+특약, 20년 갱신, 월 3.2만원), 운전자보험(월 1.5만원, 일상생활배상책임 특약 포함), 주택화재보험(월 0.9만원, 일상생활배상책임 특약 포함), 자동차보험(연 74만원 ≈ 월 6.2만원). 민서 — 4세대 실손(월 1.4만원), 회사 단체보험(사망 5,000만원, 단체실손, 회사 부담). 합계 월 28만원(자동차 포함), 자동차 제외 21.8만원.

| 장 | 이 장에서 다루는 것 |
|---|---|
| 01 보험의 지도 | 지우네 소개. 보험 서랍 정리: 계약 8개, 월 28만원. 지우의 질문 "이게 제대로 들어 있는 건가?" 도윤 소개와 첫 만남의 약속(분석 먼저, 판매는 나중). 책 전체가 둘의 상담을 따라간다는 안내. |
| 02 위험을 나누는 수학 | 지우네 위험 목록을 빈도·심도로 분류. 감당할 수 있는 한도(예금 3,000만원 = 생활비 약 8개월)로 보유와 이전의 선을 긋는다. 가장 큰 위험은 소득 중단, (아이가 생기면) 사망, 배상책임. |
| 03 보험료의 구조 | 지우의 종신보험(18세, 예정이율 약 4%)을 3이원방식으로 해부: 주계약 1억원의 위험보험료·저축보험료·부가보험료(`INS.price`). 같은 보장을 오늘(32세, 2.5%) 사면 얼마인지, 지금 해지하면 얼마인지. |
| 04 정보의 비대칭 | 민서의 2년 전 갑상선 결절 추적검사 이력과 고지 항목 대조. 무엇을 알려야 하는지, 알리면 어떻게 되는지(부담보·할증·간편심사), 숨기면 나중에 무슨 일이 생기는지. |
| 05 왜 복잡한가 | 지우 서랍의 특약을 세면 30개가 넘는다. 같은 '암 3,000만원'도 두 계약에서 정의·감액이 다르다. 도윤이 만든 한 장짜리 보장 요약표. |
| 06 약관과 설계서 | 지우 암보험 약관 실습: 보장개시 91일째, 1년 내 50% 감액, 유사암 10%. 도윤이 낸 새 설계서를 받고 청약철회 기간(15일/30일)을 확인한다. |
| 07 갱신형·비갱신형 | 지우의 20년 갱신형 암보험: 46세 갱신 때 보험료가 몇 배가 되는지(`INS.renewal`). 비갱신형 전환 비교와 누적 보험료 교차 나이. 무해지형 제안의 의미(납입 중 해지하면 0원). |
| 08 건강보험·실손 | 지우의 2세대 실손 유지 vs 4세대 전환(보험료 vs 자기부담, `INS.medical`, `INS.silsonPremium`). 민서의 단체실손+개인실손 중복과 개인실손 중지제도. 본인부담상한제로 본 큰 병의 최대 급여 본인부담. |
| 09 진단비·수술비 | 소득 공백 기반 진단비 산정: 지우 실수령 330만원 × 치료·회복 약 12개월 + 비급여 → 암 진단비 약 5,000만원. 기존 특약이 뇌출혈·급성심근경색만 보장 → 뇌혈관질환·허혈성심장질환으로 넓힐 때 보장 확률 차이(`INS.prob`). |
| 10 생명보험 | 첫 아이 계획 → 필요 사망보장(`INS.needs`): 생활비, 전세대출 2억원, 교육비 − 자산·기존 보장 → 공백 계산, 정기보험(60세 만기) 추가 규모 결정. 종신 1억원은 납입 14년째라 유지. 민서의 사망보장도 점검. |
| 11 저축성·연금 | 은행 창구에서 권유받은 월 50만원 '비과세 저축보험' vs 연금저축·ISA. 해지환급금 곡선으로 보고 보류. 비상금과 연금저축이 먼저. |
| 12 손해보험 | 일상생활배상책임이 운전자·화재 두 계약에 중복 → 비례보상이라 하나만 남긴다. 전세집 누수 사례. 자동차보험 갱신: 자차 자기부담금과 특약 할인. |
| 13 사회보험 | 지우네 사회보험 안전망: 건강보험 본인부담상한제, 국민연금 장애·유족연금 추정, 산재보험, 상병수당(시범사업). 사적 보장 필요액이 그만큼 줄어드는 계산. |
| 14 설계사의 존재 | 도윤의 입장. 지우는 친구지만 지인 영업을 피하고 분석부터. 채널 비교: 정기보험은 온라인(CM)이 더 쌀 수 있다는 것을 도윤이 먼저 말한다. 도윤이 가치를 주는 곳은 분석·설계·청구 지원. |
| 15 수수료 | 도윤의 수수료 계산(`INS.commission`): 정기보험·진단비 보강의 수수료 vs 종신 교체(승환) 제안 시 수수료. 승환을 권하면 도윤은 더 벌지만 지우는 손해. 도윤의 선택과 유지율. |
| 16 보험회사 | 지우가 "보험사가 망하면?"을 묻는다. 지급여력비율(K-ICS), 예금자보호 1억원(해지환급금 기준), 계약이전. 실손 보험료가 해마다 오르는 이유를 손해율로 설명. |
| 17 청구와 분쟁 | 민서의 충수염(맹장) 수술 → 실손 + 단체보험 청구 실습, 실손24 전산 청구. 지우 아버지의 과거 고지의무 분쟁 이야기로 분쟁조정 절차. |
| 18 보장 설계 | 최종 보장 분석표 Before/After. 공백 해소·중복 제거 후 월 보험료와 보장의 변화. 우선순위와 예산(가구 실수령의 약 5~8%). |
| 19 좋은 상담 | 도윤의 상담 기록: 적합성 진단, 설명의무 이행, 비교안내 확인서. 3년 뒤 유지율과 소개. 도윤이 겪은 윤리적 딜레마(시책 기간의 압박). |
| 20 실험실 | 독자가 지우네 또는 자기 가족을 넣어 돌린다. |
| 21 용어집 | 케이스 없음. |

## JS 헬퍼 (`IB`, `js/common.js`)
- `IB.canvas(el|선택자, draw(ctx, w, h), {aspect, minHeight, maxHeight})` → `{redraw(), ctx, w, h, canvas}`. 리사이즈·테마 변경 시 자동으로 다시 그린다. draw 안에서 `IB.palette()`를 매번 다시 읽는다. w, h는 CSS px. 문자열은 `querySelector` 선택자이므로 `"#id"`로 넘긴다. 만들자마자 draw를 한 번 부르므로 draw가 읽는 상태와 컨트롤(`IB.range`, `IB.seg`)을 먼저 만든다. 폭에 따라 높이가 달라져야 하면 옵션 객체에 `get height() { … }` getter를 넘긴다.
- `IB.drag(canvas|선택자, {start(x, y, e), move(x, y, e), end(), hover(x, y, e)})` 캔버스 위 끌기(마우스·터치, CSS px). draw에서 계산한 배치(상자, 축 변환)를 바깥 변수에 저장해 두고 move에서 역변환한다.
- `IB.chart(ctx, box|null, {x:[min,max], y:[min,max], logX, logY, xLabel, yLabel, xFmt, yFmt, xTicks, yTicks, series:[{data:[[x,y]], color, width, dash, fill}], vlines:[{x,color,label}], hlines:[{y,color,label}], points:[{x,y,color,r,label}], bands:[{x0,x1,color}]})` → `{X, Y, box}`. 금액 축은 `yFmt: IB.wonAxis`. box를 생략하면 왼쪽 여백 58px이다. 축 글자가 길면 box를 직접 준다.
- `IB.bars(ctx, box|null, {labels, stacks:[{label, color, data}], y, yFmt, yLabel, gap, hlines, highlight, valueFmt})` → `{X(i), Y, box, bw}` 누적 막대(음수는 아래로).
- `IB.donut(ctx, cx, cy, R, [{label, value, color}], {inner, center:{big, small}, labels, highlight})` → `{hit(x, y)}` 도넛.
- `IB.range(id, fmt, onInput)` → `get()`, `get.set(v)`. 출력은 `id + "-out"` 요소.
- `IB.seg(id, onChange)` → `get()`, `get.set(v)`. `IB.stat(id, html)`.
- `IB.loop(el, (dt, t) => {})` 화면에 보일 때만 도는 애니메이션. `.stop()`, `.start()`, `.toggle()`.
- `IB.palette()` → `{bg, text, dim, faint, grid, axis, border, surface, accent, accent2, ok, warn, bad, red, green, blue, series}`, `IB.color(name)`, `IB.isDark()`, `IB.onTheme(cb)`.
- `IB.won(x, {digits, short})` "1억 2,346만원"(10만원 미만은 "45,000원"처럼 원 단위), `IB.wonAxis(x)` "1.2억", "1.5만", `IB.pct(x, digits)` "3.45%", `IB.fmt(x, digits)`.
- `IB.canvas`는 만들면서 draw를 바로 부른다. draw 안에서 자기 반환값을 참조하지 않는다(초기화 전 접근 오류).
- SVG 그림의 viewBox 폭은 420~480 정도로 잡는다. 640~720이면 360px 화면에서 글자가 6px까지 작아진다.
- 고정폭 글꼴(`IB.font(px, true)`, SVG의 `.t-mono`)은 숫자·영문에만 쓴다. 한글은 자간이 벌어진다.
- `IB.font(px, mono, weight)`, `IB.erf`, `IB.rng(seed)`(0~1 난수 함수), `IB.randn()`, `IB.randnSeeded(seed)`, `IB.poisson(λ)`, `IB.debounce`, `IB.clamp/lerp/map`.
- `IB.CHAPTERS`, `IB.PARTS`.

## 보험 계산 엔진 (`INS`, `js/insure.js`)
모든 장이 같은 계산을 쓰게 하는 공통 엔진이다. 보험료·준비금·해지환급금·갱신·의료비·필요 보장·수수료 계산은 직접 만들지 말고 이것을 쓴다(장 고유의 작은 계산은 직접 해도 된다). 단위는 원, 비율은 소수, 나이는 만 나이. 엔진에 필요한 함수가 없으면 장 안에서 만들고, 여러 장이 쓸 만하면 엔진에 추가한다(기존 함수의 동작은 바꾸지 않는다).
- 제도 값: `INS.KR`(청약철회 15/30일, 품질보증해지 3개월, 위법계약해지 1년/5년, 고지의무 해지 제한 1개월·2년·3년, 청구 소멸시효 3년, 예금자보호 1억원, 첫해 수수료 상한 1200%, 보장성보험료 세액공제 100만원·12%, 저축성 비과세 요건, 회차별 유지율 `persistency`, 기대수명 `lifeExp`), `INS.NHIS`(본인부담률 `rate`, 산정특례 `special`, 본인부담상한액 `capByDecile`), `INS.SILSON`(1~4세대와 5세대 개편안의 자기부담 구조·갱신 주기·보험료 배수).
- 생명표·발생률(교육용 근사): `INS.qx(나이, "m"|"f", "insured"|"pop")` 1년 사망확률, `INS.survival(나이, 연수, 성별)` 생존확률 배열, `INS.lifeExpectancy(나이, 성별, 표)`, `INS.incidence(kind, 나이, 성별)` 1년 발생확률(kind: `cancer`, `stroke`, `hemorrhage`, `cerebro`, `ami`, `ischemic`, `hosp`, `death`), `INS.prob(kind, 나이, 연수, 성별)` 기간 내 첫 발생 확률, `INS.INC_KINDS` 이름표. 평생 암 발생 확률은 남 약 40%, 여 약 37%로 맞춰 두었다.
- 보험수리: `INS.price({type, age, sex, S, term, pay, i, alpha, beta, gamma, fee, amort, lapse, refund, loadOnly})` → `{annual, monthly, net, netStd, parts:{risk, saving, expense}, rows:[{t, age, inforce, persist, paid, reserve, surrender, ratio}], breakEven, epv}`. type은 `term`(정기), `whole`(종신, 110세까지), `endow`(양로), `pure`(순수 만기 저축), 또는 발생률 kind(진단 시 1회 지급). `refund`: 1 표준형, 0 무해지, 0.5 저해지(납입 중 해지환급금 비율), `lapse`: 연 해지율(무해지 가격에 반영). 예: 32세 남 종신 1억원 20년납(2.5%) 월 약 16.3만원, 같은 조건 무해지(해지율 4%) 약 10.5만원, 정기 3억원 60세 만기 약 3.9만원.
- `INS.natural(kind, 나이, S, 성별, 부가율)` 자연보험료(1년 만기) 월 금액. `INS.renewal({kind, age, sex, S, period, until, levelPay, trend, margin, fee})` → `{steps:[{age, monthly, years}], level:{monthly, total, pay}, renewTotal, crossAge}`.
- 의료비: `INS.medical({cost, nonCov, setting, special, gen, mild})` → `{covered, nhis, copay, nonCovered, patient, silson, oop, rate}`(setting: `inpatient`, `clinic`, `hospital`, `general`, `tertiary`; special: `cancer`, `rare`; gen: 0 없음, 1~5). `INS.cap(연 급여 본인부담, 분위)` → `{cap, refund, paid}`. `INS.silsonPremium(나이, 세대, 성별)` 월 보험료(교육용 곡선).
- 위험: `INS.pool(N, p, L)` → `{mean, sigma}`, `INS.expectedLoss(p, L, premium)` → `{el, load, ratio}`.
- 설계: `INS.needs({monthlyExpense, years, inflation, rate, debt, education, funeral, assets, existing, survivorPension})` → `{expensePV, pensionPV, need, have, gap}`, `INS.incomeGap(월 실수령, 개월, {keep, extra})`.
- 판매: `INS.commission({monthly, total, first, years, lapseYear, claw})` → `{rows:[{year, paid, claw, net}], gross, clawback, net}`(기본: 총 17배, 첫해 12배, 7년, 1년차 해지 100%·2년차 50% 환수).
- 기본: `INS.fv(월이율, 개월, 월납, 현재)`, `INS.pv(월이율, 개월, 월액)`, `INS.monthly(연율)`, `INS.grow(월납, 연수익률, 연수)`, `INS.rng(seed)`, `INS.gauss(seed)`, `INS.insAge(생년월일, 기준일)` → `{full, insurance, nextChange}`(보험나이와 상령일).
- 케이스: `INS.CASE` (위 표의 인물 값과 `policies`, `total`).

엔진의 사망률·발생률·보험료는 실제 통계와 상품의 크기를 흉내 낸 **교육용 근사**다. 본문에서 엔진 값을 쓸 때는 "이 책의 모델로 계산하면", "교육용 모델에서" 같은 말을 붙이고, 실제 보험료는 나이·성별·직업·병력·회사·가입 시기에 따라 크게 다르다고 밝힌다.

## 점검
- `python3 tools/check.py <slug>` (playwright 필요). 넓은 화면·라이트와 360px·다크로 열어 콘솔 오류, 가로 넘침, 조작 중 예외를 보고한다. `--shots 폴더`로 스크린샷을 남겨 눈으로도 본다. 크로미움 경로는 `CHROMIUM_PATH` 환경 변수로 바꿀 수 있다.
- 브라우저 콘솔에 오류가 없어야 한다. 다크·라이트 테마 모두 확인.
- 캔버스 글자는 `IB.font()`로, 색은 `IB.palette()`로.
