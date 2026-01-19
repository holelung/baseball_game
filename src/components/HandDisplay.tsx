import { HandResult, ActionHandRank, PlayerCard } from '../game/types';

interface HandDisplayProps {
  handResult: HandResult | null;
  batter?: PlayerCard | null;  // 확률 계산용
}

// 28종 족보별 스타일
const HAND_STYLES: Record<ActionHandRank, { bg: string; text: string; icon: string }> = {
  // 기본 포커 족보 (Lv.1-9)
  'high_card':       { bg: 'from-gray-500 to-gray-600', text: 'text-gray-200', icon: '😢' },
  'one_pair':        { bg: 'from-green-500 to-green-600', text: 'text-white', icon: '🟢' },
  'two_pair':        { bg: 'from-green-600 to-teal-600', text: 'text-white', icon: '🟢🟢' },
  'three_of_kind':   { bg: 'from-blue-500 to-blue-600', text: 'text-white', icon: '🔵' },
  'straight':        { bg: 'from-blue-600 to-indigo-600', text: 'text-white', icon: '📊' },
  'flush':           { bg: 'from-purple-500 to-purple-600', text: 'text-white', icon: '🟣' },
  'full_house':      { bg: 'from-purple-600 to-pink-600', text: 'text-white', icon: '🏠' },
  'four_of_kind':    { bg: 'from-yellow-500 to-orange-500', text: 'text-white', icon: '💥' },
  'straight_flush':  { bg: 'from-yellow-400 to-red-500', text: 'text-white', icon: '🌟' },

  // 속성별 원페어 (Lv.10-13)
  'power_pair':      { bg: 'from-red-500 to-red-600', text: 'text-white', icon: '💥' },
  'contact_pair':    { bg: 'from-blue-500 to-blue-600', text: 'text-white', icon: '🎯' },
  'speed_pair':      { bg: 'from-green-500 to-green-600', text: 'text-white', icon: '⚡' },
  'eye_pair':        { bg: 'from-yellow-500 to-amber-600', text: 'text-white', icon: '👀' },

  // 속성별 트리플 (Lv.14-17)
  'power_triple':    { bg: 'from-red-600 to-red-700', text: 'text-white', icon: '💥💥💥' },
  'contact_triple':  { bg: 'from-blue-600 to-blue-700', text: 'text-white', icon: '🎯🎯🎯' },
  'speed_triple':    { bg: 'from-green-600 to-green-700', text: 'text-white', icon: '⚡⚡⚡' },
  'eye_triple':      { bg: 'from-yellow-600 to-amber-700', text: 'text-white', icon: '👀👀👀' },

  // 이중 속성 투페어 (Lv.18-23)
  'power_contact':   { bg: 'from-red-500 to-blue-500', text: 'text-white', icon: '💥🎯' },
  'power_speed':     { bg: 'from-red-500 to-green-500', text: 'text-white', icon: '💥⚡' },
  'power_eye':       { bg: 'from-red-500 to-yellow-500', text: 'text-white', icon: '💥👀' },
  'contact_speed':   { bg: 'from-blue-500 to-green-500', text: 'text-white', icon: '🎯⚡' },
  'contact_eye':     { bg: 'from-blue-500 to-yellow-500', text: 'text-white', icon: '🎯👀' },
  'speed_eye':       { bg: 'from-green-500 to-yellow-500', text: 'text-white', icon: '⚡👀' },

  // 상위 야구 전용 족보 (Lv.24-28)
  'batting_eye':     { bg: 'from-yellow-600 to-orange-600', text: 'text-white', icon: '👀👀👀👀' },
  'power_surge':     { bg: 'from-red-600 to-orange-500', text: 'text-white', icon: '💥⚡💥' },
  'speed_star':      { bg: 'from-green-600 to-cyan-500', text: 'text-white', icon: '⚡⭐⚡' },
  'contact_master':  { bg: 'from-blue-600 to-purple-500', text: 'text-white', icon: '🎯👑🎯' },
  'perfect_swing':   { bg: 'from-yellow-400 via-red-500 to-purple-600', text: 'text-white', icon: '⚾🌟⚾' },
};

// 28종 족보별 야구 결과 설명
const HAND_TO_RESULT: Record<ActionHandRank, string> = {
  // 기본 포커 족보
  'high_card':       '아웃',
  'one_pair':        '1루타',
  'two_pair':        '1루타',
  'three_of_kind':   '2루타',
  'straight':        '2루타',
  'flush':           '3루타',
  'full_house':      '3루타',
  'four_of_kind':    '홈런',
  'straight_flush':  '홈런',

  // 속성별 원페어
  'power_pair':      '1루타',
  'contact_pair':    '1루타',
  'speed_pair':      '1루타',
  'eye_pair':        '1루타',

  // 속성별 트리플
  'power_triple':    '2루타',
  'contact_triple':  '1루타 확정!',
  'speed_triple':    '2루타 +진루',
  'eye_triple':      '1루타',

  // 이중 속성 투페어
  'power_contact':   '1루타',
  'power_speed':     '2루타',
  'power_eye':       '1루타',
  'contact_speed':   '1루타',
  'contact_eye':     '1루타',
  'speed_eye':       '2루타',

  // 상위 야구 전용 족보
  'batting_eye':     '1루타',
  'power_surge':     '홈런',
  'speed_star':      '3루타',
  'contact_master':  '1루타 확정',
  'perfect_swing':   '홈런+업그레이드',
};

export function HandDisplay({ handResult, batter }: HandDisplayProps) {
  if (!handResult) {
    return (
      <div className="bg-gray-700/50 rounded-lg p-4 text-center">
        <div className="text-gray-400">8장의 카드로 족보가 판정됩니다</div>
        <div className="text-xs text-gray-500 mt-1">
          버리고 싶은 카드를 선택 후 "버리기" 버튼을 누르세요 (최대 5장)
        </div>
      </div>
    );
  }

  const style = HAND_STYLES[handResult.rank];
  const baseballResult = HAND_TO_RESULT[handResult.rank];
  
  // 확률 계산
  const batterAvg = batter?.battingAverage ?? 0;
  const hitProbability = Math.min((batterAvg + handResult.hitBonus) * 100, 100);
  const isGuaranteed = hitProbability >= 100;
  
  return (
    <div className={`bg-gradient-to-r ${style.bg} rounded-lg p-4 shadow-lg`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{style.icon}</span>
          <div>
            <div className={`font-bold text-lg ${style.text}`}>
              {handResult.name}
            </div>
            <div className="text-white/80 text-sm">
              {baseballResult} (x{handResult.multiplier} 배율)
            </div>
          </div>
        </div>
        {batter && (
          <div className="text-right">
            <div className={`text-lg font-bold ${isGuaranteed ? 'text-yellow-300' : 'text-white'}`}>
              {isGuaranteed ? '확정!' : `${Math.round(hitProbability)}%`}
            </div>
            <div className="text-xs text-white/60">
              타율 {(batterAvg * 100).toFixed(0)}% + 족보 {(handResult.hitBonus * 100).toFixed(0)}%
            </div>
          </div>
        )}
      </div>
      
    </div>
  );
}

// 족보 가이드
interface AvailableHandsProps {
  selectedCount: number;
}

export function AvailableHandsGuide({ selectedCount }: AvailableHandsProps) {
  return (
    <div className="bg-gray-800/50 rounded-lg p-3 text-xs">
      <div className="text-gray-400 mb-2 font-semibold">족보 가이드 (28종)</div>

      <div className="space-y-2">
        {/* 기본 포커 족보 */}
        <div>
          <div className="text-gray-500 text-[10px] mb-1">기본 포커 족보</div>
          <div className="grid grid-cols-3 gap-1 text-gray-300">
            <div className="text-red-400">하이카드 0%</div>
            <div>원페어 +5%</div>
            <div>투페어 +10%</div>
            <div>트리플 +15%</div>
            <div>스트레이트 +20%</div>
            <div>플러시 +25%</div>
            <div>풀하우스 +30%</div>
            <div className="text-yellow-400">포카드 +40%</div>
            <div className="text-yellow-400">스플러시 +50%</div>
          </div>
        </div>

        {/* 속성별 족보 */}
        <div>
          <div className="text-gray-500 text-[10px] mb-1">속성별 족보 (💥파워 🎯컨택 ⚡스피드 👀선구안)</div>
          <div className="grid grid-cols-2 gap-1 text-gray-300">
            <div>속성 페어 +5~8%</div>
            <div>속성 트리플 +18%</div>
            <div className="text-blue-400">🎯컨택 트리플 = 안타 확정!</div>
            <div className="text-green-400">⚡스피드 트리플 = 진루+1</div>
          </div>
        </div>

        {/* 이중 속성 */}
        <div>
          <div className="text-gray-500 text-[10px] mb-1">이중 속성 투페어</div>
          <div className="grid grid-cols-2 gap-1 text-gray-300">
            <div>💥🎯 파워컨택 +15%</div>
            <div>🎯⚡ 컨택스피드 +15%</div>
            <div>🎯👀 컨택아이 +18%</div>
            <div>⚡👀 스피드아이 = 2루 스타트</div>
          </div>
        </div>

        {/* 상위 야구 전용 */}
        <div>
          <div className="text-gray-500 text-[10px] mb-1">상위 야구 전용 족보</div>
          <div className="grid grid-cols-2 gap-1">
            <div className="text-yellow-400">👀 배팅아이 (선구안4+) +35%</div>
            <div className="text-red-400">💥 파워서지 (파워3+ 합30+) = 홈런</div>
            <div className="text-green-400">⚡ 스피드스타 (스피드 스트레이트) +40%</div>
            <div className="text-blue-400">🎯 컨택마스터 (컨택 풀하우스) = 확정</div>
            <div className="text-purple-400 col-span-2">⚾ 퍼펙트스윙 (4속성+페어) = 결과 업그레이드!</div>
          </div>
        </div>
      </div>

      {selectedCount > 0 && (
        <div className="mt-2 text-orange-400">
          선택된 카드: {selectedCount}장
        </div>
      )}
    </div>
  );
}
