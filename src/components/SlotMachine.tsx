import { useState } from 'react';
import { Button } from './ui/button';
import { useToast } from './ui/use-toast';
import BonusGame from './BonusGame';

interface SlotMachineProps {
  balance: number;
  onGameResult: (won: boolean, amount: number) => void;
}

const BONUS_SYMBOL = '🐵';

export default function SlotMachine({ balance, onGameResult }: SlotMachineProps) {
  const [reels, setReels] = useState(['🌴', '🦜', '🔔', '🌴', '🦜']);
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentLine, setCurrentLine] = useState(1);
  const [bet, setBet] = useState(1);
  const [isDemoMode, setIsDemoMode] = useState(true);
  const [demoSpinsLeft, setDemoSpinsLeft] = useState(10);
  const [showBonusGame, setShowBonusGame] = useState(false);
  const [bonusBet, setBonusBet] = useState(0);
  const [totalSpins, setTotalSpins] = useState(0);
  const { toast } = useToast();

  // RTP 85% - игрок проигрывает больше в долгосрочной перспективе
  const getRandomSymbol = () => {
    const random = Math.random();
    if (random < 0.35) return '🌴'; // 35% низкооплачиваемый
    if (random < 0.70) return '🦜'; // 35% низкооплачиваемый
    if (random < 0.85) return '🔔'; // 15% средний
    if (random < 0.93) return '🥥'; // 8% средний
    if (random < 0.97) return '🍌'; // 4% высокооплачиваемый
    if (random < 0.995) return '💎'; // 2.5% высокооплачиваемый
    return '🐵'; // 0.5% бонус/джекпот
  };

  const calculateWin = (results: string[], totalBet: number): { amount: number; hasBonus: boolean } => {
    let totalWin = 0;
    let hasBonus = false;

    // 15% шанс полностью обнулить выигрыш (house edge)
    if (Math.random() < 0.15) {
      return { amount: 0, hasBonus: false };
    }

    const monkeyCount = results.filter(r => r === BONUS_SYMBOL).length;
    if (monkeyCount >= 3) {
      hasBonus = true;
      totalWin = totalBet * 3;
    }

    // 5 одинаковых (сниженные выплаты)
    if (results.every(r => r === results[0])) {
      if (results[0] === '🐵') return { amount: totalBet * 200, hasBonus };
      if (results[0] === '💎') return { amount: totalBet * 100, hasBonus };
      if (results[0] === '🍌') return { amount: totalBet * 80, hasBonus };
      if (results[0] === '🥥') return { amount: totalBet * 50, hasBonus };
      return { amount: totalBet * 30, hasBonus };
    }

    // 4 одинаковых
    const symbols4 = results.filter((s, i, arr) => arr.filter(x => x === s).length >= 4);
    if (symbols4.length >= 4) {
      const symbol = symbols4[0];
      if (symbol === '🐵') totalWin += totalBet * 40;
      else if (symbol === '💎') totalWin += totalBet * 20;
      else if (symbol === '🍌') totalWin += totalBet * 15;
      else if (symbol === '🥥') totalWin += totalBet * 10;
      else totalWin += totalBet * 5;
    }

    // 3 одинаковых
    const symbols3 = results.filter((s, i, arr) => arr.filter(x => x === s).length >= 3);
    if (symbols3.length >= 3 && totalWin === 0) {
      const symbol = symbols3[0];
      if (symbol === '🐵') totalWin += totalBet * 10;
      else if (symbol === '💎') totalWin += totalBet * 6;
      else if (symbol === '🍌') totalWin += totalBet * 5;
      else if (symbol === '🥥') totalWin += totalBet * 3;
      else totalWin += totalBet * 2;
    }

    // Периодическая "поддавка" для азарта
    if (totalSpins > 0 && totalSpins % 10 === 0 && Math.random() > 0.5) {
      totalWin = Math.max(totalWin, totalBet * 3);
    }

    return { amount: Math.floor(totalWin), hasBonus };
  };

  const spin = () => {
    if (isDemoMode && demoSpinsLeft === 0) {
      toast({
        title: "Демо-спины закончились",
        description: "Переключитесь на реальный режим",
        variant: "destructive"
      });
      return;
    }

    const totalBet = bet * currentLine;
    if (!isDemoMode && totalBet > balance) {
      toast({
        title: "Недостаточно средств",
        variant: "destructive"
      });
      return;
    }

    setIsSpinning(true);
    setTotalSpins(prev => prev + 1);

    const spinInterval = setInterval(() => {
      setReels([getRandomSymbol(), getRandomSymbol(), getRandomSymbol(), getRandomSymbol(), getRandomSymbol()]);
    }, 80);

    setTimeout(() => {
      clearInterval(spinInterval);
      
      const finalReels = [getRandomSymbol(), getRandomSymbol(), getRandomSymbol(), getRandomSymbol(), getRandomSymbol()];
      setReels(finalReels);
      
      const { amount: winAmount, hasBonus } = calculateWin(finalReels, totalBet);
      
      if (isDemoMode) {
        setDemoSpinsLeft(prev => prev - 1);
      }
      
      if (winAmount > 0) {
        if (!isDemoMode) {
          onGameResult(true, winAmount);
        }
        
        if (hasBonus) {
          toast({
            title: "🎰 БОНУСНАЯ ИГРА!",
            description: `Выигрыш ${winAmount} ₽ + Бонус!`,
            duration: 3000,
          });
          setBonusBet(totalBet);
          setTimeout(() => setShowBonusGame(true), 1500);
        } else if (winAmount >= totalBet * 50) {
          toast({
            title: "🎉 БОЛЬШОЙ ВЫИГРЫШ!",
            description: `${winAmount} ₽`,
            duration: 4000,
          });
        } else {
          toast({
            title: "Выигрыш",
            description: `${winAmount} ₽`,
            duration: 2000,
          });
        }
      } else {
        if (!isDemoMode) {
          onGameResult(false, totalBet);
        }
      }
      
      setIsSpinning(false);
    }, 2000);
  };

  const handleBonusComplete = (bonusWin: number) => {
    setShowBonusGame(false);
    if (!isDemoMode && bonusWin > 0) {
      onGameResult(true, bonusWin);
    }
    
    if (bonusWin > 0) {
      toast({
        title: "Бонус завершён",
        description: `${bonusWin} ₽`,
        duration: 3000,
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

  const totalBet = bet * currentLine;

  return (
    <div className="w-full max-w-4xl mx-auto px-2 sm:px-4">
      <div className="relative bg-gradient-to-b from-orange-900 via-orange-800 to-orange-900 rounded-xl sm:rounded-2xl border-4 sm:border-8 border-yellow-600 shadow-2xl overflow-hidden">
        <div className="absolute inset-0 border-2 sm:border-4 border-yellow-500/30 pointer-events-none"></div>
        
        {/* Заголовок */}
        <div className="relative bg-gradient-to-b from-red-700 to-red-900 py-3 sm:py-4 px-4 sm:px-6 border-b-2 sm:border-b-4 border-yellow-600">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 sm:gap-3 mb-1 sm:mb-2">
              <span className="text-3xl sm:text-5xl">🐵</span>
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-yellow-300 tracking-wider drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]" style={{ fontFamily: 'Impact, sans-serif', textShadow: '2px 2px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000' }}>
                CRAZY MONKEY
              </h1>
              <span className="text-3xl sm:text-5xl">🍌</span>
            </div>
          </div>
        </div>

        {/* Основная область */}
        <div className="p-3 sm:p-6">
          {/* Барабаны */}
          <div className="relative mb-4 sm:mb-6">
            <div className="bg-gradient-to-b from-blue-950 to-blue-900 p-1.5 sm:p-2 rounded-lg sm:rounded-xl border-2 sm:border-4 border-blue-800 shadow-inner">
              <div className="grid grid-cols-5 gap-1 sm:gap-2">
                {reels.map((symbol, index) => (
                  <div
                    key={index}
                    className={`aspect-square bg-gradient-to-b from-slate-200 to-slate-100 rounded border-2 sm:border-4 border-slate-300 flex items-center justify-center shadow-lg ${
                      isSpinning ? 'animate-bounce' : ''
                    }`}
                  >
                    <span className={`text-3xl sm:text-5xl md:text-7xl ${isSpinning ? 'blur-sm' : ''} transition-all`}>
                      {symbol}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="absolute -left-1 sm:-left-2 top-1/2 -translate-y-1/2 bg-yellow-500 text-slate-900 font-black px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs sm:text-sm">
              {currentLine}
            </div>
          </div>

          {/* Панель управления */}
          <div className="bg-gradient-to-b from-slate-700 to-slate-800 rounded-lg sm:rounded-xl border-2 sm:border-4 border-slate-600 p-2 sm:p-4 mb-3 sm:mb-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-3 mb-2 sm:mb-3">
              <div className="bg-black rounded px-2 sm:px-3 py-1.5 sm:py-2 border border-red-600">
                <div className="text-red-500 text-[10px] sm:text-xs font-bold">КРЕДИТ</div>
                <div className="text-yellow-400 text-base sm:text-xl font-black">{balance}</div>
              </div>

              <div className="bg-black rounded px-2 sm:px-3 py-1.5 sm:py-2 border border-red-600">
                <div className="text-red-500 text-[10px] sm:text-xs font-bold">СТАВКА</div>
                <div className="text-yellow-400 text-base sm:text-xl font-black">{bet}</div>
              </div>

              <div className="bg-black rounded px-2 sm:px-3 py-1.5 sm:py-2 border border-red-600">
                <div className="text-red-500 text-[10px] sm:text-xs font-bold">ЛИНИИ</div>
                <div className="text-yellow-400 text-base sm:text-xl font-black">{currentLine}</div>
              </div>

              <div className="bg-black rounded px-2 sm:px-3 py-1.5 sm:py-2 border border-red-600">
                <div className="text-red-500 text-[10px] sm:text-xs font-bold">ВСЕГО</div>
                <div className="text-yellow-400 text-base sm:text-xl font-black">{totalBet}</div>
              </div>
            </div>

            {/* Кнопки */}
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2 mb-2">
              <Button
                onClick={() => setBet(Math.max(1, bet - 1))}
                disabled={isSpinning}
                className="bg-gradient-to-b from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white font-black border-2 sm:border-4 border-red-900 shadow-lg py-4 sm:py-6 text-xs sm:text-base h-auto"
              >
                БЕТ -
              </Button>
              
              <Button
                onClick={() => setBet(Math.min(10, bet + 1))}
                disabled={isSpinning}
                className="bg-gradient-to-b from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white font-black border-2 sm:border-4 border-red-900 shadow-lg py-4 sm:py-6 text-xs sm:text-base h-auto"
              >
                БЕТ +
              </Button>

              <Button
                onClick={() => setCurrentLine(currentLine === 9 ? 1 : currentLine + 1)}
                disabled={isSpinning}
                className="bg-gradient-to-b from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700 text-white font-black border-2 sm:border-4 border-blue-900 shadow-lg py-4 sm:py-6 text-xs sm:text-base h-auto"
              >
                ЛИНИЯ
              </Button>
            </div>

            <Button
              onClick={spin}
              disabled={isSpinning || (!isDemoMode && totalBet > balance) || (isDemoMode && demoSpinsLeft === 0)}
              className="w-full bg-gradient-to-b from-green-600 to-green-800 hover:from-green-500 hover:to-green-700 text-white font-black text-lg sm:text-2xl border-2 sm:border-4 border-green-900 shadow-lg py-5 sm:py-7 animate-pulse h-auto"
            >
              {isSpinning ? 'КРУТИМ...' : 'СТАРТ'}
            </Button>
          </div>

          {/* Режим */}
          <div className="bg-slate-800 rounded-lg p-2 sm:p-3 border border-slate-600 mb-3 sm:mb-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <button
                onClick={toggleMode}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded font-bold text-xs sm:text-base ${
                  isDemoMode ? 'bg-blue-600 text-white' : 'bg-green-600 text-white'
                }`}
              >
                {isDemoMode ? `ДЕМО (${demoSpinsLeft})` : 'РЕАЛЬНЫЙ'}
              </button>
              {isDemoMode && demoSpinsLeft === 0 && (
                <button 
                  onClick={() => setDemoSpinsLeft(10)}
                  className="px-2 sm:px-3 py-1 bg-blue-500 text-white rounded text-xs sm:text-sm font-bold"
                >
                  Обновить
                </button>
              )}
            </div>
          </div>

          {/* Таблица */}
          <div className="bg-slate-900 rounded-lg p-2 sm:p-3 border border-yellow-600">
            <div className="text-yellow-400 font-black text-xs sm:text-sm mb-1.5 sm:mb-2">ВЫПЛАТЫ:</div>
            <div className="grid grid-cols-2 gap-0.5 sm:gap-1 text-[10px] sm:text-sm text-white">
              <div>🐵×5=×200</div>
              <div>💎×5=×100</div>
              <div>🍌×5=×80</div>
              <div>🥥×5=×50</div>
              <div className="col-span-2 text-center text-green-400 font-bold text-xs sm:text-sm mt-1">🐵×3=БОНУС</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
