import { PlayerCard } from '../game/types';

interface PlayerCardProps {
  player: PlayerCard;
  onClick?: () => void;
  disabled?: boolean;
  small?: boolean;
}

export function PlayerCardComponent({ player, onClick, disabled, small }: PlayerCardProps) {
  const tagColors: Record<string, string> = {
    speed: 'bg-green-500',
    power: 'bg-red-500',
    contact: 'bg-blue-500',
    eye: 'bg-purple-500',
  };

  const sizeClasses = small
    ? 'w-16 h-20 text-xs'
    : 'w-28 h-36';

  return (
    <div
      onClick={disabled ? undefined : onClick}
      className={`
        ${sizeClasses}
        bg-gradient-to-br from-amber-100 to-amber-200
        rounded-lg shadow-lg border-2 border-amber-400
        flex flex-col items-center justify-between p-2
        ${onClick && !disabled ? 'cursor-pointer hover:scale-105 hover:shadow-xl transition-all' : ''}
        ${disabled ? 'opacity-50' : ''}
      `}
    >
      <div className="text-2xl">⚾</div>
      <div className={`font-bold text-center text-gray-800 ${small ? 'text-[10px]' : 'text-sm'}`}>
        {player.name}
      </div>
      {!small && (
        <>
          <div className="flex gap-1 flex-wrap justify-center">
            {player.tags.map(tag => (
              <span
                key={tag}
                className={`${tagColors[tag]} text-white text-[10px] px-1 rounded`}
              >
                {tag === 'speed' ? '🏃' : tag === 'power' ? '💪' : tag === 'contact' ? '🎯' : '👁️'}
              </span>
            ))}
          </div>
          <div className="text-[10px] text-gray-600 space-y-0.5">
            <div>타율: {player.battingAverage.toFixed(3)}</div>
            <div>파워: {'⭐'.repeat(Math.min(player.power, 5))}</div>
          </div>
        </>
      )}
    </div>
  );
}
