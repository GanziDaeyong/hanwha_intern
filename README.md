## Beatrace Crypto-Currency Wallet Project

---

### 개요

- 크롬 익스텐션을 활용한 이더리움 지갑입니다.
- 메타마스크의 핵심 기능 (이더, 토큰 전송, 계정 관리, 로그 등)을 제공하며, 추가적으로 ERC20 토큰 생성, 소유한 모든 토큰 자동 임포트 등의 기능을 제공합니다.
- 해당 프로젝트는 한화생명 신사업부문 사이버보안노드에서 진행되었습니다.

---

### 스택

- 바닐라 JS, Chrome API, Web3js (익스텐션)
- NodeJS, Express (크롤링 서버)
- SpringBoot, Solcjs (토큰 컴파일 서버)

---

### 기능

- 지갑: 지갑 생성 / 지갑 로드
- 계정: 계정 생성 / 계정 로드 / 계정 선택 / 계정명 변경 / 계정 상세정보 / 계정 잔고(ㅇ더, 토큰) 조회
- 전송: 이더 전송 / 토큰 전송
- 로그: 계정별 로그 조회
- 토큰: 토큰 생성 / 토큰 개별 로드 / 토큰 일괄 로드 / 토큰 잔고 업데이트
- 컨택: 개발자 정보 / 피드백 전송

---

### 사용법

1. 해당 레포지토리를 클론합니다.
2. chrome://extensions로 이동 후 개발자 모드를 켭니다.
3. Load Unpacked에서 manifest.json이 위치한 경로를 임포트합니다.
4. 익스텐션에서 pin 설정합니다.

---

### 주의

- 서버 가용성, 폰트 및 아이콘의 저작권, 가스 수수료 최적화 등을 고려했을 때, 실사용/상용화에는 아직 적합하지 않습니다.
- Ropsten 테스트넷을 기준으로 합니다. 그 외의 서버는 직접 커스텀하셔야 합니다. 추후 메인넷으로 확장할 계획이 있습니다.
