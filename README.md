# 대학교 밥먹자

대학교 밥먹자는 캠퍼스 안 식당과 메뉴를 보여주고, 사용자가 음식을 선택해 더미 결제까지 진행할 수 있는 대학 전용 음식 주문 앱 MVP입니다.

## 앱 전체 기능 요약

- 앱 실행 시 대학교 로고가 나오는 스플래시 화면
- 학교 안 식당 리스트 확인
- 음식 추천 배너와 카테고리 기반 랜덤 추천
- 식당별 메뉴 목록 확인
- 메뉴 상세, 옵션 선택, 수량 선택
- 장바구니 담기 또는 바로 결제
- 더미 결제 화면
- 주문 완료 화면

## 추천 기술 스택

- React Native
- Expo
- React Navigation
- Context API
- 더미 데이터 기반 프론트엔드 MVP

## 폴더 구조

```text
BABMUKJA-project/
├── App.js
├── package.json
├── assets/
├── src/
│   ├── components/
│   ├── data/
│   ├── navigation/
│   ├── screens/
│   ├── services/
│   ├── store/
│   └── utils/
└── README.md
```

## 실행 방법

의존성 설치:

```bash
npm install
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

웹 미리보기:

```bash
npm run web
```

## Windows EXE 미리보기

PC에서 바로 확인할 수 있도록 `windows-preview` 폴더에 Windows용 미리보기 앱을 분리해두었습니다.

현재 PC에서 바로 실행 파일을 만들 때는 아래 명령어를 사용합니다.

```bash
python -m PyInstaller --onefile --windowed --name UniversityBabmukja windows-preview/babmukja_preview.py
```

빌드 후 실행 파일:

```text
dist/UniversityBabmukja.exe
```

`desktop-preview` 폴더에는 .NET WinForms 버전의 미리보기 앱도 준비되어 있습니다. .NET SDK가 설치된 PC에서는 아래 명령어로 빌드할 수 있습니다.

빌드:

```bash
dotnet publish desktop-preview -c Release -r win-x64 --self-contained false -p:PublishSingleFile=true
```

빌드 후 실행 파일:

```text
desktop-preview/bin/Release/net9.0-windows/win-x64/publish/UniversityBabmukja.exe
```

## MVP 개발 순서

1. 스플래시 화면
2. 식당 리스트 화면
3. 음식 추천 배너와 추천 결과 화면
4. 식당 상세 및 메뉴 리스트 화면
5. 메뉴 상세 화면
6. 장바구니 상태 관리
7. 더미 결제 화면
8. 주문 완료 화면
9. Firebase 또는 백엔드 연결 준비

## 데이터 구조

현재는 `src/data/dummyData.js`에 더미 데이터를 넣었습니다. 나중에 Firebase나 백엔드 서버를 붙일 때는 `src/services` 안의 함수만 실제 API 호출로 바꾸면 됩니다.

추천 기능은 메뉴 데이터의 `category`, `tags`, `recommendationText` 값을 사용합니다. MVP에서는 단맛, 짠맛, 국물, 볶음, 든든함 같은 취향 트리를 따라 선택한 태그와 가장 잘 맞는 메뉴를 추천합니다.
