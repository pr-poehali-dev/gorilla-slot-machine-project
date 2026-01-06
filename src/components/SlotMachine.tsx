import { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Slider } from './ui/slider';
import { useToast } from './ui/use-toast';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
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
  const [isDemoMode, setIsDemoMode] = useState(true);
  const [demoSpinsLeft, setDemoSpinsLeft] = useState(10);
  const { toast } = useToast();

  const getRandomSymbol = () => symbols[Math.floor(Math.random() * symbols.length)];

  const calculateWin = (results: string[]): number => {
    if (results.every(r => r === JACKPOT_SYMBOL)) {
      return bet * 100;
    }
    
    if (results[0] === results[1] && results[1] === results[2]) {
      return bet * 50;
    }
    
    if (results[0] === results[1] || results[1] === results[2] || results[0] === results[2]) {
      return bet * 5;
    }
    
    return 0;
  };

  const spin = () => {
    if (isDemoMode && demoSpinsLeft === 0) {
      toast({
        title: "Демо-спины закончились",
        description: "Переключитесь на реальный режим для продолжения игры",
        variant: "destructive"
      });
      return;
    }

    if (!isDemoMode && bet > balance) {
      toast({
        title: "Недостаточно средств",
        description: "Пополните баланс или уменьшите ставку",
        variant: "destructive"
      });
      return;
    }

    setIsSpinning(true);

    const spinInterval = setInterval(() => {
      setReels([getRandomSymbol(), getRandomSymbol(), getRandomSymbol()]);
    }, 100);

    setTimeout(() => {
      clearInterval(spinInterval);
      
      const finalReels = [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()];
      setReels(finalReels);
      
      const winAmount = calculateWin(finalReels);
      
      if (isDemoMode) {
        setDemoSpinsLeft(prev => prev - 1);
      }
      
      if (winAmount > 0) {
        if (!isDemoMode) {
          onGameResult(true, winAmount);
        }
        
        if (finalReels.every(r => r === JACKPOT_SYMBOL)) {
          toast({
            title: "🎉 ДЖЕКПОТ! 🎉",
            description: isDemoMode 
              ? `Демо-выигрыш: ${winAmount.toLocaleString('ru-RU')} ₽!`
              : `Невероятно! Вы выиграли ${winAmount.toLocaleString('ru-RU')} ₽!`,
            duration: 5000,
          });
        } else {
          toast({
            title: "🎊 Выигрыш!",
            description: isDemoMode
              ? `Демо-выигрыш: ${winAmount.toLocaleString('ru-RU')} ₽`
              : `Вы выиграли ${winAmount.toLocaleString('ru-RU')} ₽`,
          });
        }
      } else {
        if (!isDemoMode) {
          onGameResult(false, bet);
        }
      }
      
      setIsSpinning(false);
    }, 2000);
  };

  const toggleMode = () => {
    if (isDemoMode && demoSpinsLeft === 0) {
      setDemoSpinsLeft(10);
    }
    setIsDemoMode(!isDemoMode);
  };

  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-2 border-yellow-500 shadow-2xl">
      {/* Decorative background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(251, 191, 36, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(251, 191, 36, 0.3) 0%, transparent 50%)',
        }}></div>
      </div>

      <div className="relative p-8">
        {/* Header with Mode Toggle */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-center flex-1">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="text-5xl animate-pulse">🦍</div>
            </div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>
              Gorilla Gold Deluxe
            </h2>
            <p className="text-slate-400 text-sm">Премиум игровой автомат</p>
          </div>
        </div>

        {/* Mode Switch */}
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-xl border border-blue-500/30 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Switch 
                id="mode-switch" 
                checked={!isDemoMode}
                onCheckedChange={toggleMode}
                className="data-[state=checked]:bg-green-600"
              />
              <Label htmlFor="mode-switch" className="cursor-pointer">
                <div className="flex items-center gap-2">
                  <Icon name={isDemoMode ? "Eye" : "DollarSign"} size={20} className={isDemoMode ? "text-blue-400" : "text-green-400"} />
                  <div>
                    <div className={`font-semibold ${isDemoMode ? "text-blue-400" : "text-green-400"}`}>
                      {isDemoMode ? "Демо-режим" : "Реальный режим"}
                    </div>
                    <div className="text-xs text-slate-400">
                      {isDemoMode ? `Осталось спинов: ${demoSpinsLeft}` : "Игра на реальные средства"}
                    </div>
                  </div>
                </div>
              </Label>
            </div>
            {isDemoMode && demoSpinsLeft === 0 && (
              <Button 
                onClick={() => setDemoSpinsLeft(10)} 
                size="sm"
                variant="outline"
                className="border-blue-500/50 text-blue-400 hover:bg-blue-500/20"
              >
                <Icon name="RotateCcw" size={16} className="mr-1" />
                Перезапустить
              </Button>
            )}
          </div>
        </div>

        {/* Reels Container - Modern Design */}
        <div className="relative mb-8">
          {/* Glow effect */}
          <div className="absolute -inset-4 bg-gradient-to-r from-yellow-600/20 via-yellow-400/30 to-yellow-600/20 blur-2xl opacity-50"></div>
          
          <div className="relative bg-gradient-to-br from-slate-950 to-slate-900 rounded-2xl p-6 border-4 border-yellow-500/50 shadow-[0_0_30px_rgba(234,179,8,0.3)]">
            {/* Top decorative bar */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-transparent via-yellow-500 to-transparent h-1 w-3/4 rounded-full"></div>
            
            <div className="grid grid-cols-3 gap-6">
              {reels.map((symbol, index) => (
                <div
                  key={index}
                  className="relative group"
                >
                  {/* Reel frame */}
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 rounded-xl blur-sm"></div>
                  
                  <div
                    className={`relative aspect-square bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800 rounded-xl border-2 border-yellow-500/40 flex items-center justify-center text-8xl shadow-lg transition-all duration-300 group-hover:border-yellow-400/60 ${
                      isSpinning ? 'animate-spin' : 'animate-scale-in'
                    }`}
                    style={{
                      boxShadow: '0 0 20px rgba(234, 179, 8, 0.2), inset 0 2px 10px rgba(0,0,0,0.5)'
                    }}
                  >
                    <div className={`${isSpinning ? 'blur-sm' : ''} transition-all duration-300`}>
                      {symbol}
                    </div>
                  </div>

                  {/* Reel number indicator */}
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-yellow-500/20 backdrop-blur-sm px-3 py-1 rounded-full border border-yellow-500/30">
                    <span className="text-xs font-bold text-yellow-400">{index + 1}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom decorative bar */}
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-transparent via-yellow-500 to-transparent h-1 w-3/4 rounded-full"></div>
          </div>
        </div>

        {/* Bet Control - Modern Design */}
        <div className="mb-6 p-6 bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-xl border border-yellow-500/30 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <label className="text-yellow-400 font-semibold flex items-center gap-2">
              <Icon name="Coins" size={22} />
              <span className="text-lg">Размер ставки</span>
            </label>
            <div className="text-right">
              <div className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                {bet.toLocaleString('ru-RU')} ₽
              </div>
            </div>
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
          
          <div className="grid grid-cols-5 gap-2">
            {[10, 50, 100, 500, 1000].map((amount) => (
              <Button
                key={amount}
                onClick={() => setBet(amount)}
                disabled={isSpinning}
                variant="outline"
                size="sm"
                className="border-yellow-500/50 hover:bg-yellow-500/20 text-yellow-400 hover:border-yellow-400 transition-all"
              >
                {amount}
              </Button>
            ))}
          </div>
        </div>

        {/* Spin Button - Enhanced */}
        <Button
          onClick={spin}
          disabled={isSpinning || (!isDemoMode && bet > balance) || (isDemoMode && demoSpinsLeft === 0)}
          className="w-full bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-600 hover:from-yellow-500 hover:via-yellow-400 hover:to-yellow-500 text-slate-900 font-bold text-2xl py-10 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_30px_rgba(234,179,8,0.4)] hover:shadow-[0_0_40px_rgba(234,179,8,0.6)] transition-all duration-300 rounded-xl border-2 border-yellow-400"
          style={{ fontFamily: 'Playfair Display, serif' }}
        >
          {isSpinning ? (
            <span className="flex items-center gap-3">
              <Icon name="Loader2" size={28} className="animate-spin" />
              Вращение барабанов...
            </span>
          ) : (
            <span className="flex items-center gap-3">
              <Icon name="Play" size={28} />
              КРУТИТЬ
              {isDemoMode ? ` (Демо)` : ` (${bet.toLocaleString('ru-RU')} ₽)`}
            </span>
          )}
        </Button>

        {/* Paytable - Modern Design */}
        <div className="mt-6 p-5 bg-gradient-to-br from-slate-800/60 to-slate-900/60 rounded-xl border border-yellow-500/20 backdrop-blur-sm">
          <h3 className="text-yellow-400 font-bold mb-4 flex items-center gap-2 text-lg">
            <Icon name="Trophy" size={20} />
            Таблица выплат
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
              <span className="text-white font-semibold">🦍 🦍 🦍 Джекпот</span>
              <span className="text-yellow-400 font-bold text-lg">x100</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
              <span className="text-slate-300">💎 💎 💎 Три одинаковых</span>
              <span className="text-yellow-400 font-bold">x50</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
              <span className="text-slate-300">🍒 🍒 Два одинаковых</span>
              <span className="text-yellow-400 font-bold">x5</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
