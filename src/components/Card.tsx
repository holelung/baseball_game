import { PlayerCard, AbilityType } from '../game/types';
import { ABILITY_INFO } from '../game/playerAbility';

interface PlayerCardProps {
  player: PlayerCard;
  onClick?: () => void;
  disabled?: boolean;
  small?: boolean;
}

// 능력 아이콘과 이름 가져오기
function getAbilityDisplay(ability: AbilityType | undefined): { icon: string; name: string } | null {
  if (!ability) return null;
  const info = ABILITY_INFO[ability];
  return { icon: info.icon, name: info.name };
}

export function PlayerCardComponent({ player, onClick, disabled, small }: PlayerCardProps) {
  const tagColors: Record<string, string> = {
    speed: 'bg-green-500',
    power: 'bg-red-500',
    contact: 'bg-blue-500',
    eye: 'bg-purple-500',
  };

  const abilityDisplay = getAbilityDisplay(player.ability);

  const sizeClasses = small
    ? 'w-16 h-20 text-xs'
    : 'w-28 h-40';

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
                {tag === 'speed' ? '🏃' : tag === 'power' ? '💪' : tag === 'contact' ? '🎯' : '👀'}
              </span>
            ))}
          </div>
          {/* 능력 표시 */}
          {abilityDisplay && (
            <div className="bg-purple-600 text-white text-[9px] px-1.5 py-0.5 rounded flex items-center gap-0.5">
              <span>{abilityDisplay.icon}</span>
              <span>{abilityDisplay.name}</span>
            </div>
          )}
          <div className="text-[10px] text-gray-600 space-y-0.5">
            <div>타율: {player.battingAverage.toFixed(3)}</div>
            <div>파워: {'⭐'.repeat(Math.min(player.power, 5))}</div>
          </div>
        </>
      )}
    </div>
  );
}
