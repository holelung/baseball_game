import { Pitcher } from '../game/types';

interface ScoreBoardProps {
  currentPitcher: Pitcher | null;
  pitcherPoints: number;   // 현재 투수에게 획득한 포인트
  defeatedCount: number;   // 강판시킨 투수 수
  remainingCount: number;  // 남은 투수 수
  score: number;           // 야구 득점
  totalPoints: number;     // 총 포인트
  outs: number;
  discardsRemaining: number;
}

export function ScoreBoard({
  currentPitcher,
  pitcherPoints,
  defeatedCount,
  remainingCount,
  score,
  totalPoints,
  outs,
  discardsRemaining
}: ScoreBoardProps) {
  const targetPoints = currentPitcher?.targetPoints ?? 0;
  const progress = targetPoints > 0 ? Math.min((pitcherPoints / targetPoints) * 100, 100) : 0;
  const isNearDefeat = progress >= 80;

  return (
    <div className="bg-gray-900 rounded-xl p-4 text-white shadow-lg">
      {/* 투수 정보 */}
      {currentPitcher && (
        <div className="mb-4 pb-3 border-b border-gray-700">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">⚾</span>
              <div>
                <div className="font-bold text-lg">{currentPitcher.name}</div>
                <div className="text-gray-400 text-xs">{currentPitcher.description}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-gray-400 text-xs">강판까지</div>
              <div className={`font-bold ${isNearDefeat ? 'text-yellow-400' : 'text-white'}`}>
                {pitcherPoints} / {targetPoints}P
              </div>
            </div>
          </div>

          {/* 진행 바 */}
          <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isNearDefeat
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                  : 'bg-gradient-to-r from-blue-500 to-blue-400'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>

          {isNearDefeat && (
            <div className="text-yellow-400 text-xs mt-1 animate-pulse">
              강판 임박!
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-4 gap-2 sm:gap-4 text-center">
        {/* 투수 진행 */}
        <div>
          <div className="text-gray-400 text-xs sm:text-sm">투수</div>
          <div className="text-xl sm:text-3xl font-bold text-yellow-400">
            {defeatedCount + 1}<span className="text-sm text-gray-500">/{defeatedCount + remainingCount + 1}</span>
          </div>
        </div>

        {/* 득점 */}
        <div>
          <div className="text-gray-400 text-xs sm:text-sm">득점</div>
          <div className="text-xl sm:text-3xl font-bold text-blue-400">{score}</div>
        </div>

        {/* 총 포인트 */}
        <div>
          <div className="text-gray-400 text-xs sm:text-sm">총 포인트</div>
          <div className="text-xl sm:text-3xl font-bold text-green-400">{totalPoints}P</div>
        </div>

        {/* 아웃카운트 */}
        <div>
          <div className="text-gray-400 text-xs sm:text-sm">아웃</div>
          <div className="flex justify-center gap-1 mt-1">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className={`w-4 h-4 sm:w-6 sm:h-6 rounded-full border-2 ${
                  i < outs
                    ? 'bg-red-500 border-red-400'
                    : 'bg-transparent border-gray-600'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 버리기 횟수 */}
      <div className="mt-3 pt-3 border-t border-gray-700 flex justify-between items-center">
        <div>
          <span className="text-gray-400 text-sm">버리기: </span>
          <span className="text-blue-400 font-bold">{discardsRemaining}회</span>
          <span className="text-gray-500 text-sm"> 남음</span>
        </div>
        {defeatedCount > 0 && (
          <div className="text-green-400 text-sm">
            {defeatedCount}명 강판
          </div>
        )}
      </div>
    </div>
  );
}
