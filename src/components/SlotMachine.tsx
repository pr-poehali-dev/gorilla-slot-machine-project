import { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Slider } from './ui/slider';
import { useToast } from './ui/use-toast';
import Icon from './ui/icon';

interface SlotMachineProps {
  balance: number;
  onGameResult: (won: boolean, amount: number) => void;
}

const symbols = ['🦍', '💎', '🍒', '⭐', '7️⃣', '🔔'];
const JACKPOT_SYMBOL = '🦍';

export default function SlotMachine({ balance, onGameResult }: SlotMachineProps) {
  const [reels, setReels] = useState(['🦍', '🦍', '🦍']);
  const [isSpinning, setIsSpinning] = useState(false);
  const [bet, setBet] = useState(100);
  const { toast } = useToast();

  const getRandomSymbol = () => symbols[Math.floor(Math.random() * symbols.length)];

  const calculateWin = (results: string[]): number => {
    // Джекпот - три гориллы
    if (results.every(r => r === JACKPOT_SYMBOL)) {
      return bet * 100;
    }
    
    // Три одинаковых символа
    if (results[0] === results[1] && results[1] === results[2]) {
      return bet * 50;
    }
    
    // Два одинаковых символа
    if (results[0] === results[1] || results[1] === results[2] || results[0] === results[2]) {
      return bet * 5;
    }
    
    return 0;
  };

  const spin = () => {
    if (bet > balance) {
      toast({
        title: "Недостаточно средств",
        description: "Пополните баланс или уменьшите ставку",
        variant: "destructive"
      });
      return;
    }

    setIsSpinning(true);

    // Анимация вращения
    const spinInterval = setInterval(() => {
      setReels([getRandomSymbol(), getRandomSymbol(), getRandomSymbol()]);
    }, 100);

    // Остановка через 2 секунды
    setTimeout(() => {
      clearInterval(spinInterval);
      
      const finalReels = [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()];
      setReels(finalReels);
      
      const winAmount = calculateWin(finalReels);
      
      if (winAmount > 0) {
        onGameResult(true, winAmount);
        
        if (finalReels.every(r => r === JACKPOT_SYMBOL)) {
          toast({
            title: "🎉 ДЖЕКПОТ! 🎉",
            description: `Невероятно! Вы выиграли ${winAmount.toLocaleString('ru-RU')} ₽!`,
            duration: 5000,
          });
        } else {
          toast({
            title: "🎊 Выигрыш!",
            description: `Вы выиграли ${winAmount.toLocaleString('ru-RU')} ₽`,
          });
        }
      } else {
        onGameResult(false, bet);
      }
      
      setIsSpinning(false);
    }, 2000);
  };

  return (
    <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-yellow-600 p-8 shadow-2xl">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-yellow-500 mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
          Gorilla Gold Deluxe
        </h2>
        <p className="text-slate-400">Классический трёхбарабанный автомат</p>
      </div>

      {/* Reels */}
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-600/20 via-transparent to-yellow-600/20 pointer-events-none rounded-xl"></div>
        
        <div className="grid grid-cols-3 gap-4 p-6 bg-slate-900/80 rounded-xl border-4 border-yellow-700/50">
          {reels.map((symbol, index) => (
            <div
              key={index}
              className={`aspect-square bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg border-2 border-yellow-600/30 flex items-center justify-center text-8xl ${
                isSpinning ? 'animate-spin' : 'animate-scale-in'
              }`}
            >
              {symbol}
            </div>
          ))}
        </div>
      </div>

      {/* Bet Control */}
      <div className="mb-6 p-6 bg-slate-900/50 rounded-lg border border-yellow-600/30">
        <div className="flex items-center justify-between mb-4">
          <label className="text-yellow-500 font-semibold flex items-center gap-2">
            <Icon name="DollarSign" size={20} />
            Ставка
          </label>
          <span className="text-2xl font-bold text-yellow-500">
            {bet.toLocaleString('ru-RU')} ₽
          </span>
        </div>
        
        <Slider
          value={[bet]}
          onValueChange={(value) => setBet(value[0])}
          min={10}
          max={1000}
          step={10}
          className="mb-4"
          disabled={isSpinning}
        />
        
        <div className="flex gap-2">
          {[10, 50, 100, 500, 1000].map((amount) => (
            <Button
              key={amount}
              onClick={() => setBet(amount)}
              disabled={isSpinning}
              variant="outline"
              size="sm"
              className="flex-1 border-yellow-600/50 hover:bg-yellow-600/20 text-yellow-500"
            >
              {amount}
            </Button>
          ))}
        </div>
      </div>

      {/* Spin Button */}
      <Button
        onClick={spin}
        disabled={isSpinning || bet > balance}
        className="w-full bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-slate-900 font-bold text-xl py-8 text-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
      >
        {isSpinning ? (
          <span className="flex items-center gap-2">
            <Icon name="Loader2" size={24} className="animate-spin" />
            Вращение...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Icon name="Play" size={24} />
            КРУТИТЬ ({bet.toLocaleString('ru-RU')} ₽)
          </span>
        )}
      </Button>

      {/* Paytable */}
      <div className="mt-6 p-4 bg-slate-900/50 rounded-lg border border-yellow-600/30">
        <h3 className="text-yellow-500 font-semibold mb-3 flex items-center gap-2">
          <Icon name="Trophy" size={18} />
          Таблица выплат
        </h3>
        <div className="space-y-2 text-sm text-slate-300">
          <div className="flex justify-between">
            <span>🦍 🦍 🦍 (Джекпот)</span>
            <span className="text-yellow-500 font-bold">x100</span>
          </div>
          <div className="flex justify-between">
            <span>Три одинаковых</span>
            <span className="text-yellow-500">x50</span>
          </div>
          <div className="flex justify-between">
            <span>Два одинаковых</span>
            <span className="text-yellow-500">x5</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
