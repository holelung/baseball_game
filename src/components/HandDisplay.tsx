import { ModeResult, ActionMode, PlayerCard } from '../game/types';

interface ModeDisplayProps {
  modeResult: ModeResult | null;
  batter?: PlayerCard | null;
}

// 6종 모드별 스타일
const MODE_STYLES: Record<ActionMode, { bg: string; text: string; icon: string }> = {
  'power_swing':  { bg: 'from-red-500 to-red-700', text: 'text-white', icon: '💪' },
  'contact_hit':  { bg: 'from-blue-500 to-blue-700', text: 'text-white', icon: '🎯' },
  'speed_play':   { bg: 'from-green-500 to-green-700', text: 'text-white', icon: '👟' },
  'eye_mode':     { bg: 'from-yellow-500 to-amber-600', text: 'text-white', icon: '👀' },
  'balanced':     { bg: 'from-purple-500 to-purple-700', text: 'text-white', icon: '⚖️' },
  'normal':       { bg: 'from-gray-500 to-gray-600', text: 'text-gray-200', icon: '⚾' },
};

export function HandDisplay({ modeResult, batter }: ModeDisplayProps) {
  if (!modeResult) {
    return (
      <div className="bg-gray-700/50 rounded-lg p-4 text-center">
        <div className="text-gray-400">카드를 선택하여 모드를 활성화하세요</div>
        <div className="text-xs text-gray-500 mt-1">
          같은 속성 3장 이상 → 모드 활성화!
        </div>
      </div>
    );
  }

  const style = MODE_STYLES[modeResult.mode];

  // 확률 계산
  const batterAvg = batter?.battingAverage ?? 0;
  const hitProbability = Math.min((batterAvg + modeResult.hitBonus) * 100, 100);

  // 시너지 체크 (간단 버전)
  const hasSynergy = batter?.tags.some(tag => {
    if (modeResult.mode === 'power_swing' && tag === 'power') return true;
    if (modeResult.mode === 'contact_hit' && tag === 'contact') return true;
    if (modeResult.mode === 'speed_play' && tag === 'speed') return true;
    if (modeResult.mode === 'eye_mode' && tag === 'eye') return true;
    return false;
  });

  return (
    <div className={`bg-gradient-to-r ${style.bg} rounded-lg p-4 shadow-lg`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{style.icon}</span>
          <div>
            <div className={`font-bold text-lg ${style.text}`}>
              {modeResult.name}
              {hasSynergy && <span className="ml-2 text-yellow-300">★ 시너지!</span>}
            </div>
            <div className="text-white/80 text-sm">
              {modeResult.description}
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-lg font-bold text-white">
            {Math.round(hitProbability)}%
          </div>
          <div className="text-xs text-white/60">
            안타 확률
          </div>
        </div>
      </div>

      {/* 속성 집계 표시 */}
      <div className="mt-3 flex gap-2 justify-center">
        <StatBadge icon="💪" count={modeResult.statCount.power} active={modeResult.statCount.power >= 3} />
        <StatBadge icon="🎯" count={modeResult.statCount.contact} active={modeResult.statCount.contact >= 3} />
        <StatBadge icon="👟" count={modeResult.statCount.speed} active={modeResult.statCount.speed >= 3} />
        <StatBadge icon="👀" count={modeResult.statCount.eye} active={modeResult.statCount.eye >= 3} />
      </div>
    </div>
  );
}

// 속성 뱃지 컴포넌트
function StatBadge({ icon, count, active }: { icon: string; count: number; active: boolean }) {
  return (
    <div className={`
      px-2 py-1 rounded text-sm
      ${active
        ? 'bg-yellow-400/30 border border-yellow-400 text-yellow-300'
        : 'bg-gray-700/50 text-gray-400'
      }
    `}>
      {icon} {count}
    </div>
  );
}

// 모드 가이드 (간략화)
interface ModeGuideProps {
  selectedCount: number;
}

export function AvailableHandsGuide({ selectedCount }: ModeGuideProps) {
  return (
    <div className="bg-gray-800/50 rounded-lg p-3 text-xs">
      <div className="text-gray-400 mb-2 font-semibold">모드 가이드 (6종)</div>

      <div className="grid grid-cols-2 gap-2 text-gray-300">
        <div className="flex items-center gap-2">
          <span className="text-red-400">💪×3</span>
          <span>파워 스윙 - 장타 기회!</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-blue-400">🎯×3</span>
          <span>정확한 타격 - 안타 확률↑</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-green-400">👟×3</span>
          <span>스피드 플레이 - 추가 진루</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-yellow-400">👀×3</span>
          <span>선구안 모드 - 출루 확률↑</span>
        </div>
        <div className="flex items-center gap-2 col-span-2">
          <span className="text-purple-400">⚖️</span>
          <span>밸런스 - 2속성 각 2장 이상</span>
        </div>
      </div>

      <div className="mt-2 pt-2 border-t border-gray-700 text-gray-400">
        <div>💡 선수 태그와 모드가 일치하면 <span className="text-yellow-400">시너지 보너스!</span></div>
      </div>

      {selectedCount > 0 && (
        <div className="mt-2 text-orange-400">
          선택된 카드: {selectedCount}장
        </div>
      )}
    </div>
  );
}

// 기존 호환성을 위한 export (HandDisplay를 다른 이름으로도 사용 가능)
export { HandDisplay as ModeDisplay };
