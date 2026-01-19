import { ScoreBreakdown as ScoreBreakdownType, HandResult, ActionCard } from '../game/types';
import { getStatEmoji } from '../game/deck';

interface ScoreBreakdownProps {
  breakdown: ScoreBreakdownType;
  handResult: HandResult;
  isOut: boolean;
}

export function ScoreBreakdown({ breakdown, handResult, isOut }: ScoreBreakdownProps) {
  if (isOut) {
    return (
      <div className="bg-gray-800/80 rounded-xl p-4 border border-red-500/30">
        <div className="text-center text-red-400 text-lg font-bold">
          아웃 - 포인트 없음
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/80 rounded-xl p-4 border border-yellow-500/30 space-y-3">
      {/* 헤더 */}
      <div className="text-center text-yellow-400 font-bold text-sm">
        점수 계산
      </div>

      {/* 카드 칩 표시 */}
      <div className="flex flex-wrap justify-center gap-1">
        {handResult.cards.map((card: ActionCard, idx: number) => (
          <div
            key={idx}
            className="bg-gray-700 rounded px-2 py-1 text-xs flex items-center gap-1"
          >
            <span>{getStatEmoji(card.stat)}</span>
            <span className="text-yellow-300 font-bold">
              +{card.rank === 1 ? 14 : card.rank}
            </span>
          </div>
        ))}
      </div>

      {/* 메인 계산 */}
      <div className="bg-gray-900/50 rounded-lg p-3 space-y-2">
        {/* 칩 계산 */}
        <div className="flex items-center justify-center gap-2 text-sm">
          <div className="flex items-center gap-1">
            <span className="text-gray-400">기본</span>
            <span className="text-blue-400 font-bold">{breakdown.baseChips}</span>
          </div>
          <span className="text-gray-500">+</span>
          <div className="flex items-center gap-1">
            <span className="text-gray-400">카드</span>
            <span className="text-blue-400 font-bold">{breakdown.cardChips}</span>
          </div>
          <span className="text-gray-500">=</span>
          <div className="bg-blue-600/30 rounded px-2 py-0.5">
            <span className="text-blue-300 font-bold">{breakdown.totalChips} 칩</span>
          </div>
        </div>

        {/* 배율 계산 */}
        <div className="flex items-center justify-center gap-3">
          <div className="bg-blue-600/30 rounded px-3 py-1">
            <span className="text-blue-300 font-bold text-lg">{breakdown.totalChips}</span>
          </div>
          <span className="text-yellow-400 text-2xl font-bold">×</span>
          <div className="bg-red-600/30 rounded px-3 py-1">
            <span className="text-red-300 font-bold text-lg">{breakdown.multiplier}</span>
          </div>
          <span className="text-gray-400 text-xl">=</span>
          <div className="bg-purple-600/30 rounded px-3 py-1">
            <span className="text-purple-300 font-bold text-lg">{breakdown.baseScore}</span>
          </div>
        </div>

        {/* 추가 보너스 */}
        {(breakdown.runBonus > 0 || breakdown.overflowBonus > 0) && (
          <div className="flex flex-wrap items-center justify-center gap-2 text-sm border-t border-gray-700 pt-2">
            <span className="text-purple-300">{breakdown.baseScore}</span>

            {breakdown.runBonus > 0 && (
              <>
                <span className="text-gray-500">+</span>
                <div className="flex items-center gap-1">
                  <span className="text-green-400 font-bold">+{breakdown.runBonus}</span>
                  <span className="text-gray-500 text-xs">(득점)</span>
                </div>
              </>
            )}

            {breakdown.overflowBonus > 0 && (
              <>
                <span className="text-gray-500">+</span>
                <div className="flex items-center gap-1">
                  <span className="text-cyan-400 font-bold">+{breakdown.overflowBonus}</span>
                  <span className="text-gray-500 text-xs">(확률초과)</span>
                </div>
              </>
            )}
          </div>
        )}

        {/* 특수 배율 */}
        {breakdown.specialMultiplier > 1 && (
          <div className="flex items-center justify-center gap-2 text-sm border-t border-gray-700 pt-2">
            <span className="text-orange-400">특수효과 ×{breakdown.specialMultiplier}</span>
          </div>
        )}
      </div>

      {/* 최종 점수 */}
      <div className="flex items-center justify-center gap-2">
        <span className="text-gray-400">최종:</span>
        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg px-4 py-2">
          <span className="text-white font-bold text-xl">+{breakdown.finalScore}P</span>
        </div>
      </div>

      {/* 계산식 요약 */}
      <div className="text-center text-gray-500 text-xs">
        ({breakdown.baseChips} + {breakdown.cardChips}) × {breakdown.multiplier}
        {breakdown.runBonus > 0 && ` + ${breakdown.runBonus}`}
        {breakdown.overflowBonus > 0 && ` + ${breakdown.overflowBonus}`}
        {breakdown.specialMultiplier > 1 && ` × ${breakdown.specialMultiplier}`}
        {' '}= {breakdown.finalScore}P
      </div>
    </div>
  );
}

// 컴팩트 버전 (인라인용)
interface ScoreBreakdownCompactProps {
  breakdown: ScoreBreakdownType;
  isOut: boolean;
}

export function ScoreBreakdownCompact({ breakdown, isOut }: ScoreBreakdownCompactProps) {
  if (isOut) {
    return <span className="text-red-400">0P</span>;
  }

  return (
    <span className="text-yellow-400">
      ({breakdown.totalChips} × {breakdown.multiplier}
      {breakdown.runBonus > 0 && ` +${breakdown.runBonus}`}
      {breakdown.specialMultiplier > 1 && ` ×${breakdown.specialMultiplier}`}
      ) = <span className="font-bold">{breakdown.finalScore}P</span>
    </span>
  );
}
