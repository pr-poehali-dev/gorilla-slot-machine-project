import { Card } from './ui/card';
import Icon from './ui/icon';

interface StatisticsProps {
  balance: number;
  totalWins: number;
  totalLosses: number;
  gamesPlayed: number;
}

export default function Statistics({ balance, totalWins, totalLosses, gamesPlayed }: StatisticsProps) {
  const netProfit = totalWins - totalLosses;
  const winRate = gamesPlayed > 0 ? ((totalWins / (totalWins + totalLosses)) * 100).toFixed(1) : '0.0';

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-yellow-600 p-6">
        <h2 className="text-2xl font-bold text-yellow-500 mb-6 flex items-center gap-2" style={{ fontFamily: 'Playfair Display, serif' }}>
          <Icon name="BarChart3" size={24} />
          Статистика
        </h2>

        <div className="space-y-4">
          {/* Balance */}
          <div className="p-4 bg-slate-900/50 rounded-lg border border-yellow-600/30">
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
              <Icon name="Wallet" size={16} />
              Текущий баланс
            </div>
            <div className="text-3xl font-bold text-yellow-500">
              {balance.toLocaleString('ru-RU')} ₽
            </div>
          </div>

          {/* Games Played */}
          <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
              <Icon name="Gamepad2" size={16} />
              Игр сыграно
            </div>
            <div className="text-2xl font-bold text-slate-300">
              {gamesPlayed}
            </div>
          </div>

          {/* Total Wins */}
          <div className="p-4 bg-green-900/20 rounded-lg border border-green-600/30">
            <div className="flex items-center gap-2 text-green-400 text-sm mb-1">
              <Icon name="TrendingUp" size={16} />
              Всего выигрышей
            </div>
            <div className="text-2xl font-bold text-green-500">
              +{totalWins.toLocaleString('ru-RU')} ₽
            </div>
          </div>

          {/* Total Losses */}
          <div className="p-4 bg-red-900/20 rounded-lg border border-red-600/30">
            <div className="flex items-center gap-2 text-red-400 text-sm mb-1">
              <Icon name="TrendingDown" size={16} />
              Всего проигрышей
            </div>
            <div className="text-2xl font-bold text-red-500">
              -{totalLosses.toLocaleString('ru-RU')} ₽
            </div>
          </div>

          {/* Net Profit */}
          <div className={`p-4 rounded-lg border ${
            netProfit >= 0 
              ? 'bg-green-900/20 border-green-600/30' 
              : 'bg-red-900/20 border-red-600/30'
          }`}>
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
              <Icon name="Calculator" size={16} />
              Чистая прибыль
            </div>
            <div className={`text-2xl font-bold ${
              netProfit >= 0 ? 'text-green-500' : 'text-red-500'
            }`}>
              {netProfit >= 0 ? '+' : ''}{netProfit.toLocaleString('ru-RU')} ₽
            </div>
          </div>

          {/* Win Rate */}
          <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
              <Icon name="Percent" size={16} />
              Процент выигрышей
            </div>
            <div className="text-2xl font-bold text-slate-300">
              {winRate}%
            </div>
          </div>
        </div>
      </Card>

      {/* Info Card */}
      <Card className="bg-blue-900/20 border border-blue-600/30 p-4">
        <div className="flex items-start gap-3">
          <Icon name="Info" size={20} className="text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-200">
            <p className="font-semibold mb-1">Демо-режим</p>
            <p className="text-blue-300/80">
              Вы играете виртуальными фишками. Все выигрыши и проигрыши условные.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
