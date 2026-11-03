# 소드 레릭 (SWORD RELIC)

마스터 오브 소드 감성의 픽셀 메트로베니아 웹게임. Phaser 3 + Vite.

## 실행

```bash
npm install
npm run dev       # 개발 서버 (저장하면 자동 새로고침)
npm run build     # dist/ 에 배포용 빌드
npm run preview   # 빌드 결과 로컬 확인
npm run build:single  # dist-single/index.html 한 파일짜리 빌드 (Phaser는 CDN)
```

## 조작

| 키 | 동작 |
|---|---|
| ← → | 이동 |
| X / Space | 점프 (길게 누르면 더 높이) |
| ↓ + X | 나무 발판 아래로 내려가기 |
| Z | 공격 (연타 시 3단 콤보) |
| C | 검기 (MP 10) |
| 0 ~ 3 | 장비 단계 미리보기 |

## 폴더 구조

```
src/
  main.js              게임 시작, 화면 배율, 터치 버튼, 캐릭터 만들기 UI
  config.js            화면 크기, 타일 크기, 이동/점프 수치
  zoom.js              화면 배율 계산
  style.css            페이지 스타일
  scenes/
    PlayScene.js       게임 본체 (플레이어, 전투, 적 AI, HUD)
  gfx/
    pixel.js           도트 그리기 헬퍼
    hero.js            주인공 레이어 도트, 커스텀 색, 장비 데이터
    sprites.js         슬라임, 이펙트, 검 텍스처 생성
    fonts.js           픽셀 숫자/영문 폰트
  world/
    map.js             맵 배치, 적 스폰 위치, 횃불 위치
```

### 자주 고칠 곳

- **이동 속도, 점프 높이**: `src/config.js`의 `SPEED`, `JUMP`, `GRAV`
- **장비 이름, 공격력, 색상**: `src/gfx/hero.js`의 `GEAR`
- **커스텀 색상 목록**: `src/gfx/hero.js`의 `LOOK_OPTS`
- **맵 모양, 적 위치**: `src/world/map.js`

### 도트 데이터 읽는 법

도트는 문자열로 그려져 있고, 글자 하나가 픽셀 하나, 글자 종류가 색 슬롯이에요.
`k` 외곽선, `h` 머리, `s` 피부, `t` 상의, `p` 하의, `f` 신발, `a` 갑옷 등.
커스텀이나 장비가 바뀌면 같은 도트에 슬롯 색만 바꿔 다시 그려요.

## 배포

`main` 브랜치에 푸시하면 Vercel이 자동으로 빌드·배포해요.
Vercel 설정은 기본값 그대로 (Framework: Vite, Build: `npm run build`, Output: `dist`).
