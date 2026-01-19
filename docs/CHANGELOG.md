# Changelog

모든 주요 변경 사항을 이 파일에 기록합니다.

형식: [Keep a Changelog](https://keepachangelog.com/ko/1.0.0/)

---

## [0.2.0] - 2026-01-19

### 개요
트럼프 카드 시스템(♠♥♦♣)을 야구 속성 시스템(💥파워/🎯컨택/⚡스피드/👁️선구안)으로 전면 교체하고, 28종 족보 판정 로직을 구현했습니다.

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
