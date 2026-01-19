import { ActionCard } from '../game/types';
import { getRankDisplay, getStatEmoji, getStatColorClass, getStatBgClass } from '../game/deck';

interface ActionCardProps {
  card: ActionCard;
  onClick?: () => void;
  disabled?: boolean;
  highlighted?: boolean;
}

export function ActionCardComponent({ card, onClick, disabled, highlighted }: ActionCardProps) {
  const rankDisplay = getRankDisplay(card.rank);
  const statEmoji = getStatEmoji(card.stat);
  const colorClass = getStatColorClass(card.stat);
  const bgGradient = getStatBgClass(card.stat);

  return (
    <div
      onClick={disabled ? undefined : onClick}
      className={`
        w-16 h-24 sm:w-20 sm:h-28
        bg-gradient-to-br ${bgGradient}
        rounded-lg shadow-lg
        flex flex-col items-center justify-between p-1.5 sm:p-2
        border-2 transition-all duration-200
        ${card.selected
          ? 'border-yellow-400 ring-2 ring-yellow-400 -translate-y-2 scale-105'
          : 'border-white/30'}
        ${highlighted
          ? 'border-green-400 ring-2 ring-green-400'
          : ''}
        ${onClick && !disabled
          ? 'cursor-pointer hover:border-white/60 hover:-translate-y-1'
          : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      {/* 상단 좌측: 랭크 + 속성 */}
      <div className="self-start text-xs sm:text-sm font-bold text-white">
        <div className="leading-none">{rankDisplay}</div>
        <div className="text-base sm:text-lg leading-none">{statEmoji}</div>
      </div>

      {/* 중앙: 큰 속성 이모지 */}
      <div className="text-2xl sm:text-3xl">
        {statEmoji}
      </div>

      {/* 하단 우측: 랭크 + 속성 (뒤집힌) */}
      <div className="self-end text-xs sm:text-sm font-bold rotate-180 text-white">
        <div className="leading-none">{rankDisplay}</div>
        <div className="text-base sm:text-lg leading-none">{statEmoji}</div>
      </div>
    </div>
  );
}

interface ActionHandProps {
  cards: ActionCard[];
  onCardClick: (cardId: string) => void;
  disabled?: boolean;
}

export function ActionHand({ cards, onCardClick, disabled }: ActionHandProps) {
  if (cards.length === 0) {
    return (
      <div className="text-gray-400 text-center py-4">
        카드를 드로우하는 중...
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2 sm:gap-3 justify-center">
      {cards.map(card => (
        <ActionCardComponent
          key={card.id}
          card={card}
          onClick={() => onCardClick(card.id)}
          disabled={disabled}
        />
      ))}
    </div>
  );
}
