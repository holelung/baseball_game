import { PokerCard } from '../game/types';
import { getRankDisplay, getSuitEmoji, isRedSuit } from '../game/deck';

interface PokerCardProps {
  card: PokerCard;
  onClick?: () => void;
  disabled?: boolean;
  highlighted?: boolean;
}

export function PokerCardComponent({ card, onClick, disabled, highlighted }: PokerCardProps) {
  const isRed = isRedSuit(card.suit);
  const rankDisplay = getRankDisplay(card.rank);
  const suitEmoji = getSuitEmoji(card.suit);
  
  return (
    <div
      onClick={disabled ? undefined : onClick}
      className={`
        w-16 h-24 sm:w-20 sm:h-28
        bg-white rounded-lg shadow-lg
        flex flex-col items-center justify-between p-1.5 sm:p-2
        border-2 transition-all duration-200
        ${card.selected 
          ? 'border-yellow-400 ring-2 ring-yellow-400 -translate-y-2 scale-105' 
          : 'border-gray-300'}
        ${highlighted 
          ? 'border-green-400 ring-2 ring-green-400' 
          : ''}
        ${onClick && !disabled 
          ? 'cursor-pointer hover:border-blue-400 hover:-translate-y-1' 
          : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      {/* 상단 좌측: 랭크 + 무늬 */}
      <div className={`self-start text-xs sm:text-sm font-bold ${isRed ? 'text-red-500' : 'text-gray-800'}`}>
        <div className="leading-none">{rankDisplay}</div>
        <div className="text-base sm:text-lg leading-none">{suitEmoji}</div>
      </div>
      
      {/* 중앙: 큰 무늬 */}
      <div className={`text-2xl sm:text-3xl ${isRed ? 'text-red-500' : 'text-gray-800'}`}>
        {suitEmoji}
      </div>
      
      {/* 하단 우측: 랭크 + 무늬 (뒤집힌) */}
      <div className={`self-end text-xs sm:text-sm font-bold rotate-180 ${isRed ? 'text-red-500' : 'text-gray-800'}`}>
        <div className="leading-none">{rankDisplay}</div>
        <div className="text-base sm:text-lg leading-none">{suitEmoji}</div>
      </div>
    </div>
  );
}

interface PokerHandProps {
  cards: PokerCard[];
  onCardClick: (cardId: string) => void;
  disabled?: boolean;
}

export function PokerHand({ cards, onCardClick, disabled }: PokerHandProps) {
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
        <PokerCardComponent
          key={card.id}
          card={card}
          onClick={() => onCardClick(card.id)}
          disabled={disabled}
        />
      ))}
    </div>
  );
}
