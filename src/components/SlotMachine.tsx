import { useState } from 'react';
import { useToast } from './ui/use-toast';
import BonusGame from './BonusGame';

interface SlotMachineProps {
  balance: number;
  onGameResult: (won: boolean, amount: number) => void;
}

const MONKEY = '🐵';
const BANANA = '🍌';
const BUTTERFLY = '🦋';
const MASK = '🗿';
const PARROT = '🦜';
const SNAKE = '🐍';

const SYMBOLS = [MONKEY, BANANA, BUTTERFLY, MASK, PARROT, SNAKE];
const BONUS_SYMBOL = MONKEY;

export default function SlotMachine({ balance, onGameResult }: SlotMachineProps) {
  const [reels, setReels] = useState([
    [MONKEY, BANANA, BUTTERFLY],
    [MASK, PARROT, SNAKE],
    [BANANA, MONKEY, MASK],
    [PARROT, BUTTERFLY, BANANA],
    [SNAKE, MASK, MONKEY]
  ]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [activeLines, setActiveLines] = useState(9);
  const [betPerLine, setBetPerLine] = useState(1);
  const [isDemoMode, setIsDemoMode] = useState(true);
  const [demoSpinsLeft, setDemoSpinsLeft] = useState(10);
  const [showBonusGame, setShowBonusGame] = useState(false);
  const [bonusBet, setBonusBet] = useState(0);
  const [lastWin, setLastWin] = useState(0);
  const [totalSpins, setTotalSpins] = useState(0);
  const { toast } = useToast();

  const getRandomSymbol = () => {
    const random = Math.random();
    if (random < 0.30) return PARROT;
    if (random < 0.55) return SNAKE;
    if (random < 0.75) return BANANA;
    if (random < 0.88) return BUTTERFLY;
    if (random < 0.96) return MASK;
    return MONKEY;
  };

  const PAYLINES = [
    [[1,1], [1,1], [1,1], [1,1], [1,1]],
    [[0,0], [0,0], [0,0], [0,0], [0,0]],
    [[2,2], [2,2], [2,2], [2,2], [2,2]],
    [[0,0], [1,1], [2,2], [1,1], [0,0]],
    [[2,2], [1,1], [0,0], [1,1], [2,2]],
    [[0,0], [0,0], [1,1], [2,2], [2,2]],
    [[2,2], [2,2], [1,1], [0,0], [0,0]],
    [[1,1], [0,0], [1,1], [2,2], [1,1]],
    [[1,1], [2,2], [1,1], [0,0], [1,1]]
  ];

  const calculateWin = (reelMatrix: string[][], totalBet: number): { amount: number; hasBonus: boolean } => {
    let totalWin = 0;
    let hasBonus = false;

    if (Math.random() < 0.15) {
      return { amount: 0, hasBonus: false };
    }

    for (let lineIdx = 0; lineIdx < activeLines; lineIdx++) {
      const line = PAYLINES[lineIdx];
      const lineSymbols = line.map((pos, reelIdx) => reelMatrix[reelIdx][pos[0]]);
      
      let matchCount = 1;
      for (let i = 1; i < 5; i++) {
        if (lineSymbols[i] === lineSymbols[0]) matchCount++;
        else break;
      }

      if (matchCount >= 3) {
        const symbol = lineSymbols[0];
        if (symbol === MONKEY) {
          if (matchCount === 5) totalWin += betPerLine * 500;
          else if (matchCount === 4) totalWin += betPerLine * 100;
          else totalWin += betPerLine * 25;
          if (matchCount >= 3) hasBonus = true;
        } else if (symbol === MASK) {
          if (matchCount === 5) totalWin += betPerLine * 150;
          else if (matchCount === 4) totalWin += betPerLine * 40;
          else totalWin += betPerLine * 10;
        } else if (symbol === BANANA) {
          if (matchCount === 5) totalWin += betPerLine * 75;
          else if (matchCount === 4) totalWin += betPerLine * 25;
          else totalWin += betPerLine * 8;
        } else if (symbol === BUTTERFLY) {
          if (matchCount === 5) totalWin += betPerLine * 50;
          else if (matchCount === 4) totalWin += betPerLine * 15;
          else totalWin += betPerLine * 5;
        } else {
          if (matchCount === 5) totalWin += betPerLine * 30;
          else if (matchCount === 4) totalWin += betPerLine * 10;
          else totalWin += betPerLine * 3;
        }
      }
    }

    if (totalSpins > 0 && totalSpins % 10 === 0 && Math.random() > 0.5) {
      totalWin = Math.max(totalWin, betPerLine * activeLines * 2);
    }

    return { amount: Math.floor(totalWin), hasBonus };
  };

  const spin = () => {
    if (isDemoMode && demoSpinsLeft === 0) {
      toast({ 
        title: "Демо закончилось", 
        description: "Переключитесь на реальный режим",
        variant: "destructive" 
      });
      return;
    }

    const totalBet = betPerLine * activeLines;
    if (!isDemoMode && totalBet > balance) {
      toast({ title: "Недостаточно средств", variant: "destructive" });
      return;
    }

    setIsSpinning(true);
    setTotalSpins(prev => prev + 1);
    setLastWin(0);

    const spinInterval = setInterval(() => {
      setReels([
        [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()],
        [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()],
        [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()],
        [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()],
        [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()]
      ]);
    }, 80);

    setTimeout(() => {
      clearInterval(spinInterval);
      
      const finalReels = [
        [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()],
        [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()],
        [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()],
        [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()],
        [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()]
      ];
      setReels(finalReels);
      
      const { amount: winAmount, hasBonus } = calculateWin(finalReels, totalBet);
      setLastWin(winAmount);
      
      if (isDemoMode) {
        setDemoSpinsLeft(prev => prev - 1);
      }
      
      if (winAmount > 0) {
        if (!isDemoMode) {
          onGameResult(true, winAmount);
        }
        
        if (hasBonus) {
          toast({ title: "БОНУС!", description: `${winAmount} + БОНУСНАЯ ИГРА` });
          setBonusBet(totalBet);
          setTimeout(() => setShowBonusGame(true), 1500);
        }
      } else {
        if (!isDemoMode) {
          onGameResult(false, totalBet);
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
    setLastWin(bonusWin);
  };

  if (showBonusGame) {
    return <BonusGame bet={bonusBet} isDemoMode={isDemoMode} onComplete={handleBonusComplete} />;
  }

  const totalBet = betPerLine * activeLines;
  const lineNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  return (
    <div className="w-full max-w-6xl mx-auto p-2">
      {/* ПОЛНАЯ КОПИЯ ОРИГИНАЛЬНОЙ CRAZY MONKEY */}
      <div className="relative" style={{ 
        background: 'linear-gradient(180deg, #2d5016 0%, #1a3009 50%, #2d5016 100%)',
        borderRadius: '24px',
        border: '16px solid #8B6914',
        boxShadow: '0 20px 60px rgba(0,0,0,0.9), inset 0 0 40px rgba(0,0,0,0.6)',
        padding: '20px'
      }}>
        {/* ВЕРХНЯЯ ПАНЕЛЬ: TOTAL BET | WIN | CREDIT */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div style={{
            background: '#000',
            border: '4px solid #8B6914',
            borderRadius: '12px',
            padding: '10px',
            textAlign: 'center'
          }}>
            <div style={{ color: '#FFD700', fontSize: 'clamp(14px, 3vw, 18px)', fontWeight: 'bold', marginBottom: '5px' }}>TOTAL BET</div>
            <div style={{ color: '#00FF00', fontSize: 'clamp(24px, 5vw, 40px)', fontWeight: '900', fontFamily: 'Impact, monospace' }}>
              {totalBet}
            </div>
          </div>
          
          <div style={{
            background: '#000',
            border: '4px solid #8B6914',
            borderRadius: '12px',
            padding: '10px',
            textAlign: 'center'
          }}>
            <div style={{ color: '#FFD700', fontSize: 'clamp(14px, 3vw, 18px)', fontWeight: 'bold', marginBottom: '5px' }}>WIN</div>
            <div style={{ color: '#FFD700', fontSize: 'clamp(24px, 5vw, 40px)', fontWeight: '900', fontFamily: 'Impact, monospace' }}>
              {lastWin}
            </div>
          </div>
          
          <div style={{
            background: '#000',
            border: '4px solid #8B6914',
            borderRadius: '12px',
            padding: '10px',
            textAlign: 'center'
          }}>
            <div style={{ color: '#FFD700', fontSize: 'clamp(14px, 3vw, 18px)', fontWeight: 'bold', marginBottom: '5px' }}>CREDIT</div>
            <div style={{ color: '#00FF00', fontSize: 'clamp(24px, 5vw, 40px)', fontWeight: '900', fontFamily: 'Impact, monospace' }}>
              {balance}
            </div>
          </div>
        </div>

        {/* БЕТ ПЕР ЛАЙН + ЛОГОТИП */}
        <div className="flex items-center justify-between mb-4">
          <div style={{
            background: 'linear-gradient(180deg, #FFD700 0%, #FFA500 100%)',
            padding: '12px 20px',
            borderRadius: '12px',
            border: '4px solid #8B6914',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: 'clamp(10px, 2vw, 14px)', fontWeight: 'bold', color: '#000' }}>BET PER LINE</div>
            <div style={{ fontSize: 'clamp(18px, 4vw, 32px)', fontWeight: '900', color: '#000' }}>{betPerLine}</div>
          </div>
          
          <div style={{
            background: 'linear-gradient(180deg, #FFD700 0%, #FF8C00 100%)',
            padding: '15px 30px',
            borderRadius: '16px',
            border: '6px solid #8B6914',
            textAlign: 'center',
            boxShadow: '0 8px 20px rgba(0,0,0,0.6)'
          }}>
            <h1 style={{
              fontFamily: 'Impact, Arial Black, sans-serif',
              fontSize: 'clamp(20px, 5vw, 42px)',
              fontWeight: '900',
              color: '#000',
              textShadow: '2px 2px 0 #FFD700',
              letterSpacing: '2px'
            }}>
              CRAZY MONKEY
            </h1>
          </div>
          
          <div style={{
            background: 'linear-gradient(180deg, #FFD700 0%, #FFA500 100%)',
            padding: '12px 20px',
            borderRadius: '12px',
            border: '4px solid #8B6914',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: 'clamp(10px, 2vw, 14px)', fontWeight: 'bold', color: '#000' }}>BET PER LINE</div>
            <div style={{ fontSize: 'clamp(18px, 4vw, 32px)', fontWeight: '900', color: '#000' }}>{betPerLine}</div>
          </div>
        </div>

        {/* ИГРОВОЕ ПОЛЕ С БАРАБАНАМИ 3×5 */}
        <div className="flex items-center gap-2 mb-4">
          {/* ИНДИКАТОРЫ ЛИНИЙ СЛЕВА */}
          <div className="flex flex-col gap-1">
            {lineNumbers.map(num => (
              <div key={`left-${num}`} style={{
                width: 'clamp(25px, 5vw, 40px)',
                height: 'clamp(25px, 5vw, 40px)',
                background: num <= activeLines ? 'linear-gradient(135deg, #FF1493, #FF69B4)' : '#333',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFF',
                fontWeight: '900',
                fontSize: 'clamp(12px, 2.5vw, 18px)',
                border: '3px solid ' + (num <= activeLines ? '#FFD700' : '#666'),
                boxShadow: num <= activeLines ? '0 0 10px #FF1493' : 'none'
              }}>
                {num}
              </div>
            ))}
          </div>

          {/* БАРАБАНЫ 5 КОЛОНОК × 3 РЯДА */}
          <div style={{
            background: 'linear-gradient(180deg, #87CEEB 0%, #4682B4 100%)',
            padding: '8px',
            borderRadius: '12px',
            border: '6px solid #8B6914',
            boxShadow: 'inset 0 4px 15px rgba(0,0,0,0.4)',
            flex: 1
          }}>
            <div className="grid grid-cols-5 gap-1">
              {reels.map((reel, colIdx) => (
                <div key={colIdx} className="flex flex-col gap-1">
                  {reel.map((symbol, rowIdx) => (
                    <div
                      key={`${colIdx}-${rowIdx}`}
                      style={{
                        aspectRatio: '1',
                        background: 'linear-gradient(135deg, #E8F4F8 0%, #B0D4E3 100%)',
                        border: '3px solid #2F4F4F',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.2)'
                      }}
                      className={isSpinning ? 'animate-pulse' : ''}
                    >
                      <span style={{
                        fontSize: 'clamp(30px, 6vw, 60px)',
                        filter: isSpinning ? 'blur(5px)' : 'none',
                        transition: 'filter 0.3s'
                      }}>
                        {symbol}
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* ИНДИКАТОРЫ ЛИНИЙ СПРАВА */}
          <div className="flex flex-col gap-1">
            {lineNumbers.map(num => (
              <div key={`right-${num}`} style={{
                width: 'clamp(25px, 5vw, 40px)',
                height: 'clamp(25px, 5vw, 40px)',
                background: num <= activeLines ? 'linear-gradient(135deg, #FF1493, #FF69B4)' : '#333',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFF',
                fontWeight: '900',
                fontSize: 'clamp(12px, 2.5vw, 18px)',
                border: '3px solid ' + (num <= activeLines ? '#FFD700' : '#666'),
                boxShadow: num <= activeLines ? '0 0 10px #FF1493' : 'none'
              }}>
                {num}
              </div>
            ))}
          </div>
        </div>

          {/* ОБЕЗЬЯНА + КНОПКА TAKE OR RISK */}
          <div className="flex items-center justify-between mb-4">
            <div style={{ fontSize: 'clamp(60px, 12vw, 120px)' }}>🐵</div>
            
            <div style={{
              background: 'linear-gradient(135deg, #2d5016 0%, #1a3009 100%)',
              padding: '15px 30px',
              borderRadius: '16px',
              border: '4px solid #8B6914',
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: 'clamp(16px, 3.5vw, 24px)',
                fontWeight: '900',
                color: '#FFD700',
                textShadow: '2px 2px 4px #000'
              }}>
                TAKE OR RISK ...
              </div>
            </div>
            
            <div style={{ fontSize: 'clamp(60px, 12vw, 120px)' }}>🍌</div>
          </div>

          {/* КНОПКИ УПРАВЛЕНИЯ */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <button
              onClick={() => setBetPerLine(Math.max(1, betPerLine - 1))}
              disabled={isSpinning}
              style={{
                background: 'linear-gradient(180deg, #FF6347 0%, #DC143C 100%)',
                border: '4px solid #8B0000',
                borderRadius: '12px',
                padding: '15px',
                color: '#FFF',
                fontWeight: '900',
                fontSize: 'clamp(14px, 3vw, 20px)',
                boxShadow: '0 6px 0 #660000',
                cursor: isSpinning ? 'not-allowed' : 'pointer',
                opacity: isSpinning ? 0.5 : 1
              }}
            >
              BET -
            </button>

            <button
              onClick={() => setBetPerLine(Math.min(10, betPerLine + 1))}
              disabled={isSpinning}
              style={{
                background: 'linear-gradient(180deg, #FF6347 0%, #DC143C 100%)',
                border: '4px solid #8B0000',
                borderRadius: '12px',
                padding: '15px',
                color: '#FFF',
                fontWeight: '900',
                fontSize: 'clamp(14px, 3vw, 20px)',
                boxShadow: '0 6px 0 #660000',
                cursor: isSpinning ? 'not-allowed' : 'pointer',
                opacity: isSpinning ? 0.5 : 1
              }}
            >
              BET +
            </button>

            <button
              onClick={() => setActiveLines(activeLines === 9 ? 1 : activeLines + 1)}
              disabled={isSpinning}
              style={{
                background: 'linear-gradient(180deg, #4169E1 0%, #0000CD 100%)',
                border: '4px solid #00008B',
                borderRadius: '12px',
                padding: '15px',
                color: '#FFF',
                fontWeight: '900',
                fontSize: 'clamp(14px, 3vw, 20px)',
                boxShadow: '0 6px 0 #000066',
                cursor: isSpinning ? 'not-allowed' : 'pointer',
                opacity: isSpinning ? 0.5 : 1
              }}
            >
              LINES {activeLines}
            </button>

            <button
              onClick={spin}
              disabled={isSpinning || (!isDemoMode && totalBet > balance) || (isDemoMode && demoSpinsLeft === 0)}
              style={{
                background: isSpinning 
                  ? 'linear-gradient(180deg, #666 0%, #444 100%)'
                  : 'linear-gradient(180deg, #32CD32 0%, #228B22 100%)',
                border: '4px solid ' + (isSpinning ? '#333' : '#006400'),
                borderRadius: '12px',
                padding: '20px',
                color: '#FFF',
                fontWeight: '900',
                fontSize: 'clamp(18px, 4vw, 28px)',
                boxShadow: isSpinning ? 'none' : '0 8px 0 #004400',
                cursor: (isSpinning || (!isDemoMode && totalBet > balance) || (isDemoMode && demoSpinsLeft === 0)) ? 'not-allowed' : 'pointer',
                textShadow: '3px 3px 6px #000',
                gridColumn: 'span 4'
              }}
            >
              {isSpinning ? '🎰 SPINNING... 🎰' : '▶ START ◀'}
            </button>
          </div>

          {/* ДЕМО РЕЖИМ (компактно) */}
          {isDemoMode && (
            <div style={{
              background: 'linear-gradient(135deg, #1E90FF 0%, #0000CD 100%)',
              padding: '8px 16px',
              borderRadius: '10px',
              border: '3px solid #FFD700',
              textAlign: 'center',
              marginBottom: '10px'
            }}>
              <button
                onClick={() => {
                  if (demoSpinsLeft === 0) setDemoSpinsLeft(10);
                  setIsDemoMode(false);
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#FFF',
                  fontWeight: '900',
                  fontSize: 'clamp(12px, 2.5vw, 16px)',
                  cursor: 'pointer'
                }}
              >
                🎮 DEMO MODE ({demoSpinsLeft} spins left) • Нажми для реального режима
              </button>
            </div>
          )}

          {!isDemoMode && (
            <div style={{
              background: 'linear-gradient(135deg, #32CD32 0%, #228B22 100%)',
              padding: '8px 16px',
              borderRadius: '10px',
              border: '3px solid #FFD700',
              textAlign: 'center',
              marginBottom: '10px'
            }}>
              <button
                onClick={() => {
                  setDemoSpinsLeft(10);
                  setIsDemoMode(true);
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#FFF',
                  fontWeight: '900',
                  fontSize: 'clamp(12px, 2.5vw, 16px)',
                  cursor: 'pointer'
                }}
              >
                💰 REAL MONEY MODE • Нажми для демо
              </button>
            </div>
          )}

          {/* ТАБЛИЦА ВЫПЛАТ */}
          <div style={{
            background: 'rgba(0,0,0,0.6)',
            padding: '10px',
            borderRadius: '10px',
            border: '2px solid #8B6914',
            color: '#FFD700',
            fontSize: 'clamp(9px, 2vw, 12px)',
            textAlign: 'center',
            fontWeight: 'bold'
          }}>
            🐵×5=×500 | 🗿×5=×150 | 🍌×5=×75 | 🦋×5=×50<br/>
            <span style={{ color: '#00FF00' }}>🐵×3+ = БОНУСНАЯ ИГРА!</span>
          </div>
      </div>
    </div>
  );
}