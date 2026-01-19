# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

로그라이크 덱빌딩 야구 게임 프로토타입. Balatro 스타일의 포커 족보 시스템과 야구 메커니즘을 결합한 게임.

## 개발 명령어

```bash
npm run dev      # 개발 서버 (Vite)
npm run build    # 프로덕션 빌드 (tsc && vite build)
npm run lint     # ESLint
npm run preview  # 빌드 결과 미리보기
```

## 아키텍처

### 이중 덱 시스템
- **선수덱**: 10장의 선수 카드. 첫 타석 3장 드로우, 이후 1장씩 드로우. 아웃/득점 시 덱 하단으로 순환 (순서 예측 가능)
- **액션덱**: 52장 트럼프 카드. 8장 핸드, 이닝마다 재셔플. 포커 족보로 안타/아웃 결정

### 핵심 게임 로직 (`src/game/`)
순수 함수로 구현된 게임 로직. Unity 포팅 대비 UI 의존성 없음.

- `types.ts`: 모든 타입 정의 (PlayerCard, PokerCard, GameState, HandRank 등)
- `poker.ts`: 족보 판정 (`evaluateHand`). 선택한 카드로 최고 족보 반환
- `scoring.ts`: 확률 기반 플레이 실행 (`executePlay`). 안타확률 = 선수타율 + 족보hitBonus
- `deck.ts`: 덱 조작 유틸 (셔플, 드로우, 카드 선택 토글)

### 상태 관리 (`src/store/gameStore.ts`)
Zustand 단일 스토어. 게임 상태와 액션을 모두 포함.

주요 액션:
- `initGame`: 게임 초기화
- `selectPlayer`: 선수 선택 → selectCards 페이즈로 전환
- `togglePokerCard` / `discardAndDraw`: 카드 선택/버리기 (이닝당 3회, 최대 5장)
- `executeSelectedPlay`: 선택한 카드로 족보 판정 → 확률 판정 → 결과 적용
- `nextTurn` / `startNewInning`: 턴/이닝 진행

### 게임 페이즈
`selectPlayer` → `selectCards` → `showResult` → `inningEnd` / `gameEnd`

## 게임 규칙 참조
- `GAMERULE.md`: 전체 게임 규칙 (투수, 상점, 보너스 카드 등)
- `ACTION_HANDS.md`: 족보 시스템 상세 (28종 족보, 속성 시너지)
- `ROADMAP.md`: 개발 로드맵

## 코드 작성 시 유의사항
- `src/game/` 내 함수는 순수 함수로 유지 (side-effect 없음)
- 상태 변경은 반드시 gameStore 액션을 통해 수행
- 선수 카드의 `revealed` 속성으로 덱 순서 공개 여부 추적
