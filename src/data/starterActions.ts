import { ActionCard } from '../game/types';

/**
 * 스타터 액션덱 (18장)
 * 안타 8장, 땅볼 아웃 4장, 플라이 아웃 4장, 삼진 2장
 */
export const starterActions: ActionCard[] = [
  // 안타 8장
  { id: 'a1', type: 'single', name: '안타', description: '1루까지 진루' },
  { id: 'a2', type: 'single', name: '안타', description: '1루까지 진루' },
  { id: 'a3', type: 'single', name: '안타', description: '1루까지 진루' },
  { id: 'a4', type: 'single', name: '안타', description: '1루까지 진루' },
  { id: 'a5', type: 'single', name: '안타', description: '1루까지 진루' },
  { id: 'a6', type: 'single', name: '안타', description: '1루까지 진루' },
  { id: 'a7', type: 'single', name: '안타', description: '1루까지 진루' },
  { id: 'a8', type: 'single', name: '안타', description: '1루까지 진루' },
  
  // 땅볼 아웃 4장
  { id: 'a9', type: 'groundout', name: '땅볼 아웃', description: '아웃 +1' },
  { id: 'a10', type: 'groundout', name: '땅볼 아웃', description: '아웃 +1' },
  { id: 'a11', type: 'groundout', name: '땅볼 아웃', description: '아웃 +1' },
  { id: 'a12', type: 'groundout', name: '땅볼 아웃', description: '아웃 +1' },
  
  // 플라이 아웃 4장
  { id: 'a13', type: 'flyout', name: '플라이 아웃', description: '아웃 +1' },
  { id: 'a14', type: 'flyout', name: '플라이 아웃', description: '아웃 +1' },
  { id: 'a15', type: 'flyout', name: '플라이 아웃', description: '아웃 +1' },
  { id: 'a16', type: 'flyout', name: '플라이 아웃', description: '아웃 +1' },
  
  // 삼진 2장
  { id: 'a17', type: 'strikeout', name: '삼진', description: '아웃 +1' },
  { id: 'a18', type: 'strikeout', name: '삼진', description: '아웃 +1' },
];
