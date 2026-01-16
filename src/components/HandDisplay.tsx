import { HandResult, HandRank } from '../game/types';
import { PokerCardComponent } from './PokerCard';

interface HandDisplayProps {
  handResult: HandResult | null;
  showCards?: boolean;
}

// 족보별 스타일
const HAND_STYLES: Record<HandRank, { bg: string; text: string; icon: string }> = {
  'high_card':       { bg: 'from-gray-500 to-gray-600', text: 'text-gray-200', icon: '😢' },
  'one_pair':        { bg: 'from-green-500 to-green-600', text: 'text-white', icon: '🟢' },
  'two_pair':        { bg: 'from-green-600 to-teal-600', text: 'text-white', icon: '🟢🟢' },
  'three_of_kind':   { bg: 'from-blue-500 to-blue-600', text: 'text-white', icon: '🔵' },
  'straight':        { bg: 'from-blue-600 to-indigo-600', text: 'text-white', icon: '📊' },
  'flush':           { bg: 'from-purple-500 to-purple-600', text: 'text-white', icon: '🟣' },
  'full_house':      { bg: 'from-purple-600 to-pink-600', text: 'text-white', icon: '🏠' },
  'four_of_kind':    { bg: 'from-yellow-500 to-orange-500', text: 'text-white', icon: '💥' },
  'straight_flush':  { bg: 'from-yellow-400 to-red-500', text: 'text-white', icon: '🌟' },
};

// 족보별 야구 결과 설명
const HAND_TO_RESULT: Record<HandRank, string> = {
  'high_card':       '아웃',
  'one_pair':        '1루타',
  'two_pair':        '1루타 +',
  'three_of_kind':   '2루타',
  'straight':        '2루타 +',
  'flush':           '3루타',
  'full_house':      '3루타 +',
  'four_of_kind':    '홈런',
  'straight_flush':  '홈런 ++',
};

export function HandDisplay({ handResult, showCards }: HandDisplayProps) {
  if (!handResult) {
    return (
      <div className="bg-gray-700/50 rounded-lg p-4 text-center">
        <div className="text-gray-400">카드를 선택하세요</div>
        <div className="text-xs text-gray-500 mt-1">
          5장 모두 사용하거나, 원하는 카드만 선택할 수 있습니다
        </div>
      </div>
    );
  }

  const style = HAND_STYLES[handResult.rank];
  const baseballResult = HAND_TO_RESULT[handResult.rank];
  
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
      </div>
      
      {showCards && handResult.cards.length > 0 && (
        <div className="mt-3 pt-3 border-t border-white/20">
          <div className="text-xs text-white/60 mb-2">사용된 카드:</div>
          <div className="flex gap-1 flex-wrap">
            {handResult.cards.map(card => (
              <PokerCardComponent 
                key={card.id} 
                card={{ ...card, selected: true }} 
                disabled 
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// 가능한 족보 미리보기 목록
interface AvailableHandsProps {
  selectedCount: number;
}

export function AvailableHandsGuide({ selectedCount }: AvailableHandsProps) {
  return (
    <div className="bg-gray-800/50 rounded-lg p-3 text-xs">
      <div className="text-gray-400 mb-2 font-semibold">족보 가이드</div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-gray-300">
        <div>원 페어 = 1루타</div>
        <div>투 페어 = 1루타+</div>
        <div>트리플 = 2루타</div>
        <div>스트레이트 = 2루타+</div>
        <div>플러시 = 3루타</div>
        <div>풀하우스 = 3루타+</div>
        <div className="text-yellow-400">포카드 = 홈런</div>
        <div className="text-yellow-400">스플러시 = 홈런++</div>
        <div className="text-red-400">하이카드 = 아웃</div>
      </div>
      {selectedCount > 0 && (
        <div className="mt-2 text-blue-400">
          선택된 카드: {selectedCount}장
        </div>
      )}
    </div>
  );
}
