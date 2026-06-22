# 대학교 밥먹자

대학교 밥먹자는 캠퍼스 안 식당과 메뉴를 보여주고, 학생이 메뉴를 선택해 주문과 결제까지 진행할 수 있도록 만드는 대학 전용 음식 주문 앱입니다.

현재 버전은 상용화 전 MVP 프로토타입입니다. 실제 서버, 인증, 결제 API 연동 전 단계이며, 앱 화면 흐름과 사용자 경험을 빠르게 검증하는 것을 목표로 합니다.

## 현재 구현된 기능

- 한국공학대학교 로고 기반 스플래시 화면
- 학교 식당 리스트 화면
- 식당 상세 및 메뉴 목록 화면
- 메뉴 상세, 옵션 선택, 수량 선택
- 장바구니 담기, 수량 변경, 삭제
- 장바구니 담기 토스트와 장바구니 바로가기
- 더미 결제 화면
- 주문 완료 화면
- 음식 취향 기반 추천 화면
- 둥근 한글 앱 폰트 적용
- 웹 프로토타입 빌드
- Android APK 미리보기 빌드 준비

## 추천 기술 스택

### 앱

- Expo
- React Native
- React Navigation
- TypeScript 전환 예정

### 백엔드

- NestJS 또는 Express
- PostgreSQL
- Prisma
- Redis

### 인증

- Firebase Auth 또는 Supabase Auth
- 학교 이메일 인증
- 카카오/애플 로그인 확장 가능

### 결제

- 토스페이먼츠 또는 포트원
- 카드 정보 직접 저장 금지
- 서버 결제 검증 필수

### 배포/운영

- AWS, Render, Railway, Fly.io 중 MVP 단계에 맞게 선택
- Sentry
- Grafana/Prometheus 또는 클라우드 기본 모니터링
- Discord/Slack 알림

## 폴더 구조

```text
BABMUKJA-project/
├─ App.js
├─ package.json
├─ app.json
├─ assets/
│  ├─ fonts/
│  ├─ app-icon.png
│  └─ tuk-logo.png
├─ docs/
│  ├─ commercialization-roadmap.md
│  └─ security-architecture.md
├─ scripts/
├─ src/
│  ├─ components/
│  ├─ data/
│  ├─ navigation/
│  ├─ screens/
│  ├─ services/
│  ├─ store/
│  ├─ theme/
│  └─ utils/
└─ dist-web/
```

## 실행 방법

의존성 설치:

```bash
npm install
```

웹 실행:

```bash
npm run web
```

Expo 실행:

```bash
npm start
```

Android 실행:

```bash
npm run android
```

iOS 실행:

```bash
npm run ios
```

웹 프로토타입 빌드:

```bash
npm run build:web
```

## 상용화 방향

이 프로젝트는 앞으로 다음 순서로 발전시킵니다.

1. 앱 화면과 사용자 흐름 정리
2. JavaScript에서 TypeScript로 전환
3. 더미 데이터를 서비스 계층으로 분리
4. 백엔드 API 설계
5. DB 스키마 설계
6. 로그인/학교 인증 구현
7. 주문 생성 및 주문 상태 시스템 구현
8. 결제 PG 연동
9. 관리자 페이지 구현
10. 배포, 모니터링, 장애 대응 자동화

자세한 상용화 계획은 [docs/commercialization-roadmap.md](docs/commercialization-roadmap.md)를 참고합니다.

보안 설계는 [docs/security-architecture.md](docs/security-architecture.md)를 참고합니다.
