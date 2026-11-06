# 소드 레릭 (SWORD RELIC) 작업 안내

마스터 오브 소드 감성의 픽셀 메트로베니아 웹게임. Phaser 3.80 + Vite. 주인(우즈)과는 한국어로 대화하고, 코드 주석도 한국어로 씀.

## 명령

```bash
npm install
npm run dev           # 개발 서버
npm run build         # dist/
npm run build:single  # dist-single/index.html 한 파일 빌드 (Phaser는 CDN)
```

- `main` 브랜치에 push하면 Vercel에 자동 배포됨. 주소 https://swordrelic.com (www는 여기로 넘김, sword-relic.vercel.app은 index.html 맨 위 스크립트가 localStorage `sr_*`를 주소 `#move=`에 담아 swordrelic.com으로 넘김. 받는 쪽은 플레이 시간 `time`이 긴 세이브를 남기고, 설정은 없을 때만 씀. vercel.app으로 홈 화면에 추가한 앱(standalone)은 넘기지 않고 위에 "swordrelic.com 열기" 안내 줄만 띄움).
- 일반 방문자는 제목·게임·소리 버튼만 보임. 설명·조작·지역·장비 카드와 테스트 버튼은 주소 뒤 `?dev`로 켬 (`?dev=0` 끔, localStorage `sr_dev`).
- 홈 화면에 추가(PWA): `public/manifest.webmanifest`, 아이콘 `icon-192/512.png`, 서비스 워커 `public/sw.js` (새 파일 먼저 받고 끊기면 저장본, 배포판에서만 등록).
- 방문자 통계: Vercel Web Analytics, index.html 머리의 `/_vercel/insights/script.js` (서비스 워커는 `/_vercel/`을 건드리지 않음). 보는 곳은 Vercel 대시보드 Analytics 탭.
- 검색·공유: index.html 머리의 description·og·twitter·JSON-LD, 썸네일 `public/og.png`(1200×630), `public/robots.txt`, `public/sitemap.xml`. 도메인을 바꾸면 이 세 곳의 swordrelic.com을 같이 바꿀 것.
- 바뀐 게 생기면: 수정 → `npx vite build`로 빌드 확인 → 직접 해 보기(또는 아래 헤드리스 확인) → 커밋·push.

## 구조

- `src/scenes/PlayScene.js`: 본 게임. 기능별로 나눈 믹스인을 `Object.assign(PlayScene.prototype, PlayUI, Economy, Gimmicks, MenuMixin, Fx, Skills)`로 붙임.
  - `playUI.js` NPC·대화·지도·워프·퀵슬롯 / `economy.js` 골드·대장간·상점 / `gimmicks.js` 문·스위치·철문·누름판·횃불·물·용암·모래 늪, 하늘(상승 기류·바람·바닥 없는 낙하), 마왕성(어둠·저주 가시·순간이동 문)
  - `menu.js` 장비창(I) / `fx.js` 무기별 공격 이펙트 / `skills.js` 무기별 C 스킬 / `monsters.js` 몬스터·보스 AI와 지역 배율 `TIER` (지역 고유 몬스터: 동굴 거미 spider, 고성 유령 ghost(벽 통과·noclip), 얼음 눈사람 snowman, 용암 폭탄 바위 bomber, 초원 뿔 토끼 hare, 고목 꿀벌 bee, 사막 모래 지렁이 worm(땅속에선 body 꺼짐) / 2차: 초원 버섯 shroom, 고목 사마귀 mantis(updateKnight 재사용), 동굴 두더지 mole(숨으면 body 꺼짐), 고성 가고일 garg(stone 상태), 얼음 정령 iwisp(냉기 `chillT`), 사막 독수리 vult, 용암 슬라임 mslime(불길 `still` 투사체), 하늘 천둥 구름 tcloud, 마왕성 미믹 mimic(잘 땐 chest0) / 하피는 U자 활강, 눈알 박쥐는 광선 구슬)
- `src/world/rooms.js`: 방 데이터(104개, 지역마다 13곳). 하늘 성채(s1~s13)는 고성 탑 꼭대기(k7) 봉인 위, 화염 골렘을 잡으면 열림 → 그리폰 → 마왕성(m1~m13) → 마왕(엔딩). 맵은 `build(p)` 안에서 painter로 그림 (`ground`, `block`, `plat`, `leaf`, `ladder`, `vine`, `spikes`, `water`, `sand`, `lava`, `blockA/B`, `clear`).
  - 출구: `left/right`는 방 id, `up/down`은 `{to, tx}`. `grid`는 미니맵 좌표. 모든 방 높이 14줄, 타일 16px.
  - `scene.restart`로 방을 다시 만들기 때문에 `create()`에서 상태를 꼭 초기화할 것 (같은 씬 인스턴스를 재사용함).
- `src/world/meadow.js`: 지역 테마별 타일과 배경 (meadow, treetop, cave, castle, ice, desert, lava, sky, demon), 지도 색 `THEME_COL`.
- `src/data/items.js`: 장비(`ITEMS`), 세트(`SETS`: 철 기사, 흑철, 청기사, 흑월, 적월, 용기사, 천공 기사, 마검사), 강화 비용.
- `src/gfx/hero.js`: 주인공 도트(문자열 한 글자 = 픽셀 하나, 글자 = 색 슬롯). 투구 모양 full | great | crown | horned | moon | bloodmoon | dragon | winged | demon, 갑옷 plate | heavy | spike | moon | dragon.
- `src/gfx/sprites.js`: 아이템 아이콘, 검 모양, 몬스터 텍스처.
- `src/state.js`: 진행 상황 저장 (localStorage `sr_save2`). 방에 들어올 때마다 자동 저장, 이어하기는 마지막 석상(없으면 r1). 보스가 살아 있는 방에서 지면 그 방 입구에서 다시. 이름 `STATE.name`(대사의 `{name}`과 말하는 사람 "나"가 이름으로 바뀜), 쓰러진 횟수 `deaths`는 마왕 엔딩 기록에 나옴.
- `src/sfx.js`: 효과음을 Web Audio로 합성 (`sfx('slash'|'hit'|'jump'|'coin'|'hurt'|'chest'|'door'|'gate'|'fanfare')`). 첫 입력 때 소리를 켜고, 출력 앞에 리미터. 소리 끄기는 `setMuted` (localStorage `sr_mute`), 음량은 `setVolume(m|f)` (`sr_vol`). 설정 창은 index.html의 `#setdlg` (PC "설정" 버튼, 폰 "설정" 칸, 폰 버튼 크기 `sr_bs` → CSS `--bs`). PC 키 설정은 `input.js`가 고른 키를 원래 키(KeyZ 등)로 바꿔 기록해서 게임 코드는 그대로 (`sr_keys`, `ACTIONS`). PC "전체 화면" 버튼은 `#stage`만 전체 화면, `calcScale`이 화면 가득으로 계산. 안드로이드 크롬의 자동 "앱 설치" 알림은 `beforeinstallprompt`에서 막음.
- `src/bgm.js`: 배경음악. 곡은 코드·멜로디 글자로 적고, OfflineAudioContext로 한 바퀴를 미리 만들어 반복 재생 (실시간 예약은 끊겨서 안 씀). 방 곡은 `PlayScene.roomSong()`: 안 잡은 보스 → boss, 고향 마을(v1) → village, 나머지는 지역 테마.

## 규칙과 공식

- 받는 피해 = 원래 피해 × 40 / (40 + 방어), 적이 받는 피해 = × 30 / (30 + 적 방어).
- 지역 배율 `TIER`: 초원·고목 1, 동굴 1.4, 고성 1.9, 얼음 2.4, 사막 2.9, 용암 3.4, 하늘 3.9, 마왕성 4.4. 몬스터 체력·경험치는 배율 그대로, 공격·함정 피해는 `0.6 + 0.4 × 배율`. 보스는 배율 없이 따로 정한 수치.
- 누름판은 상자로만 눌림 (주인공이 밟아도 안 열림). 누름판·횃불 철문은 한 번 열리면 계속 열려 있고, 반대편(안쪽)에서 다가가도 열림.
- 위아래로 이어진 방은 아무 데서나 떨어져도 아래 방 같은 자리로 감. 뛰어오를 땐 위 방 바닥이 막혀 있으면 천장처럼 막힘. 용암·가시·모래 구덩이 바닥으로 빠지면 피해 + 안전한 곳으로.

## 헤드리스 확인 방법

`npx vite preview --port 4173` 후 Playwright로 열고, 브라우저 콘솔의 디버그 훅 `window.SR`을 씀.

- `SR.scene` 현재 PlayScene, `SR.state` 진행 상황, `SR.items` 장비 데이터
- 원하는 방으로 바로 가기: `SR.game.scene.getScenes(true).forEach(s=>SR.game.scene.stop(s.scene.key));SR.game.scene.start('play',{room:'d5',entry:'left'})` (entry: left | right | top | bottom | start | save)
- 모든 장비 받기: `SR.scene.giveAllForTest()`
- 헤드리스(swiftshader)에서는 게임이 실제보다 약 3배 느리게 돎. 대기 시간을 넉넉히 줄 것.
- 방 구조 점검: `node tools/reach.mjs . [방id,...] [--nodj]` — 실제 점프 물리로 입구마다 못 가는 출구·못 닿는 상자/스위치/횃불을 찾음. 알려진 예외: k3 벽 점프 통로(박쥐 망토), s5 위 출구(일부러 막음), s7 상승 기류(옆 칸으로 내려오면 됨).
- 플레이어를 순간 이동할 땐 `p.setPosition` 말고 `p.body.reset(x, y)` (안 그러면 타일 충돌이 꼬임).

## 다음에 할 만한 것

- 모바일: 터치(`pointer:coarse`)면 `body.mobile` (PC에서는 주소 뒤 `?mobile`). 세로는 위 게임 + 아래 조작판, 가로는 게임 가득 + 반투명 버튼. 이동은 아날로그 스틱(`main.js`, 45° 근처는 대각선. 가로 화면은 왼쪽 아래 넓은 영역 어디든 엄지를 대면 그 자리에 생김). 세로 화면은 휴대용 게임기 모양 (style.css 맨 아래), 위쪽 버튼 줄은 실제 아이템 아이콘·개수를 보여 줌. 창마다 폰 전용 `addCloseBtn` 닫기 버튼, 컷신은 건너뛰기 글자 누르기. 폰에서 NPC·워프·순간이동 문은 공격 버튼으로 (`keyText`가 안내 문구의 "↑ 키"도 바꿈). 장비창에서 C는 다음 칸. 폰은 렌더 밀도 2배까지, 배경음악은 지금 곡만 메모리에 둠. 오류는 화면에 빨간 상자로 뜸. 남은 것: 실제 폰에서 버튼 크기 다듬기, 앱 출시는 Capacitor.
