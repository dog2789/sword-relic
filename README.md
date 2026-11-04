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
| ↑ ↓ | 사다리·덩굴 타기 |
| ↑ (NPC 앞) | 대화 (↑ 또는 Z로 넘기기) |
| ↑ (워프 받침대 위) | 워프 메뉴 (등록한 곳이 2개 이상일 때) |
| X / Space | 점프 (길게 누르면 더 높이) |
| ↓ + X | 나무 발판 아래로 내려가기 |
| ↓ + Z (공중) | 하단 찌르기 (적·상자·벽에 닿으면 튀어 오름) |
| 벽 쪽 방향키 + X | 벽 점프 (박쥐 망토를 꼈을 때, 공중에서 벽에 붙어 있으면) |
| Z | 공격 (연타 시 3단 콤보), 상자 열기, 금 간 벽 부수기 |
| C | 검기 (MP 10) |
| X (공중에서) | 2단 점프 (킹슬라임 처치 후) |
| I | 장비창 (무기, 투구, 갑옷, 신발, 장신구) |
| M | 전체 지도 + 탐험률 |
| 1 ~ 4 | 퀵슬롯 (회복 물약, 마나 물약) |

## 폴더 구조

```
src/
  main.js              게임 시작, 화면 배율, 터치 버튼
  config.js            화면 크기, 타일 크기, 이동/점프 수치
  zoom.js              화면 배율 계산
  style.css            페이지 스타일
  scenes/
    TitleScene.js      타이틀 화면 (새로 시작 / 이어하기)
    CustomizeScene.js  캐릭터 만들기 (새로 시작할 때 인트로 전에 나옴)
    IntroScene.js      인트로 스토리 컷씬 4장
    economy.js         골드, 대장간(무기 강화), 잡화점
    gimmicks.js        열쇠·색깔 문, 포탑, 스위치 블록(시간 스위치), 상자·누름판·철문, 횃불, 물(헤엄), 얼음, 고드름
    fx.js              무기별 공격 이펙트, 하단 찌르기 잔상·충격파
    menu.js            장비창(도감 그리드)과 상태창
    PlayScene.js       게임 본체 (플레이어, 전투, 적 AI, 지형 기믹, 장비창, HUD, 미니맵)
    playUI.js          대화창·NPC, 워프, 전체 지도, 퀵슬롯
    monsters.js        슬라임 외 몬스터와 보스 (박쥐, 가시 달팽이, 망령 갑옷, 박쥐 군주, 녹슨 수문장) 스탯과 AI
  data/
    items.js           장비 아이템, 소모품, 세트 효과, 능력치 계산
  gfx/
    pixel.js           도트 그리기 헬퍼
    hero.js            주인공 레이어 도트, 커스텀 색, 장비 데이터
    sprites.js         슬라임, 이펙트, 검 텍스처 생성
    fonts.js           픽셀 숫자/영문 폰트
  state.js             진행 상황(스탯, 장비, 능력, 방문 기록)과 저장/불러오기
  world/
    rooms.js           방 데이터: 지형, 출구, 적, 석상, 상자, 결정, 보스
    meadow.js          지역 테마 그리기 (초원, 동굴, 나무 위, 고성) + 타일(사다리, 덩굴, 가시, 잎 발판)
```

### 자주 고칠 곳

- **이동 속도, 점프 높이**: `src/config.js`의 `SPEED`, `JUMP`, `GRAV`
- **장비 추가**: `src/data/items.js`의 `ITEMS`에 항목 추가 (slot, 능력치, look, set, effects)
- **세트 효과**: `src/data/items.js`의 `SETS`
- **장비 획득 위치**: `src/world/rooms.js`의 chest.item, boss.drop
- **커스텀 색상 목록**: `src/gfx/hero.js`의 `LOOK_OPTS`
- **방 모양, 적·상자·석상·워프·NPC 위치**: `src/world/rooms.js` (mobs: `{t:'bat'|'snail',tx,ty}`, warp, npc)
- **NPC 대사**: `src/scenes/playUI.js`의 `NPC_TALK` (방 데이터 `npcs:[{id,tx,tex,name}]`)
- **컷신**: 방 데이터 `event:{id, lines:[{n:'이름',t:'대사'}]}` (처음 들어올 때 한 번), 보스 처치 후는 `boss.after`
- **강화 비용·공격력**: `src/data/items.js`의 `WLV_COST`, `wlvAtk`
- **상점 물건**: `src/scenes/economy.js`의 `SHOP`
- **장치**: 방 데이터 `doors`, `turrets`, `switches`(`timer` 초), `icicles`, `crates`, `plates`(`gate` id, `latch`), `gates`, `torches`(`gate` id), `chests:[{gold}|{item:'key_red'}]`, 맵 글자 `~`(물) `A`/`B`(스위치 블록) `S`(모래 늪) `L`(용암), `geysers`(화염 분출구), `gates`의 `boss`(보스를 쓰러뜨리면 열림)
- **몬스터·보스 수치**: `src/scenes/monsters.js`의 `MOBS`, 지역별 강화 배율은 `TIER` (함정 피해도 같은 배율)
- **방어 공식**: 받는 피해 = 원래 피해 × 40 / (40 + 방어), 적은 × 30 / (30 + 적 방어)
- **보스 배치**: 방 데이터의 `boss:{id, tx, ty, drop, title(영문 배너), intro(등장 문구)}` (id: king | batlord | rust)
- **소모품**: `src/data/items.js`의 `CONSUMABLES`
- **방 추가**: `ROOMS`에 항목을 추가하고 이웃 방의 `exits`에 연결 (미니맵은 `grid` 좌표로 자동 표시)
  - 위아래 연결: `exits.up/down = {to, tx}` 출구가 있는 열에 사다리(H)나 덩굴(V)을 둠
  - 아래 출구가 있는 방에서 `tx` 열(±1.5칸) 말고 다른 곳으로 떨어지면 다음 방으로 가지 않고, 피해를 입고 마지막으로 딛고 섰던 곳에 돌아옴 (`fallPit`)
  - 지역마다 13곳 이상: 초원(마을 뒷산·초원·고목) 13, 동굴 13, 고성 13, 얼음 13, 사막 13, 용암 13
  - 지형 기믹: movers(움직이는 발판), fallers(떨어지는 발판), mushrooms(점프 버섯), breaks(부서지는 벽), 맵 글자 '^'(가시)

### 도트 데이터 읽는 법

도트는 문자열로 그려져 있고, 글자 하나가 픽셀 하나, 글자 종류가 색 슬롯이에요.
`k` 외곽선, `h` 머리, `s` 피부, `t` 상의, `p` 하의, `f` 신발, `a` 갑옷 등.
커스텀이나 장비가 바뀌면 같은 도트에 슬롯 색만 바꿔 다시 그려요.

## 폰트

게임 안 한글은 픽셀 폰트 **갈무리(Galmuri)** 를 씁니다 (SIL OFL 1.1, https://github.com/quiple/galmuri).
Galmuri9 는 10px, Galmuri11 은 12px 크기에서 픽셀이 정확히 맞으니 글자 크기는 이 둘만 쓰세요 (`src/fonts.js`).

## 배포

`main` 브랜치에 푸시하면 Vercel이 자동으로 빌드·배포해요.
Vercel 설정은 기본값 그대로 (Framework: Vite, Build: `npm run build`, Output: `dist`).
