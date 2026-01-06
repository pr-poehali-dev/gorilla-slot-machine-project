import { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Slider } from './ui/slider';
import { useToast } from './ui/use-toast';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import Icon from './ui/icon';
import BonusGame from './BonusGame';

interface SlotMachineProps {
  balance: number;
  onGameResult: (won: boolean, amount: number) => void;
}

// Crazy Monkey symbols
const symbols = ['🐵', '🍌', '🥥', '🌴', '🦜', '💎'];
const BONUS_SYMBOL = '🐵';
const SCATTER_SYMBOL = '🍌';

export default function SlotMachine({ balance, onGameResult }: SlotMachineProps) {
  const [reels, setReels] = useState(['🐵', '🐵', '🐵', '🐵', '🐵']);
  const [isSpinning, setIsSpinning] = useState(false);
  const [bet, setBet] = useState(100);
  const [isDemoMode, setIsDemoMode] = useState(true);
  const [demoSpinsLeft, setDemoSpinsLeft] = useState(10);
  const [showBonusGame, setShowBonusGame] = useState(false);
  const [bonusBet, setBonusBet] = useState(0);
  const { toast } = useToast();

  const getRandomSymbol = () => symbols[Math.floor(Math.random() * symbols.length)];

  // Crazy Monkey winning logic - 5 reels, 9 paylines
  const calculateWin = (results: string[]): { amount: number; hasBonus: boolean } => {
    let totalWin = 0;
    let hasBonus = false;

    // Check for 3+ Bonus symbols (Monkeys) - triggers bonus game
    const monkeyCount = results.filter(r => r === BONUS_SYMBOL).length;
    if (monkeyCount >= 3) {
      hasBonus = true;
      totalWin = bet * 10; // Base win for bonus trigger
    }

    // 5 of a kind
    if (results.every(r => r === results[0])) {
      if (results[0] === BONUS_SYMBOL) return { amount: bet * 500, hasBonus }; // Monkey
      if (results[0] === SCATTER_SYMBOL) return { amount: bet * 200, hasBonus }; // Banana
      if (results[0] === '💎') return { amount: bet * 150, hasBonus }; // Diamond
      return { amount: bet * 100, hasBonus };
    }

    // 4 of a kind
    const symbols4 = results.filter((s, i, arr) => arr.filter(x => x === s).length >= 4);
    if (symbols4.length >= 4) {
      const symbol = symbols4[0];
      if (symbol === BONUS_SYMBOL) totalWin += bet * 100;
      else if (symbol === SCATTER_SYMBOL) totalWin += bet * 50;
      else if (symbol === '💎') totalWin += bet * 40;
      else totalWin += bet * 25;
    }

    // 3 of a kind
    const symbols3 = results.filter((s, i, arr) => arr.filter(x => x === s).length >= 3);
    if (symbols3.length >= 3 && totalWin === 0) {
      const symbol = symbols3[0];
      if (symbol === BONUS_SYMBOL) totalWin += bet * 25;
      else if (symbol === SCATTER_SYMBOL) totalWin += bet * 15;
      else if (symbol === '💎') totalWin += bet * 10;
      else totalWin += bet * 5;
    }

    // 3+ Scatter symbols (Bananas) - free spins multiplier
    const bananaCount = results.filter(r => r === SCATTER_SYMBOL).length;
    if (bananaCount >= 3) {
      totalWin += bet * (bananaCount * 5);
    }

    return { amount: totalWin, hasBonus };
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
      setReels([getRandomSymbol(), getRandomSymbol(), getRandomSymbol(), getRandomSymbol(), getRandomSymbol()]);
    }, 100);

    setTimeout(() => {
      clearInterval(spinInterval);
      
      const finalReels = [getRandomSymbol(), getRandomSymbol(), getRandomSymbol(), getRandomSymbol(), getRandomSymbol()];
      setReels(finalReels);
      
      const { amount: winAmount, hasBonus } = calculateWin(finalReels);
      
      if (isDemoMode) {
        setDemoSpinsLeft(prev => prev - 1);
      }
      
      if (winAmount > 0) {
        if (!isDemoMode) {
          onGameResult(true, winAmount);
        }
        
        const monkeyCount = finalReels.filter(r => r === BONUS_SYMBOL).length;
        if (monkeyCount === 5) {
          toast({
            title: "🎉🐵 CRAZY JACKPOT! 🐵🎉",
            description: isDemoMode 
              ? `Демо-выигрыш: ${winAmount.toLocaleString('ru-RU')} ₽!`
              : `БЕЗУМИЕ! Вы выиграли ${winAmount.toLocaleString('ru-RU')} ₽!`,
            duration: 5000,
          });
        } else if (hasBonus) {
          toast({
            title: "🎰 БОНУСНАЯ ИГРА! 🐵",
            description: isDemoMode
              ? `Демо-выигрыш: ${winAmount.toLocaleString('ru-RU')} ₽ + Бонус!`
              : `Выигрыш ${winAmount.toLocaleString('ru-RU')} ₽ + Бонусная игра!`,
            duration: 4000,
          });
          setBonusBet(bet);
          setTimeout(() => setShowBonusGame(true), 2000);
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
    }, 2500);
  };

  const handleBonusComplete = (bonusWin: number) => {
    setShowBonusGame(false);
    if (!isDemoMode && bonusWin > 0) {
      onGameResult(true, bonusWin);
    }
    
    if (bonusWin > 0) {
      toast({
        title: "🎉 Бонус завершён!",
        description: isDemoMode
          ? `Бонус-выигрыш: ${bonusWin.toLocaleString('ru-RU')} ₽`
          : `Вы выиграли в бонусной игре: ${bonusWin.toLocaleString('ru-RU')} ₽!`,
        duration: 5000,
      });
    }
  };

  const toggleMode = () => {
    if (isDemoMode && demoSpinsLeft === 0) {
      setDemoSpinsLeft(10);
    }
    setIsDemoMode(!isDemoMode);
  };

  if (showBonusGame) {
    return <BonusGame bet={bonusBet} isDemoMode={isDemoMode} onComplete={handleBonusComplete} />;
  }

  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-green-900 via-yellow-900 to-orange-900 border-4 border-yellow-600 shadow-2xl">
      {/* Jungle background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(34, 197, 94, 0.3) 10px, rgba(34, 197, 94, 0.3) 20px)',
        }}></div>
      </div>

      <div className="relative p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-center flex-1">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="text-6xl animate-bounce">🐵</div>
              <div className="text-4xl">🍌</div>
              <div className="text-6xl animate-bounce" style={{ animationDelay: '0.2s' }}>🐵</div>
            </div>
            <h2 className="text-5xl font-black bg-gradient-to-r from-yellow-300 via-orange-400 to-red-500 bg-clip-text text-transparent mb-2 drop-shadow-lg" style={{ fontFamily: 'Playfair Display, serif' }}>
              CRAZY MONKEY
            </h2>
            <p className="text-yellow-300 text-lg font-bold drop-shadow-md">Легендарный игровой автомат</p>
          </div>
        </div>

        {/* Mode Switch */}
        <div className="mb-6 p-4 bg-gradient-to-r from-green-800/80 to-green-700/80 rounded-xl border-2 border-green-500/50 backdrop-blur-sm">
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
                  <Icon name={isDemoMode ? "Eye" : "DollarSign"} size={20} className={isDemoMode ? "text-blue-300" : "text-green-300"} />
                  <div>
                    <div className={`font-semibold ${isDemoMode ? "text-blue-200" : "text-green-200"}`}>
                      {isDemoMode ? "Демо-режим" : "Реальный режим"}
                    </div>
                    <div className="text-xs text-yellow-200">
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
                className="border-blue-400/50 text-blue-200 hover:bg-blue-500/20"
              >
                <Icon name="RotateCcw" size={16} className="mr-1" />
                Перезапустить
              </Button>
            )}
          </div>
        </div>

        {/* Reels Container - 5 reels like Crazy Monkey */}
        <div className="relative mb-8">
          <div className="absolute -inset-4 bg-gradient-to-r from-orange-600/30 via-yellow-500/40 to-orange-600/30 blur-2xl"></div>
          
          <div className="relative bg-gradient-to-br from-yellow-950 to-orange-950 rounded-2xl p-6 border-4 border-yellow-500 shadow-[0_0_40px_rgba(234,179,8,0.5)]">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-red-500 via-yellow-500 to-red-500 px-6 py-2 rounded-full border-2 border-yellow-400">
              <span className="text-white font-black text-lg drop-shadow-lg">🍌 CRAZY MONKEY 🍌</span>
            </div>
            
            <div className="grid grid-cols-5 gap-3 mt-4">
              {reels.map((symbol, index) => (
                <div key={index} className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/30 to-orange-600/30 rounded-xl blur"></div>
                  
                  <div
                    className={`relative aspect-square bg-gradient-to-br from-amber-700 via-yellow-800 to-orange-800 rounded-xl border-3 border-yellow-400/60 flex items-center justify-center text-7xl shadow-xl transition-all duration-300 ${
                      isSpinning ? 'animate-bounce' : 'animate-scale-in'
                    }`}
                    style={{
                      boxShadow: '0 0 25px rgba(234, 179, 8, 0.4), inset 0 3px 15px rgba(0,0,0,0.6)'
                    }}
                  >
                    <div className={`${isSpinning ? 'blur-md scale-50' : ''} transition-all duration-300`}>
                      {symbol}
                    </div>
                  </div>

                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-orange-600/80 backdrop-blur-sm px-2 py-1 rounded-full border-2 border-yellow-400/60">
                    <span className="text-xs font-black text-yellow-100">{index + 1}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-transparent via-yellow-500 to-transparent h-2 w-4/5 rounded-full"></div>
          </div>
        </div>

        {/* Bet Control */}
        <div className="mb-6 p-6 bg-gradient-to-br from-orange-800/80 to-red-800/80 rounded-xl border-2 border-yellow-500/50 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <label className="text-yellow-300 font-bold flex items-center gap-2">
              <Icon name="Coins" size={24} />
              <span className="text-xl">Ставка</span>
            </label>
            <div className="text-right">
              <div className="text-4xl font-black bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent drop-shadow-lg">
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
                className="border-yellow-400/70 hover:bg-yellow-500/30 text-yellow-200 hover:border-yellow-300 font-bold transition-all"
              >
                {amount}
              </Button>
            ))}
          </div>
        </div>

        {/* Spin Button */}
        <Button
          onClick={spin}
          disabled={isSpinning || (!isDemoMode && bet > balance) || (isDemoMode && demoSpinsLeft === 0)}
          className="w-full bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 hover:from-red-500 hover:via-orange-400 hover:to-yellow-400 text-white font-black text-3xl py-12 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_40px_rgba(239,68,68,0.6)] hover:shadow-[0_0_50px_rgba(239,68,68,0.8)] transition-all duration-300 rounded-xl border-4 border-yellow-300 animate-pulse"
          style={{ fontFamily: 'Playfair Display, serif' }}
        >
          {isSpinning ? (
            <span className="flex items-center gap-3">
              <Icon name="Loader2" size={32} className="animate-spin" />
              ВРАЩЕНИЕ...
            </span>
          ) : (
            <span className="flex items-center gap-3">
              <div className="text-4xl">🐵</div>
              КРУТИТЬ
              {isDemoMode ? ` (DEMO)` : ` (${bet.toLocaleString('ru-RU')} ₽)`}
              <div className="text-4xl">🍌</div>
            </span>
          )}
        </Button>

        {/* Paytable - Crazy Monkey style */}
        <div className="mt-6 p-5 bg-gradient-to-br from-green-900/70 to-yellow-900/70 rounded-xl border-2 border-yellow-500/40 backdrop-blur-sm">
          <h3 className="text-yellow-300 font-black mb-4 flex items-center gap-2 text-xl">
            <Icon name="Trophy" size={22} />
            ТАБЛИЦА ВЫПЛАТ
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center p-3 bg-red-600/30 rounded-lg border-2 border-yellow-500/40">
              <span className="text-white font-bold">🐵 x5 CRAZY JACKPOT</span>
              <span className="text-yellow-300 font-black text-xl">x500</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-orange-800/40 rounded-lg border border-yellow-500/30">
              <span className="text-yellow-100">🍌 x5 Бананы</span>
              <span className="text-yellow-300 font-bold text-lg">x200</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-orange-800/40 rounded-lg border border-yellow-500/30">
              <span className="text-yellow-100">💎 x5 Алмазы</span>
              <span className="text-yellow-300 font-bold">x150</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-green-800/40 rounded-lg border border-green-500/30">
              <span className="text-green-100">🐵 x3 Бонусная игра!</span>
              <span className="text-green-300 font-bold">БОНУС!</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-slate-800/40 rounded-lg">
              <span className="text-slate-200 text-sm">x4 одинаковых</span>
              <span className="text-yellow-400 font-bold">x25-100</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-slate-800/40 rounded-lg">
              <span className="text-slate-200 text-sm">x3 одинаковых</span>
              <span className="text-yellow-400 font-bold">x5-25</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
