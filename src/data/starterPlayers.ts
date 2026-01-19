import { PlayerCard } from '../game/types';

/**
 * 스타터 선수덱 (9장) - 야구 라인업과 동일
 * 각 선수는 고유 능력을 가짐
 */
export const starterPlayers: PlayerCard[] = [
  {
    id: 'p1',
    name: '김민수',
    tags: ['speed'],
    battingAverage: 0.280,
    power: 3,
    speed: 8,
    ability: 'speedster',  // 쾌속: 1루타 시 50% 확률로 2루타
    revealed: false,
  },
  {
    id: 'p2',
    name: '이준혁',
    tags: ['contact'],
    battingAverage: 0.290,
    power: 4,
    speed: 6,
    ability: 'contact_master',  // 안타 장인: 아웃 시 20% 확률로 내야안타
    revealed: false,
  },
  {
    id: 'p3',
    name: '박성우',
    tags: ['contact', 'power'],
    battingAverage: 0.300,
    power: 6,
    speed: 5,
    ability: 'cleanup',  // 클린업: 주자 있을 때 장타 확률 +15%
    revealed: false,
  },
  {
    id: 'p4',
    name: '최강타',
    tags: ['power'],
    battingAverage: 0.270,
    power: 9,
    speed: 3,
    ability: 'power_hitter',  // 장타자: 안타 시 장타 확률 +20%
    revealed: false,
  },
  {
    id: 'p5',
    name: '정대현',
    tags: ['power'],
    battingAverage: 0.260,
    power: 7,
    speed: 4,
    ability: 'clutch',  // 결정력: 2사 상황에서 안타 확률 +15%
    revealed: false,
  },
  {
    id: 'p6',
    name: '강지훈',
    tags: ['contact'],
    battingAverage: 0.265,
    power: 5,
    speed: 5,
    ability: 'hot_streak',  // 연속 안타: 직전 안타 시 이번 타석 +15%
    revealed: false,
  },
  {
    id: 'p7',
    name: '윤서진',
    tags: ['eye'],
    battingAverage: 0.250,
    power: 4,
    speed: 5,
    ability: 'patient',  // 인내심: 일반 모드에서도 안타 확률 +10%
    revealed: false,
  },
  {
    id: 'p8',
    name: '임태양',
    tags: ['speed'],
    battingAverage: 0.240,
    power: 3,
    speed: 6,
    ability: 'leadoff',  // 선두타자: 이닝 첫 타석 출루 시 추가 진루
    revealed: false,
  },
  {
    id: 'p9',
    name: '한승우',
    tags: ['contact', 'speed'],
    battingAverage: 0.275,
    power: 3,
    speed: 7,
    ability: 'run_producer',  // 타점 제조기: 타점 시 포인트 1.5배
    revealed: false,
  },
];
