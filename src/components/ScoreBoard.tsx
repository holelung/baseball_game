interface ScoreBoardProps {
  inning: number;
  score: number;
  outs: number;
  targetScore: number;
  dropsRemaining: number;
}

export function ScoreBoard({ inning, score, outs, targetScore, dropsRemaining }: ScoreBoardProps) {
  return (
    <div className="bg-gray-900 rounded-xl p-4 text-white shadow-lg">
      <div className="grid grid-cols-3 gap-4 text-center">
        {/* 이닝 */}
        <div>
          <div className="text-gray-400 text-sm">이닝</div>
          <div className="text-3xl font-bold text-yellow-400">{inning}</div>
        </div>
        
        {/* 점수 */}
        <div>
          <div className="text-gray-400 text-sm">점수</div>
          <div className="text-3xl font-bold text-green-400">{score}</div>
          <div className="text-xs text-gray-500">목표: {targetScore}</div>
        </div>
        
        {/* 아웃카운트 */}
        <div>
          <div className="text-gray-400 text-sm">아웃</div>
          <div className="flex justify-center gap-1 mt-1">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className={`w-6 h-6 rounded-full border-2 ${
                  i < outs 
                    ? 'bg-red-500 border-red-400' 
                    : 'bg-transparent border-gray-600'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
      
      {/* 드롭 횟수 */}
      <div className="mt-3 pt-3 border-t border-gray-700 text-center">
        <span className="text-gray-400 text-sm">카드 드롭: </span>
        <span className="text-blue-400 font-bold">{dropsRemaining}회</span>
        <span className="text-gray-500 text-sm"> 남음</span>
      </div>
    </div>
  );
}
