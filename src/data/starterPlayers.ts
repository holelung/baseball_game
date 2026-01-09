import { PlayerCard } from '../game/types';

/**
 * 스타터 선수덱 (9장)
 * 기본적으로 평범한 능력치의 선수들
 */
export const starterPlayers: PlayerCard[] = [
  {
    id: 'p1',
    name: '1번 리드오프',
    tags: ['speed'],
    battingAverage: 0.280,
    power: 3,
    speed: 8,
  },
  {
    id: 'p2',
    name: '2번 컨택트',
    tags: ['contact'],
    battingAverage: 0.290,
    power: 4,
    speed: 6,
  },
  {
    id: 'p3',
    name: '3번 타자',
    tags: ['contact', 'power'],
    battingAverage: 0.300,
    power: 6,
    speed: 5,
  },
  {
    id: 'p4',
    name: '4번 클린업',
    tags: ['power'],
    battingAverage: 0.270,
    power: 9,
    speed: 3,
  },
  {
    id: 'p5',
    name: '5번 타자',
    tags: ['power'],
    battingAverage: 0.260,
    power: 7,
    speed: 4,
  },
  {
    id: 'p6',
    name: '6번 타자',
    tags: ['contact'],
    battingAverage: 0.265,
    power: 5,
    speed: 5,
  },
  {
    id: 'p7',
    name: '7번 타자',
    tags: [],
    battingAverage: 0.250,
    power: 4,
    speed: 5,
  },
  {
    id: 'p8',
    name: '8번 타자',
    tags: [],
    battingAverage: 0.240,
    power: 3,
    speed: 6,
  },
  {
    id: 'p9',
    name: '9번 타자',
    tags: ['speed'],
    battingAverage: 0.230,
    power: 2,
    speed: 7,
  },
];
