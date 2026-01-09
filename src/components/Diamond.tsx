import { BaseState } from '../game/types';
import { PlayerCardComponent } from './Card';

interface DiamondProps {
  bases: BaseState;
}

export function Diamond({ bases }: DiamondProps) {
  return (
    <div className="relative w-64 h-64">
      {/* 다이아몬드 배경 */}
      <svg
        viewBox="0 0 100 100"
        className="absolute inset-0 w-full h-full"
      >
        {/* 내야 필드 */}
        <polygon
          points="50,10 90,50 50,90 10,50"
          fill="#4a7c59"
          stroke="#2d5a3d"
          strokeWidth="2"
        />
        {/* 베이스 라인 */}
        <line x1="50" y1="10" x2="90" y2="50" stroke="white" strokeWidth="1" />
        <line x1="90" y1="50" x2="50" y2="90" stroke="white" strokeWidth="1" />
        <line x1="50" y1="90" x2="10" y2="50" stroke="white" strokeWidth="1" />
        <line x1="10" y1="50" x2="50" y2="10" stroke="white" strokeWidth="1" />
        
        {/* 홈 플레이트 */}
        <polygon points="50,85 45,90 50,95 55,90" fill="white" />
        
        {/* 베이스 */}
        <rect x="86" y="46" width="8" height="8" fill="white" /> {/* 1루 */}
        <rect x="46" y="6" width="8" height="8" fill="white" /> {/* 2루 */}
        <rect x="6" y="46" width="8" height="8" fill="white" /> {/* 3루 */}
      </svg>

      {/* 1루 주자 */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4">
        {bases.first ? (
          <PlayerCardComponent player={bases.first} small />
        ) : (
          <div className="w-16 h-20 rounded-lg border-2 border-dashed border-white/30" />
        )}
      </div>

      {/* 2루 주자 */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4">
        {bases.second ? (
          <PlayerCardComponent player={bases.second} small />
        ) : (
          <div className="w-16 h-20 rounded-lg border-2 border-dashed border-white/30" />
        )}
      </div>

      {/* 3루 주자 */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4">
        {bases.third ? (
          <PlayerCardComponent player={bases.third} small />
        ) : (
          <div className="w-16 h-20 rounded-lg border-2 border-dashed border-white/30" />
        )}
      </div>
    </div>
  );
}
