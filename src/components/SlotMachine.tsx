import { useState } from 'react';
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
  const [currentLine, setCurrentLine] = useState(9);
  const [bet, setBet] = useState(1);
  const [isDemoMode, setIsDemoMode] = useState(true);
  const [demoSpinsLeft, setDemoSpinsLeft] = useState(10);
  const [showBonusGame, setShowBonusGame] = useState(false);
  const [bonusBet, setBonusBet] = useState(0);
  const [lastWin, setLastWin] = useState(0);
  const [totalSpins, setTotalSpins] = useState(0);
  const { toast } = useToast();

  const getRandomSymbol = () => {
    const random = Math.random();
    if (random < 0.35) return '🌴';
    if (random < 0.70) return '🦜';
    if (random < 0.85) return '🔔';
    if (random < 0.93) return '🥥';
    if (random < 0.97) return '🍌';
    if (random < 0.995) return '💎';
    return '🐵';
  };

  const calculateWin = (results: string[], totalBet: number): { amount: number; hasBonus: boolean } => {
    let totalWin = 0;
    let hasBonus = false;

    if (Math.random() < 0.15) {
      return { amount: 0, hasBonus: false };
    }

    const monkeyCount = results.filter(r => r === BONUS_SYMBOL).length;
    if (monkeyCount >= 3) {
      hasBonus = true;
      totalWin = totalBet * 3;
    }

    if (results.every(r => r === results[0])) {
      if (results[0] === '🐵') return { amount: totalBet * 200, hasBonus };
      if (results[0] === '💎') return { amount: totalBet * 100, hasBonus };
      if (results[0] === '🍌') return { amount: totalBet * 80, hasBonus };
      if (results[0] === '🥥') return { amount: totalBet * 50, hasBonus };
      return { amount: totalBet * 30, hasBonus };
    }

    const symbols4 = results.filter((s, i, arr) => arr.filter(x => x === s).length >= 4);
    if (symbols4.length >= 4) {
      const symbol = symbols4[0];
      if (symbol === '🐵') totalWin += totalBet * 40;
      else if (symbol === '💎') totalWin += totalBet * 20;
      else if (symbol === '🍌') totalWin += totalBet * 15;
      else if (symbol === '🥥') totalWin += totalBet * 10;
      else totalWin += totalBet * 5;
    }

    const symbols3 = results.filter((s, i, arr) => arr.filter(x => x === s).length >= 3);
    if (symbols3.length >= 3 && totalWin === 0) {
      const symbol = symbols3[0];
      if (symbol === '🐵') totalWin += totalBet * 10;
      else if (symbol === '💎') totalWin += totalBet * 6;
      else if (symbol === '🍌') totalWin += totalBet * 5;
      else if (symbol === '🥥') totalWin += totalBet * 3;
      else totalWin += totalBet * 2;
    }

    if (totalSpins > 0 && totalSpins % 10 === 0 && Math.random() > 0.5) {
      totalWin = Math.max(totalWin, totalBet * 3);
    }

    return { amount: Math.floor(totalWin), hasBonus };
  };

  const spin = () => {
    if (isDemoMode && demoSpinsLeft === 0) {
      toast({ title: "Демо закончилось", variant: "destructive" });
      return;
    }

    const totalBet = bet * currentLine;
    if (!isDemoMode && totalBet > balance) {
      toast({ title: "Недостаточно средств", variant: "destructive" });
      return;
    }

    setIsSpinning(true);
    setTotalSpins(prev => prev + 1);
    setLastWin(0);

    const spinInterval = setInterval(() => {
      setReels([getRandomSymbol(), getRandomSymbol(), getRandomSymbol(), getRandomSymbol(), getRandomSymbol()]);
    }, 80);

    setTimeout(() => {
      clearInterval(spinInterval);
      
      const finalReels = [getRandomSymbol(), getRandomSymbol(), getRandomSymbol(), getRandomSymbol(), getRandomSymbol()];
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
    }, 2000);
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

  const totalBet = bet * currentLine;

  return (
    <div className="w-full max-w-5xl mx-auto p-2">
      {/* ТОЧНАЯ КОПИЯ CRAZY MONKEY */}
      <div className="relative" style={{ 
        background: 'linear-gradient(180deg, #8B4513 0%, #654321 50%, #8B4513 100%)',
        borderRadius: '20px',
        border: '12px solid #DAA520',
        boxShadow: '0 20px 60px rgba(0,0,0,0.8), inset 0 0 30px rgba(0,0,0,0.5)'
      }}>
        
        {/* ВЕРХНЯЯ ДЕКОРАТИВНАЯ ПАНЕЛЬ */}
        <div style={{
          background: 'linear-gradient(180deg, #B8860B 0%, #8B6914 100%)',
          padding: '10px',
          borderRadius: '8px 8px 0 0',
          borderBottom: '4px solid #654321'
        }}>
          <div className="flex items-center justify-center gap-2">
            <div style={{ 
              background: 'radial-gradient(circle, #FF6B00 0%, #CC5500 100%)',
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              border: '3px solid #8B4513',
              boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.5)'
            }}></div>
            <div style={{ 
              background: 'radial-gradient(circle, #FFD700 0%, #FFA500 100%)',
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              border: '3px solid #8B4513',
              boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.5)'
            }}></div>
            <div style={{ 
              background: 'radial-gradient(circle, #00FF00 0%, #00AA00 100%)',
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              border: '3px solid #8B4513',
              boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.5)'
            }}></div>
          </div>
        </div>

        {/* ЛОГОТИП */}
        <div style={{
          background: 'linear-gradient(180deg, #8B0000 0%, #660000 100%)',
          padding: '15px',
          textAlign: 'center',
          borderBottom: '6px solid #8B6914',
          position: 'relative'
        }}>
          <div className="flex items-center justify-center gap-3">
            <span style={{ fontSize: '50px' }}>🐵</span>
            <h1 style={{
              fontFamily: 'Impact, Arial Black, sans-serif',
              fontSize: 'clamp(24px, 6vw, 48px)',
              fontWeight: '900',
              color: '#FFD700',
              textShadow: '4px 4px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 0 0 20px #FF6B00',
              letterSpacing: '3px',
              textTransform: 'uppercase'
            }}>
              CRAZY MONKEY
            </h1>
            <span style={{ fontSize: '50px' }}>🍌</span>
          </div>
        </div>

        <div className="p-4">
          {/* ИГРОВОЕ ПОЛЕ С БАРАБАНАМИ */}
          <div style={{
            background: 'linear-gradient(180deg, #001a33 0%, #000d1a 100%)',
            padding: '15px',
            borderRadius: '15px',
            border: '6px solid #003366',
            boxShadow: 'inset 0 4px 20px rgba(0,0,0,0.9)',
            marginBottom: '15px',
            position: 'relative'
          }}>
            {/* ИНДИКАТОР ЛИНИЙ СЛЕВА */}
            <div style={{
              position: 'absolute',
              left: '-8px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'linear-gradient(180deg, #FFD700 0%, #FFA500 100%)',
              padding: '8px 6px',
              borderRadius: '8px',
              border: '3px solid #8B6914',
              fontWeight: '900',
              fontSize: '20px',
              color: '#000',
              boxShadow: '0 4px 10px rgba(0,0,0,0.8)'
            }}>
              {currentLine}
            </div>

            {/* БАРАБАНЫ */}
            <div className="grid grid-cols-5 gap-2">
              {reels.map((symbol, index) => (
                <div
                  key={index}
                  style={{
                    aspectRatio: '1',
                    background: 'linear-gradient(180deg, #f0f0f0 0%, #d0d0d0 100%)',
                    border: '5px solid #a0a0a0',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: 'inset 0 4px 10px rgba(0,0,0,0.3), 0 4px 10px rgba(255,255,255,0.2)',
                    position: 'relative'
                  }}
                  className={isSpinning ? 'animate-bounce' : ''}
                >
                  <span style={{
                    fontSize: 'clamp(40px, 8vw, 80px)',
                    filter: isSpinning ? 'blur(8px)' : 'none',
                    transition: 'filter 0.3s'
                  }}>
                    {symbol}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ПАНЕЛЬ УПРАВЛЕНИЯ - ОРИГИНАЛ */}
          <div style={{
            background: 'linear-gradient(180deg, #4a4a4a 0%, #2a2a2a 100%)',
            padding: '15px',
            borderRadius: '12px',
            border: '4px solid #1a1a1a',
            marginBottom: '15px'
          }}>
            {/* ДИСПЛЕИ */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-3">
              <div style={{
                background: '#000',
                border: '3px solid #8B0000',
                borderRadius: '8px',
                padding: '8px',
                textAlign: 'center'
              }}>
                <div style={{ color: '#8B0000', fontSize: '10px', fontWeight: 'bold' }}>CREDIT</div>
                <div style={{ color: '#FFD700', fontSize: 'clamp(16px, 4vw, 24px)', fontWeight: '900', fontFamily: 'Digital, monospace' }}>
                  {balance}
                </div>
              </div>

              <div style={{
                background: '#000',
                border: '3px solid #8B0000',
                borderRadius: '8px',
                padding: '8px',
                textAlign: 'center'
              }}>
                <div style={{ color: '#8B0000', fontSize: '10px', fontWeight: 'bold' }}>BET</div>
                <div style={{ color: '#FFD700', fontSize: 'clamp(16px, 4vw, 24px)', fontWeight: '900', fontFamily: 'Digital, monospace' }}>
                  {bet}
                </div>
              </div>

              <div style={{
                background: '#000',
                border: '3px solid #8B0000',
                borderRadius: '8px',
                padding: '8px',
                textAlign: 'center'
              }}>
                <div style={{ color: '#8B0000', fontSize: '10px', fontWeight: 'bold' }}>LINES</div>
                <div style={{ color: '#FFD700', fontSize: 'clamp(16px, 4vw, 24px)', fontWeight: '900', fontFamily: 'Digital, monospace' }}>
                  {currentLine}
                </div>
              </div>

              <div style={{
                background: '#000',
                border: '3px solid #8B0000',
                borderRadius: '8px',
                padding: '8px',
                textAlign: 'center'
              }}>
                <div style={{ color: '#8B0000', fontSize: '10px', fontWeight: 'bold' }}>WIN</div>
                <div style={{ color: '#00FF00', fontSize: 'clamp(16px, 4vw, 24px)', fontWeight: '900', fontFamily: 'Digital, monospace' }}>
                  {lastWin}
                </div>
              </div>

              <div style={{
                background: '#000',
                border: '3px solid #8B0000',
                borderRadius: '8px',
                padding: '8px',
                textAlign: 'center'
              }}>
                <div style={{ color: '#8B0000', fontSize: '10px', fontWeight: 'bold' }}>TOTAL BET</div>
                <div style={{ color: '#FFD700', fontSize: 'clamp(16px, 4vw, 24px)', fontWeight: '900', fontFamily: 'Digital, monospace' }}>
                  {totalBet}
                </div>
              </div>
            </div>

            {/* КНОПКИ УПРАВЛЕНИЯ */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                onClick={() => setBet(Math.max(1, bet - 1))}
                disabled={isSpinning}
                style={{
                  background: 'linear-gradient(180deg, #CC0000 0%, #880000 100%)',
                  border: '4px solid #660000',
                  borderRadius: '10px',
                  padding: '15px',
                  color: '#FFF',
                  fontWeight: '900',
                  fontSize: 'clamp(12px, 3vw, 16px)',
                  boxShadow: '0 6px 0 #440000, 0 8px 15px rgba(0,0,0,0.5)',
                  cursor: isSpinning ? 'not-allowed' : 'pointer',
                  opacity: isSpinning ? 0.5 : 1,
                  textShadow: '2px 2px 4px #000',
                  transition: 'all 0.1s'
                }}
                onMouseDown={(e) => !isSpinning && (e.currentTarget.style.transform = 'translateY(4px)')}
                onMouseUp={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
              >
                BET -
              </button>

              <button
                onClick={() => setBet(Math.min(10, bet + 1))}
                disabled={isSpinning}
                style={{
                  background: 'linear-gradient(180deg, #CC0000 0%, #880000 100%)',
                  border: '4px solid #660000',
                  borderRadius: '10px',
                  padding: '15px',
                  color: '#FFF',
                  fontWeight: '900',
                  fontSize: 'clamp(12px, 3vw, 16px)',
                  boxShadow: '0 6px 0 #440000, 0 8px 15px rgba(0,0,0,0.5)',
                  cursor: isSpinning ? 'not-allowed' : 'pointer',
                  opacity: isSpinning ? 0.5 : 1,
                  textShadow: '2px 2px 4px #000'
                }}
                onMouseDown={(e) => !isSpinning && (e.currentTarget.style.transform = 'translateY(4px)')}
                onMouseUp={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
              >
                BET +
              </button>

              <button
                onClick={() => setCurrentLine(currentLine === 9 ? 1 : currentLine + 1)}
                disabled={isSpinning}
                style={{
                  background: 'linear-gradient(180deg, #0066CC 0%, #004488 100%)',
                  border: '4px solid #003366',
                  borderRadius: '10px',
                  padding: '15px',
                  color: '#FFF',
                  fontWeight: '900',
                  fontSize: 'clamp(12px, 3vw, 16px)',
                  boxShadow: '0 6px 0 #002244, 0 8px 15px rgba(0,0,0,0.5)',
                  cursor: isSpinning ? 'not-allowed' : 'pointer',
                  opacity: isSpinning ? 0.5 : 1,
                  textShadow: '2px 2px 4px #000'
                }}
                onMouseDown={(e) => !isSpinning && (e.currentTarget.style.transform = 'translateY(4px)')}
                onMouseUp={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
              >
                LINES
              </button>

              <button
                onClick={spin}
                disabled={isSpinning || (!isDemoMode && totalBet > balance) || (isDemoMode && demoSpinsLeft === 0)}
                style={{
                  background: isSpinning 
                    ? 'linear-gradient(180deg, #666 0%, #444 100%)'
                    : 'linear-gradient(180deg, #00CC00 0%, #008800 100%)',
                  border: '4px solid ' + (isSpinning ? '#333' : '#006600'),
                  borderRadius: '10px',
                  padding: '15px',
                  color: '#FFF',
                  fontWeight: '900',
                  fontSize: 'clamp(16px, 4vw, 24px)',
                  boxShadow: isSpinning ? 'none' : '0 6px 0 #004400, 0 8px 15px rgba(0,0,0,0.5)',
                  cursor: (isSpinning || (!isDemoMode && totalBet > balance) || (isDemoMode && demoSpinsLeft === 0)) ? 'not-allowed' : 'pointer',
                  textShadow: '3px 3px 6px #000',
                  gridColumn: 'span 4'
                }}
                onMouseDown={(e) => !isSpinning && (e.currentTarget.style.transform = 'translateY(4px)')}
                onMouseUp={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
              >
                {isSpinning ? '⚡ SPINNING... ⚡' : '▶ START ◀'}
              </button>
            </div>
          </div>

          {/* РЕЖИМ + ИНФО */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div style={{
              background: '#1a1a1a',
              padding: '10px',
              borderRadius: '8px',
              border: '2px solid #444'
            }}>
              <button
                onClick={() => {
                  if (isDemoMode && demoSpinsLeft === 0) setDemoSpinsLeft(10);
                  setIsDemoMode(!isDemoMode);
                }}
                style={{
                  width: '100%',
                  background: isDemoMode ? 'linear-gradient(180deg, #0088FF 0%, #0066CC 100%)' : 'linear-gradient(180deg, #00CC00 0%, #008800 100%)',
                  border: '3px solid ' + (isDemoMode ? '#0055AA' : '#006600'),
                  borderRadius: '8px',
                  padding: '12px',
                  color: '#FFF',
                  fontWeight: '900',
                  fontSize: 'clamp(12px, 3vw, 16px)',
                  boxShadow: '0 4px 0 ' + (isDemoMode ? '#003366' : '#004400')
                }}
              >
                {isDemoMode ? `🎮 DEMO (${demoSpinsLeft} spins)` : '💰 REAL MODE'}
              </button>
            </div>

            <div style={{
              background: '#1a1a1a',
              padding: '10px',
              borderRadius: '8px',
              border: '2px solid #8B6914',
              color: '#FFD700',
              fontSize: 'clamp(10px, 2.5vw, 14px)',
              textAlign: 'center',
              fontWeight: 'bold'
            }}>
              🐵×5=×200 | 💎×5=×100 | 🍌×5=×80<br/>
              <span style={{ color: '#00FF00' }}>🐵×3 = BONUS GAME!</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
