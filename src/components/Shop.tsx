import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { ShopItem, PlayerCard, ShopItemType } from '../game/types';
import { PlayerCardComponent } from './Card';

interface ShopProps {
  onClose: () => void;
}

type ShopTab = 'all' | 'player' | 'upgrade' | 'coach' | 'voucher';

export function Shop({ onClose }: ShopProps) {
  const {
    shop,
    gold,
    playerDeck,
    playerHand,
    selectedPlayer,
    bases,
    maxRosterSize,
    coaches,
    maxCoaches,
    vouchers,
    buyPlayer,
    replacePlayer,
    buyCoach,
    buyVoucher,
    buyPlayerUpgrade,
    buyActionUpgrade,
  } = useGameStore();

  const [activeTab, setActiveTab] = useState<ShopTab>('all');
  const [replacingItem, setReplacingItem] = useState<ShopItem | null>(null);
  const [upgradingItem, setUpgradingItem] = useState<ShopItem | null>(null);

  // 현재 로스터 계산
  const currentRoster: PlayerCard[] = [...playerDeck, ...playerHand];
  if (selectedPlayer) currentRoster.push(selectedPlayer);
  if (bases.first) currentRoster.push(bases.first);
  if (bases.second) currentRoster.push(bases.second);
  if (bases.third) currentRoster.push(bases.third);

  const rosterCount = currentRoster.length;
  const canAddPlayer = rosterCount < maxRosterSize;
  const canAddCoach = coaches.length < maxCoaches;

  const tierLabels = {
    basic: '기본 상점',
    medium: '중급 상점',
    high: '고급 상점',
  };

  const tierColors = {
    basic: 'from-gray-600 to-gray-700',
    medium: 'from-blue-600 to-blue-700',
    high: 'from-purple-600 to-purple-700',
  };

  // 탭별 아이템 필터링
  const getFilteredItems = () => {
    if (activeTab === 'all') return shop.items;
    if (activeTab === 'player') return shop.items.filter(i => i.type === 'player');
    if (activeTab === 'upgrade') return shop.items.filter(i => i.type === 'playerUpgrade' || i.type === 'actionUpgrade');
    if (activeTab === 'coach') return shop.items.filter(i => i.type === 'coach');
    if (activeTab === 'voucher') return shop.items.filter(i => i.type === 'voucher');
    return shop.items;
  };

  const filteredItems = getFilteredItems();

  // 탭별 아이템 수
  const tabCounts = {
    all: shop.items.length,
    player: shop.items.filter(i => i.type === 'player').length,
    upgrade: shop.items.filter(i => i.type === 'playerUpgrade' || i.type === 'actionUpgrade').length,
    coach: shop.items.filter(i => i.type === 'coach').length,
    voucher: shop.items.filter(i => i.type === 'voucher').length,
  };

  const handleBuyItem = (item: ShopItem) => {
    if (gold < item.price) return;

    switch (item.type) {
      case 'player':
        if (canAddPlayer) {
          buyPlayer(item);
        } else {
          setReplacingItem(item);
        }
        break;
      case 'coach':
        if (canAddCoach) {
          buyCoach(item);
        }
        break;
      case 'voucher':
        buyVoucher(item);
        break;
      case 'playerUpgrade':
        setUpgradingItem(item);
        break;
      case 'actionUpgrade':
        buyActionUpgrade(item);
        break;
    }
  };

  const handleReplacePlayer = (oldPlayerId: string) => {
    if (!replacingItem || !replacingItem.player) return;

    const state = useGameStore.getState();
    if (state.gold < replacingItem.price) return;

    useGameStore.setState({ gold: state.gold - replacingItem.price });
    replacePlayer(replacingItem.player, oldPlayerId);

    const newItems = state.shop.items.filter(i => i.id !== replacingItem.id);
    useGameStore.setState({
      shop: { ...state.shop, items: newItems },
    });

    setReplacingItem(null);
  };

  const handleUpgradePlayer = (playerId: string) => {
    if (!upgradingItem) return;
    buyPlayerUpgrade(upgradingItem, playerId);
    setUpgradingItem(null);
  };

  // 선수 교체 모드 UI
  if (replacingItem) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
        <div className="bg-gray-800 rounded-xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">선수 교체</h2>
            <p className="text-gray-300">
              새 선수: <span className="text-yellow-400">{replacingItem.player?.name}</span>
            </p>
            <p className="text-gray-400 text-sm mt-2">교체할 기존 선수를 선택하세요 (영구 퇴장)</p>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 mb-6">
            {currentRoster.map((player) => (
              <div
                key={player.id}
                onClick={() => handleReplacePlayer(player.id)}
                className="cursor-pointer hover:scale-105 transition-transform"
              >
                <PlayerCardComponent player={player} small />
              </div>
            ))}
          </div>

          <div className="flex justify-center">
            <button
              onClick={() => setReplacingItem(null)}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500"
            >
              취소
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 선수 강화 대상 선택 모드 UI
  if (upgradingItem) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
        <div className="bg-gray-800 rounded-xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">선수 강화</h2>
            <p className="text-gray-300">
              강화: <span className="text-green-400">{upgradingItem.name}</span>
            </p>
            <p className="text-gray-400 text-sm mt-2">강화할 선수를 선택하세요</p>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 mb-6">
            {currentRoster.map((player) => (
              <div
                key={player.id}
                onClick={() => handleUpgradePlayer(player.id)}
                className="cursor-pointer hover:scale-105 transition-transform"
              >
                <PlayerCardComponent player={player} small />
              </div>
            ))}
          </div>

          <div className="flex justify-center">
            <button
              onClick={() => setUpgradingItem(null)}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500"
            >
              취소
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className={`bg-gradient-to-r ${tierColors[shop.tier]} rounded-lg p-4 mb-4`}>
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">{tierLabels[shop.tier]}</h2>
            <div className="flex items-center gap-4 text-sm">
              <div className="text-yellow-400 font-bold">💰 {gold}G</div>
              <div className="text-gray-300">선수: {rosterCount}/{maxRosterSize}</div>
              <div className="text-gray-300">코치: {coaches.length}/{maxCoaches}</div>
            </div>
          </div>
        </div>

        {/* 보유 코치 표시 */}
        {coaches.length > 0 && (
          <div className="mb-4 p-3 bg-gray-700/50 rounded-lg">
            <div className="text-gray-400 text-xs mb-2">보유 코치</div>
            <div className="flex flex-wrap gap-2">
              {coaches.map(coach => (
                <div key={coach.id} className="bg-orange-600/30 border border-orange-500 rounded px-2 py-1 text-xs text-white">
                  {coach.icon} {coach.name}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 보유 바우처 표시 */}
        {vouchers.length > 0 && (
          <div className="mb-4 p-3 bg-gray-700/50 rounded-lg">
            <div className="text-gray-400 text-xs mb-2">보유 바우처</div>
            <div className="flex flex-wrap gap-2">
              {vouchers.map(voucher => (
                <div key={voucher.id} className="bg-purple-600/30 border border-purple-500 rounded px-2 py-1 text-xs text-white">
                  {voucher.icon} {voucher.name}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 탭 */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {(['all', 'player', 'upgrade', 'coach', 'voucher'] as ShopTab[]).map(tab => {
            const labels: Record<ShopTab, string> = {
              all: '전체',
              player: '선수',
              upgrade: '강화',
              coach: '코치',
              voucher: '바우처',
            };
            const count = tabCounts[tab];
            if (count === 0 && tab !== 'all') return null;

            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition-colors ${
                  activeTab === tab
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {labels[tab]} ({count})
              </button>
            );
          })}
        </div>

        {/* 아이템 목록 */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            해당 카테고리에 아이템이 없습니다
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            {filteredItems.map((item) => (
              <ShopItemCard
                key={item.id}
                item={item}
                canAfford={gold >= item.price}
                canAddPlayer={canAddPlayer}
                canAddCoach={canAddCoach}
                onBuy={() => handleBuyItem(item)}
              />
            ))}
          </div>
        )}

        {/* 닫기 버튼 */}
        <div className="flex justify-center">
          <button
            onClick={onClose}
            className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-500 font-bold text-lg"
          >
            상점 닫기
          </button>
        </div>
      </div>
    </div>
  );
}

interface ShopItemCardProps {
  item: ShopItem;
  canAfford: boolean;
  canAddPlayer: boolean;
  canAddCoach: boolean;
  onBuy: () => void;
}

function ShopItemCard({ item, canAfford, canAddPlayer, canAddCoach, onBuy }: ShopItemCardProps) {
  const typeColors: Record<ShopItemType, string> = {
    player: 'border-blue-400 bg-blue-50',
    playerUpgrade: 'border-green-400 bg-green-50',
    actionUpgrade: 'border-yellow-400 bg-yellow-50',
    coach: 'border-orange-400 bg-orange-50',
    voucher: 'border-purple-400 bg-purple-50',
  };

  const typeLabels: Record<ShopItemType, string> = {
    player: '선수',
    playerUpgrade: '선수강화',
    actionUpgrade: '액션강화',
    coach: '코치',
    voucher: '바우처',
  };

  const typeIcons: Record<ShopItemType, string> = {
    player: '⚾',
    playerUpgrade: '📈',
    actionUpgrade: '🃏',
    coach: '👨‍🏫',
    voucher: '🎫',
  };

  const rarityColors: Record<string, string> = {
    common: 'bg-gray-500',
    rare: 'bg-blue-500',
    epic: 'bg-purple-500',
    legendary: 'bg-yellow-500 text-black',
  };

  const rarityLabels: Record<string, string> = {
    common: '일반',
    rare: '희귀',
    epic: '영웅',
    legendary: '전설',
  };

  const canBuy = () => {
    if (!canAfford) return false;
    if (item.type === 'player' && !canAddPlayer) return true; // 교체 가능
    if (item.type === 'coach' && !canAddCoach) return false;
    return true;
  };

  const getButtonText = () => {
    if (!canAfford) return '골드 부족';
    if (item.type === 'player' && !canAddPlayer) return '교체 구매';
    if (item.type === 'coach' && !canAddCoach) return '슬롯 부족';
    if (item.type === 'playerUpgrade') return '강화 대상 선택';
    return '구매';
  };

  return (
    <div className={`${typeColors[item.type]} border-2 rounded-lg p-4`}>
      {/* 타입 및 가격 */}
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-1">
          <span className="text-lg">{item.coach?.icon || item.voucher?.icon || typeIcons[item.type]}</span>
          <span className="text-xs px-2 py-0.5 rounded bg-gray-600 text-white">
            {typeLabels[item.type]}
          </span>
          {item.rarity && (
            <span className={`text-xs px-2 py-0.5 rounded text-white ${rarityColors[item.rarity]}`}>
              {rarityLabels[item.rarity]}
            </span>
          )}
        </div>
        <span className="text-yellow-600 font-bold">{item.price}G</span>
      </div>

      {/* 아이템 정보 */}
      <div className="text-center mb-3">
        <div className="font-bold text-gray-800">{item.name}</div>
        <div className="text-xs text-gray-600 mt-1">{item.description}</div>

        {/* 선수 추가 정보 */}
        {item.player && (
          <div className="mt-2">
            <div className="flex gap-1 justify-center">
              {item.player.tags.map(tag => (
                <span
                  key={tag}
                  className={`text-[10px] px-1.5 py-0.5 rounded text-white ${
                    tag === 'speed' ? 'bg-green-500' :
                    tag === 'power' ? 'bg-red-500' :
                    tag === 'contact' ? 'bg-blue-500' :
                    'bg-purple-500'
                  }`}
                >
                  {tag === 'speed' ? '⚡' : tag === 'power' ? '💪' : tag === 'contact' ? '🎯' : '👀'}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 구매 버튼 */}
      <button
        onClick={onBuy}
        disabled={!canBuy()}
        className={`w-full py-2 rounded font-bold text-sm transition-colors ${
          canBuy()
            ? 'bg-green-600 text-white hover:bg-green-500'
            : 'bg-gray-400 text-gray-600 cursor-not-allowed'
        }`}
      >
        {getButtonText()}
      </button>
    </div>
  );
}
