# InsureBook — 보험이 복잡한 이유를 푸는 교과서

보험은 왜 이렇게 복잡하고, 보험설계사는 왜 존재하는가. 위험을 나누는 수학에서 보험료 계산, 약관과 갱신, 실손·진단비·종신·저축성·자동차보험, 수수료와 보험회사의 속사정, 청구와 분쟁, 보장 설계까지 직접 만지며 배우는 한국어 인터랙티브 교과서입니다.
처음 보험을 드는 사람부터 가족의 보험을 정리하는 사람, 현장의 보험설계사까지를 독자로 삼습니다. 본문은 일반인 기준으로 쓰고, 현장 실무는 "설계사 노트", 바로 확인할 항목은 "가입자 체크" 상자로 덧붙입니다.
책 전체가 가상의 부부 서지우·윤민서와 설계사 한도윤의 상담(지우네 상담 노트)을 따라가며, 20장에서는 독자가 자기 가족을 넣어 봅니다.

배포 주소: https://insurebook.euiyun.com/

## 실행
빌드 과정이 없는 정적 사이트입니다.

```bash
python -m http.server 8000   # → http://localhost:8000
```
`index.html`을 브라우저로 바로 열어도 동작합니다. KaTeX와 폰트는 CDN에서 불러오므로 인터넷 연결이 필요합니다.

## 구성

| 장 | 파일 | 부 | 주제 |
|---|---|---|---|
| 01 | chapters/overview.html | — | 보험의 지도: 이상한 상품, 생태계, 복잡함의 원천, 설계사의 존재 이유 |
| 02 | chapters/pooling.html | 원리 | 빈도·심도, 대수의 법칙, 기대손실, 효용과 파산 회피 |
| 03 | chapters/pricing.html | 원리 | 생명표, 3이원방식, 평준보험료, 책임준비금, 해지환급금 |
| 04 | chapters/asymmetry.html | 원리 | 역선택, 도덕적 해이, 고지의무, 언더라이팅, 면책·감액 |
| 05 | chapters/complexity.html | 구조 | 특약 조합, 묶음 판매, 같은 이름 다른 정의 |
| 06 | chapters/contract.html | 구조 | 설계서·약관 읽기, 보장개시, 청약철회·위법계약해지 |
| 07 | chapters/renewal.html | 구조 | 갱신형·비갱신형, 무해지·저해지, 납입기간 |
| 08 | chapters/health.html | 상품 | 국민건강보험, 본인부담상한제, 실손 세대, 중복 가입 |
| 09 | chapters/fixed.html | 상품 | 진단비·수술비·입원비, 소득 공백, 보장 범위 |
| 10 | chapters/life.html | 상품 | 필요 사망보장, 정기와 종신, 단기납 종신 |
| 11 | chapters/savings.html | 상품 | 저축성·연금·변액보험, 비과세, 실질 수익률 |
| 12 | chapters/property.html | 상품 | 실손보상, 비례보상, 자동차·화재·배상책임 |
| 13 | chapters/social.html | 상품 | 건강보험·국민연금·산재·고용·장기요양 |
| 14 | chapters/agent.html | 시장 | 보험설계사는 왜 존재하는가, 판매채널, 이해상충 |
| 15 | chapters/commission.html | 시장 | 신계약비, 1200% 규칙, 환수, 승환계약 |
| 16 | chapters/company.html | 시장 | 손해율, 금리, IFRS17·CSM, K-ICS, 재보험 |
| 17 | chapters/claim.html | 시장 | 청구 절차, 소멸시효, 손해사정, 분쟁조정 |
| 18 | chapters/planning.html | 설계 | 생애 단계, 보장 분석표, 유지와 교체 |
| 19 | chapters/advisor.html | 설계 | 금융소비자보호법 판매원칙, 적합성, 좋은 상담 |
| 20 | chapters/lab.html | — | 보장 설계 실험실 |
| 21 | chapters/glossary.html | — | 용어집, 종합 퀴즈 |

공통 코드
- `css/style.css` — 디자인 토큰(라이트/다크), 설계사 노트·가입자 체크 상자
- `js/common.js` — 내비게이션, 검색, 캔버스·차트·막대·도넛·끌기 헬퍼, 전역 `IB`
- `js/insure.js` — 2026년 제도 값, 생명표·발생률 모델, 3이원방식 보험료·준비금·해지환급금, 갱신, 의료비 분담, 필요 보장, 수수료 계산, 전역 `INS`
- `tools/head.py` — 챕터 `<head>`·사이트맵·JSON-LD 생성기
- `tools/check.py` — 페이지 점검기(콘솔 오류, 가로 넘침, 조작 중 예외)

레이아웃과 시뮬레이터 헬퍼는 같은 시리즈의 [MoneyBook](https://github.com/geniuskey/moneybook)에서 가져왔습니다. 챕터 작성 규칙은 [CONTRIBUTING.md](CONTRIBUTING.md)를 참고하세요.
제도 수치는 2026년 한국 제도를 바탕으로 한 교육용 대표값이며 해마다 바뀝니다. 보험료와 확률은 교육용 모델로 계산한 값입니다. 이 사이트는 특정 보험사나 상품을 권하지 않으며 보험 상담·법률 자문이 아닙니다.

## 배포 (GitHub Pages)
`CNAME`에 `insurebook.euiyun.com`이 들어 있습니다. `main` 브랜치에 푸시하면 GitHub Actions가 `@euiyun/book`으로 `.book-dist/`를 만들어 배포합니다(저장소 Pages 설정의 소스를 GitHub Actions로 둡니다).

## 라이선스

Copyright (c) 2026 geniuskey and InsureBook contributors

| 적용 대상 | 라이선스 | 재사용 조건 |
|---|---|---|
| JS·CSS·Python·HTML의 실행 코드 | [MIT](LICENSE-MIT) | 수정·재배포·상업적 이용 가능. 저작권 및 라이선스 고지 유지 |
| 교재 본문·그림·문제·해설 | [CC BY 4.0](LICENSE-CC-BY-4.0) | 수정·번역·재배포·상업적 이용 가능. 저작자·출처·라이선스 표시 및 변경 사실 명시 |

자세한 내용은 [라이선스 안내](LICENSE.md)를 참고하세요.
