interface ScoreBoardProps {
  inning: number;
  maxInnings: number;
  score: number;        // 야구 득점
  totalPoints: number;  // 총 포인트
  inningPoints: number; // 이번 이닝 포인트
  targetPoints: number; // 목표 포인트
  outs: number;
  discardsRemaining: number;
}

export function ScoreBoard({ 
  inning, 
  maxInnings,
  score, 
  totalPoints,
  inningPoints,
  targetPoints,
  outs, 
  discardsRemaining 
}: ScoreBoardProps) {
  const isTargetMet = inningPoints >= targetPoints;
  
  return (
    <div className="bg-gray-900 rounded-xl p-4 text-white shadow-lg">
      <div className="grid grid-cols-4 gap-2 sm:gap-4 text-center">
        {/* 이닝 */}
        <div>
          <div className="text-gray-400 text-xs sm:text-sm">이닝</div>
          <div className="text-xl sm:text-3xl font-bold text-yellow-400">
            {inning}<span className="text-sm text-gray-500">/{maxInnings}</span>
          </div>
        </div>
        
        {/* 득점 */}
        <div>
          <div className="text-gray-400 text-xs sm:text-sm">득점</div>
          <div className="text-xl sm:text-3xl font-bold text-blue-400">{score}</div>
        </div>
        
        {/* 포인트 */}
        <div>
          <div className="text-gray-400 text-xs sm:text-sm">포인트</div>
          <div className="text-xl sm:text-3xl font-bold text-green-400">{totalPoints}P</div>
          <div className={`text-xs ${isTargetMet ? 'text-green-400' : 'text-gray-500'}`}>
            이번 이닝: {inningPoints}/{targetPoints}
          </div>
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
          <span className="text-gray-500 text-sm"> 남음 (최대 5장)</span>
        </div>
        {isTargetMet && (
          <div className="text-green-400 text-sm font-semibold animate-pulse">
            목표 달성!
          </div>
        )}
      </div>
    </div>
  );
}
