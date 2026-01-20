# Changelog

모든 주요 변경 사항을 이 파일에 기록합니다.

형식: [Keep a Changelog](https://keepachangelog.com/ko/1.0.0/)

---

## [0.4.0] - 2026-01-20

### Added (추가)

#### 투수 시스템
이닝 기반 목표에서 투수 기반 목표로 변경:

**투수 라인업:**
| 투수 | 목표 포인트 | 설명 |
|------|------------|------|
| 신인 투수 | 200P | 갓 올라온 신인 |
| 평범한 투수 | 400P | 무난한 실력 |
| 베테랑 투수 | 700P | 노련한 투구 |

**포인트 누적 시스템:**
- 포인트가 투수 간 누적됨
- 신인 투수: 0P → 200P (200P 필요)
- 평범한 투수: 200P → 400P (200P 필요)
- 베테랑 투수: 400P → 700P (300P 필요)

**UI 추가:**
- `PitcherLineup` 컴포넌트: 투수 라인업 시각화
- 현재 투수 진행 바 표시
- 강판 임박 시 경고 표시

#### 상점 시스템

**재화 시스템:**
- 포인트 획득 시 골드도 1:1 비율로 획득
- 투수 강판 시 보너스 골드 (목표의 50%)
- 골드는 투수 목표 포인트와 별개

**상점 오픈 시점:**
| 시점 | 상점 등급 | 특징 |
|------|----------|------|
| 3아웃 (이닝 종료) | 기본 | 선수 3명, 액션강화 1개 |
| 투수 강판 | 중급 | 선수 3명, 강화류 3개, 코치 1명 |
| 스테이지 클리어 | 고급 | 선수 4명, 강화류 4개, 코치 2명, 바우처 1개 |

**아이템 종류:**

1. **선수 카드** (등급별 드롭률)
   - 일반 50G / 희귀 100G / 영웅 200G / 전설 500G
   - 최대 로스터 12명, 초과 시 교체 가능

2. **선수 강화** (medium, high 등급)
   | 강화 | 가격 | 효과 |
   |------|------|------|
   | 타율 훈련 | 100G | 선택한 선수 타율 +2% |
   | 파워 훈련 | 80G | 선택한 선수 파워 +1 |
   | 스피드 훈련 | 80G | 선택한 선수 스피드 +1 |

3. **액션 강화**
   | 강화 | 가격 | 효과 |
   |------|------|------|
   | 속성 강화 (4종) | 60G | 해당 카드 사용 시 +5P |
   | 모드 마스터 (3종) | 100G | 해당 모드 +10P |

4. **코치** (medium, high 등급) - 최대 5명
   | 코치 | 가격 | 효과 |
   |------|------|------|
   | 타격 코치 | 200G | 모든 선수 타율 +2% |
   | 파워 코치 | 180G | 모든 선수 파워 +1 |
   | 슬러거 코치 | 220G | 장타 확률 +10% |
   | 주루/파워/컨택 트레이너 | 150G | 해당 모드 포인트 +15 |
   | 전략 코치 | 250G | 버리기 횟수 +1 |
   | 멘탈 코치 | 180G | 2사 상황 안타 확률 +10% |
   | 득점 코치 | 200G | 득점 시 추가 포인트 +10 |

5. **바우처** (high 등급만)
   | 바우처 | 가격 | 효과 |
   |--------|------|------|
   | 할인권 | 150G | 모든 상점 가격 10% 할인 |
   | 대량 구매 | 180G | 상점 아이템 +1개 |
   | 선수단 확장 | 200G | 최대 선수 수 +1 |
   | VIP | 220G | 희귀 아이템 확률 +10% |
   | 골드 러쉬 | 250G | 골드 획득량 +20% |

**Shop 컴포넌트:**
- 탭 구조 (전체/선수/강화/코치/바우처)
- 보유 코치/바우처 표시
- 선수 교체 및 강화 대상 선택 UI

### Changed (변경)

#### GameState 확장
```typescript
interface GameState {
  // 기존 필드...

  // 투수 시스템
  currentPitcher: Pitcher | null;
  pitcherPoints: number;        // 누적 포인트
  pitcherLineup: Pitcher[];
  defeatedPitchers: Pitcher[];

  // 재화
  gold: number;

  // 코치 & 바우처
  coaches: Coach[];
  maxCoaches: number;           // 기본 5
  vouchers: Voucher[];

  // 강화 보너스
  statBonuses: Record<StatType, number>;
  modeBonuses: Record<ActionMode, number>;

  // 상점
  shop: ShopState;
}
```

#### ScoreBoard 확장
- 골드 표시 추가 (5열 그리드)
- 투수 진행 바 및 강판 임박 표시

### 새 파일

| 파일 | 설명 |
|------|------|
| `src/data/pitchers.ts` | 투수 데이터 |
| `src/data/playerPool.ts` | 상점용 선수 풀 (40명) |
| `src/game/shop.ts` | 상점 아이템 생성 로직 |
| `src/components/Shop.tsx` | 상점 UI 컴포넌트 |
| `docs/SHOP_SYSTEM.md` | 상점 시스템 설계 문서 |

---

## [0.3.0] - 2026-01-19

### Added (추가)

#### 점수 계산 분해 시각화 (`ScoreBreakdown.tsx`)
플레이 결과 화면에서 점수가 어떻게 계산되었는지 상세하게 보여주는 기능 추가:

**표시 정보:**
- 각 카드별 칩 기여도 (예: `👟 +14`, `🎯 +9`)
- 기본 칩 + 카드 칩 = 총 칩
- 총 칩 × 배율 = 기본 점수
- 득점 보너스 (+20/득점)
- 확률 초과 보너스
- 특수 효과 배율 (파워아이 홈런 등)
- 최종 점수

**예시 표시:**
```
┌─────────────────────────────────────┐
│         점수 계산                    │
│  [👟+14] [🎯+9] [🎯+7] [💪+5]       │
│                                      │
│  기본 40 + 카드 35 = 75 칩           │
│     [75] × [4] = [300]               │
│                                      │
│  300 + 40(득점)                      │
│                                      │
│     최종: +340P                      │
│  (40 + 35) × 4 + 40 = 340P          │
└─────────────────────────────────────┘
```

**수정된 점수 계산 공식:**
```
최종 점수 = ((기본칩 + 카드칩합) × 배율 + 득점보너스 + 확률초과보너스) × 특수배율
```

---

## [0.2.3] - 2026-01-19

### Changed (변경)

#### 속성 아이콘 변경
더 직관적인 속성 표현을 위해 아이콘 변경:

| 속성 | 변경 전 | 변경 후 | 이유 |
|------|---------|---------|------|
| 파워 | 💥 (폭발) | 💪 (근육) | 힘을 더 직접적으로 상징 |
| 스피드 | ⚡ (번개) | 👟 (운동화) | 헤르메스의 날개달린 신발 연상 |

영향 파일: `deck.ts`, `HandDisplay.tsx`, `ACTION_HANDS.md`

---

## [0.2.2] - 2026-01-19

### Changed (변경)

#### 액션 카드 디자인 간결화 (`ActionCard.tsx`)
기존 트럼프 스타일에서 심플한 디자인으로 변경:

**변경 전:**
```
┌─────────┐
│ A       │
│ 💥      │
│    💥   │
│      💥 │
│       A │
└─────────┘
```

**변경 후:**
```
┌───────┐
│ A 💥  │  ← 상단: 랭크 + 이모지
│       │
│  💥   │  ← 중앙: 큰 이모지
│       │
│ 💥 A  │  ← 하단: 180° 회전
└───────┘
```

- 상단: `랭크 + 이모지` 한 줄 배치 (예: `9 💥`)
- 중앙: 큰 속성 이모지
- 하단: 동일 스타일 180° 회전
- 카드 크기 축소: `w-16 h-24` → `w-14 h-20`

---

## [0.2.1] - 2026-01-19

### Fixed (수정)

#### 선구안 아이콘 변경
- **변경 전**: 👁️ (단일 눈 - 징그러움)
- **변경 후**: 👀 (두 눈 - 친근함)
- 영향 파일: `deck.ts`, `HandDisplay.tsx`, `Card.tsx`, `ACTION_HANDS.md`

#### 카드 오버플로우 수정 (`ActionCard.tsx`)
하단 숫자가 카드 바깥으로 삐져나오는 문제 수정:

| 항목 | 변경 전 | 변경 후 |
|------|---------|---------|
| overflow | - | `overflow-hidden` |
| padding | `p-1.5 sm:p-2` | `p-1 sm:p-1.5` |
| 상하단 폰트 | `text-xs sm:text-sm` | `text-[10px] sm:text-xs` |
| 이모지 폰트 | `text-base sm:text-lg` | `text-sm sm:text-base` |
| 중앙 이모지 | `text-2xl sm:text-3xl` | `text-xl sm:text-2xl` + `flex-shrink-0` |
| line-height | `leading-none` | `leading-tight` |

---

## [0.2.0] - 2026-01-19

### 개요
트럼프 카드 시스템(♠♥♦♣)을 야구 속성 시스템(💥파워/🎯컨택/⚡스피드/👀선구안)으로 전면 교체하고, 28종 족보 판정 로직을 구현했습니다.

### Added (추가)

#### 새 파일
- **`src/game/actionPoker.ts`**: 28종 족보 판정 로직
  - `HAND_INFO`: 28종 족보의 레벨, 이름, 기본칩, 배율, 안타보너스, 특수효과 정의
  - `evaluateActionHand()`: 선택된 카드로 최고 족보 판정
  - 유틸리티 함수: `countRanks()`, `countStats()`, `checkStraight()`, `checkFlush()` 등

- **`src/components/ActionCard.tsx`**: 액션 카드 UI 컴포넌트
  - `ActionCardComponent`: 개별 카드 렌더링 (속성별 색상 그라데이션)
  - `ActionHand`: 카드 핸드 렌더링

#### 새 타입 (`src/game/types.ts`)
- **`StatType`**: `'power' | 'contact' | 'speed' | 'eye'`
- **`ActionRank`**: `1 | 2 | 3 | ... | 13`
- **`ActionCard`**: `{ id, stat, rank, selected }`
- **`ActionHandRank`**: 28종 족보 타입
  - 기본 포커 족보 (Lv.1-9): `high_card`, `one_pair`, `two_pair`, `three_of_kind`, `straight`, `flush`, `full_house`, `four_of_kind`, `straight_flush`
  - 속성별 원페어 (Lv.10-13): `power_pair`, `contact_pair`, `speed_pair`, `eye_pair`
  - 속성별 트리플 (Lv.14-17): `power_triple`, `contact_triple`, `speed_triple`, `eye_triple`
  - 이중 속성 투페어 (Lv.18-23): `power_contact`, `power_speed`, `power_eye`, `contact_speed`, `contact_eye`, `speed_eye`
  - 상위 야구 전용 (Lv.24-28): `batting_eye`, `power_surge`, `speed_star`, `contact_master`, `perfect_swing`

#### 새 함수 (`src/game/deck.ts`)
- `createActionDeck()`: 52장 액션 카드 덱 생성
- `drawActionCards()`: 덱에서 n장 드로우
- `toggleActionCardSelection()`: 카드 선택 토글
- `getSelectedActionCards()`: 선택된 카드 반환
- `getStatEmoji()`: 속성 → 이모지 (`power` → `💥`)
- `getStatColorClass()`: 속성 → 텍스트 색상 클래스
- `getStatBgClass()`: 속성 → 배경 그라데이션 클래스

#### 특수 효과 시스템 (`src/game/scoring.ts`)
| 족보 | 특수 효과 |
|------|-----------|
| 컨택 트리플 | 안타 확정 (아웃 무효) |
| 컨택 마스터 | 안타 확정 (아웃 무효) |
| 스피드 트리플 | 진루 +1 |
| 파워스피드 | 진루 +1 |
| 스피드아이 | 출루 시 2루 스타트 |
| 파워아이 | 홈런 시 포인트 1.5배 |
| 퍼펙트 스윙 | 결과 한 단계 업그레이드 |

### Changed (변경)

#### 타입 변경 (`src/game/types.ts`)
| 기존 | 변경 |
|------|------|
| `Suit` | `StatType` |
| `Rank` | `ActionRank` |
| `PokerCard` | `ActionCard` |
| `HandRank` (9종) | `ActionHandRank` (28종) |

#### GameState 필드명 변경
| 기존 | 변경 |
|------|------|
| `pokerDeck` | `actionDeck` |
| `pokerHand` | `actionHand` |
| `selectedPokerCards` | `selectedActionCards` |

#### HandResult 인터페이스 확장
```typescript
// 기존
interface HandResult {
  rank: HandRank;
  name: string;
  cards: PokerCard[];
  multiplier: number;
  hitBonus: number;
}

// 변경
interface HandResult {
  rank: ActionHandRank;
  name: string;
  cards: ActionCard[];
  multiplier: number;
  hitBonus: number;
  baseChips: number;        // 추가
  specialEffect?: string;   // 추가
}
```

#### 게임 스토어 액션 변경 (`src/store/gameStore.ts`)
| 기존 | 변경 |
|------|------|
| `togglePokerCard()` | `toggleActionCard()` |
| `createPokerDeck()` 사용 | `createActionDeck()` 사용 |
| `evaluateHand()` 사용 | `evaluateActionHand()` 사용 |

#### UI 컴포넌트 변경
- **`GameBoard.tsx`**: `PokerHand` → `ActionHand` 사용
- **`HandDisplay.tsx`**: 28종 족보 스타일 및 결과 설명 추가

#### 족보 → 야구 결과 매핑 (`src/game/scoring.ts`)
기존 9종에서 28종으로 확장. 각 족보별 baseScore 및 결과 타입 정의.

### Removed (삭제)

#### 삭제된 파일
| 파일 | 이유 |
|------|------|
| `src/game/poker.ts` | actionPoker.ts로 대체 |
| `src/components/PokerCard.tsx` | ActionCard.tsx로 대체 |
| `src/data/starterActions.ts` | 더 이상 사용 안함 |

#### 삭제된 타입
- `Suit`: `'spade' | 'heart' | 'diamond' | 'club'`
- `PokerCard`: 트럼프 카드 인터페이스
- `HandRank`: 9종 포커 족보 타입

#### 삭제된 함수 (`src/game/deck.ts`)
- `createPokerDeck()`, `drawPokerCards()`, `toggleCardSelection()`, `getSelectedCards()`, `getSuitEmoji()`, `isRedSuit()`

#### Card.tsx 정리
- `ActionCardComponent` 제거 (레거시 버전)

---

## [0.1.x] - 이전 버전

이전 커밋 히스토리 참조:
- `1bae17e` feat: 야구 전용 족보 확장 및 숫자 범위 조정
- `b92d969` docs: 게임 규칙 문서에 투수/상점 시스템 추가
- `28c4bac` feat: 스탯 기반 액션 카드 덱 시스템 추가
- `fcbaf99` fix: 이닝 종료 후 선수 패 유지
- `4d9da21` fix: 득점한 주자도 선수덱으로 돌아가도록 수정

---

## 파일 구조 (현재)

```
src/
├── components/
│   ├── ActionCard.tsx      # 액션 카드 UI (신규)
│   ├── Card.tsx            # 선수 카드 UI
│   ├── Diamond.tsx         # 다이아몬드 필드
│   ├── GameBoard.tsx       # 메인 게임 보드
│   ├── Hand.tsx            # 선수 핸드
│   ├── HandDisplay.tsx     # 족보 표시 (28종)
│   └── ScoreBoard.tsx      # 점수판
├── data/
│   └── starterPlayers.ts   # 초기 선수 데이터
├── game/
│   ├── actionPoker.ts      # 28종 족보 판정 (신규)
│   ├── deck.ts             # 덱 유틸리티
│   ├── scoring.ts          # 점수 계산 및 특수효과
│   └── types.ts            # 타입 정의
├── store/
│   └── gameStore.ts        # Zustand 상태 관리
└── App.tsx
```

---

## 커밋 히스토리 (이번 작업)

| 커밋 | 설명 |
|------|------|
| `183e38a` | feat: 액션 카드 속성 시스템 및 28종 족보 구현 |
| `7940023` | fix: 레거시 포커 카드 파일 제거 및 빌드 에러 수정 |
