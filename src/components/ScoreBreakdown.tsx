import { ScoreBreakdown as ScoreBreakdownType, ModeResult } from '../game/types';

interface ScoreBreakdownProps {
  breakdown: ScoreBreakdownType;
  modeResult: ModeResult;
  isOut: boolean;
  hasSynergy?: boolean;
}

export function ScoreBreakdown({ breakdown, modeResult, isOut, hasSynergy }: ScoreBreakdownProps) {
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

      {/* 점수 분해 */}
      <div className="bg-gray-900/50 rounded-lg p-3 space-y-2">
        {/* 카드 칩 */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">카드 합계</span>
          <span className="text-blue-400 font-bold">+{breakdown.cardChips}</span>
        </div>

        {/* 모드 보너스 */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">{modeResult.name} 보너스</span>
          <span className="text-purple-400 font-bold">+{breakdown.modeBonus}</span>
        </div>

        {/* 시너지 보너스 */}
        {hasSynergy && breakdown.synergyBonus > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-yellow-400">★ 시너지 보너스</span>
            <span className="text-yellow-400 font-bold">+{breakdown.synergyBonus}</span>
          </div>
        )}

        {/* 득점 보너스 */}
        {breakdown.runBonus > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-green-400">득점 보너스</span>
            <span className="text-green-400 font-bold">+{breakdown.runBonus}</span>
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
        {breakdown.cardChips} + {breakdown.modeBonus}
        {hasSynergy && breakdown.synergyBonus > 0 && ` + ${breakdown.synergyBonus}`}
        {breakdown.runBonus > 0 && ` + ${breakdown.runBonus}`}
        {' '}= {breakdown.finalScore}P
      </div>
    </div>
  );
}
