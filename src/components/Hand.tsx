import { PlayerCard } from '../game/types';
import { PlayerCardComponent } from './Card';

interface HandProps {
  players: PlayerCard[];
  onSelectPlayer: (playerId: string) => void;
  disabled?: boolean;
}

export function Hand({ players, onSelectPlayer, disabled }: HandProps) {
  if (players.length === 0) {
    return (
      <div className="text-gray-400 text-center py-8">
        선수를 드로우하는 중...
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <h3 className="text-white text-lg font-semibold">🎴 선수 선택</h3>
      <div className="flex gap-4 justify-center">
        {players.map(player => (
          <PlayerCardComponent
            key={player.id}
            player={player}
            onClick={() => onSelectPlayer(player.id)}
            disabled={disabled}
          />
        ))}
      </div>
      <p className="text-gray-400 text-sm">타석에 세울 선수를 선택하세요</p>
    </div>
  );
}
