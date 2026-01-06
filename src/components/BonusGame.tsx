import { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import Icon from './ui/icon';

interface BonusGameProps {
  bet: number;
  isDemoMode: boolean;
  onComplete: (bonusWin: number) => void;
}

const ROPES = 5;
const prizes = [
  { multiplier: 0, emoji: '💥' },
  { multiplier: 2, emoji: '🍌' },
  { multiplier: 5, emoji: '🥥' },
  { multiplier: 10, emoji: '💎' },
  { multiplier: 20, emoji: '🏆' },
];

export default function BonusGame({ bet, isDemoMode, onComplete }: BonusGameProps) {
  const [selectedRopes, setSelectedRopes] = useState<boolean[]>(Array(ROPES).fill(false));
  const [revealedPrizes, setRevealedPrizes] = useState<number[]>(Array(ROPES).fill(-1));
  const [totalWin, setTotalWin] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [attemptsLeft, setAttemptsLeft] = useState(3);

  const handleRopeClick = (index: number) => {
    if (selectedRopes[index] || isComplete || attemptsLeft === 0) return;

    const newSelectedRopes = [...selectedRopes];
    newSelectedRopes[index] = true;
    setSelectedRopes(newSelectedRopes);

    // Random prize selection (weighted towards middle values)
    const random = Math.random();
    let prizeIndex;
    if (random < 0.25) prizeIndex = 0; // 25% chance - empty
    else if (random < 0.50) prizeIndex = 1; // 25% chance - x2
    else if (random < 0.75) prizeIndex = 2; // 25% chance - x5
    else if (random < 0.95) prizeIndex = 3; // 20% chance - x10
    else prizeIndex = 4; // 5% chance - x20

    const newRevealedPrizes = [...revealedPrizes];
    newRevealedPrizes[index] = prizeIndex;
    setRevealedPrizes(newRevealedPrizes);

    const winAmount = bet * prizes[prizeIndex].multiplier;
    setTotalWin(prev => prev + winAmount);

    const newAttemptsLeft = attemptsLeft - 1;
    setAttemptsLeft(newAttemptsLeft);

    if (prizeIndex === 0 || newAttemptsLeft === 0) {
      setTimeout(() => {
        setIsComplete(true);
      }, 1500);
    }
  };

  const handleComplete = () => {
    onComplete(totalWin);
  };

  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-green-900 via-yellow-900 to-orange-900 border-4 border-yellow-600 shadow-2xl p-8">
      {/* Jungle background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(34, 197, 94, 0.3) 10px, rgba(34, 197, 94, 0.3) 20px)',
        }}></div>
      </div>

      <div className="relative">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-7xl mb-4 animate-bounce">🐵</div>
          <h2 className="text-5xl font-black bg-gradient-to-r from-yellow-300 via-orange-400 to-red-500 bg-clip-text text-transparent mb-3 drop-shadow-lg" style={{ fontFamily: 'Playfair Display, serif' }}>
            БОНУСНАЯ ИГРА!
          </h2>
          <p className="text-yellow-200 text-xl font-bold">Обезьяна спряталась на дереве! Дёрни за верёвку!</p>
          <div className="mt-4 inline-block bg-green-800/80 px-6 py-3 rounded-full border-2 border-green-400">
            <p className="text-green-200 font-bold">
              Попыток осталось: <span className="text-yellow-300 text-2xl">{attemptsLeft}</span>
            </p>
          </div>
        </div>

        {/* Tree with Ropes */}
        <div className="relative mb-8">
          <div className="text-center mb-6">
            <div className="text-9xl inline-block animate-pulse">🌴</div>
          </div>

          <div className="grid grid-cols-5 gap-4 max-w-4xl mx-auto">
            {Array(ROPES).map((_, index) => (
              <div key={index} className="flex flex-col items-center">
                {/* Rope */}
                <div className="relative mb-4">
                  <Button
                    onClick={() => handleRopeClick(index)}
                    disabled={selectedRopes[index] || isComplete || attemptsLeft === 0}
                    className={`w-24 h-64 bg-gradient-to-b from-amber-800 to-amber-900 hover:from-amber-700 hover:to-amber-800 border-4 border-amber-600 rounded-lg shadow-xl disabled:opacity-50 transition-all duration-300 ${
                      !selectedRopes[index] && !isComplete && attemptsLeft > 0 ? 'hover:scale-105 cursor-pointer' : ''
                    }`}
                  >
                    <div className="flex flex-col items-center justify-center h-full">
                      {!selectedRopes[index] ? (
                        <>
                          <div className="text-4xl mb-2">🪢</div>
                          <div className="text-yellow-200 font-bold text-sm">Верёвка {index + 1}</div>
                        </>
                      ) : (
                        <div className="animate-bounce">
                          <div className="text-6xl mb-2">{prizes[revealedPrizes[index]].emoji}</div>
                          <div className={`font-black text-2xl ${
                            revealedPrizes[index] === 0 ? 'text-red-400' : 'text-green-300'
                          }`}>
                            {revealedPrizes[index] === 0 ? 'ПУСТО!' : `x${prizes[revealedPrizes[index]].multiplier}`}
                          </div>
                        </div>
                      )}
                    </div>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Win Display */}
        <div className="text-center mb-8">
          <div className="inline-block bg-gradient-to-r from-orange-600 to-red-600 px-10 py-6 rounded-2xl border-4 border-yellow-400 shadow-2xl">
            <div className="text-yellow-200 text-lg font-bold mb-2">
              {isDemoMode ? 'Демо-выигрыш' : 'Ваш выигрыш'}
            </div>
            <div className="text-6xl font-black text-yellow-300 drop-shadow-lg">
              {totalWin.toLocaleString('ru-RU')} ₽
            </div>
          </div>
        </div>

        {/* Complete Button */}
        {isComplete && (
          <div className="text-center animate-scale-in">
            <Button
              onClick={handleComplete}
              className="bg-gradient-to-r from-green-600 via-green-500 to-green-600 hover:from-green-500 hover:via-green-400 hover:to-green-500 text-white font-black text-2xl py-8 px-16 rounded-xl border-4 border-green-300 shadow-[0_0_40px_rgba(34,197,94,0.6)]"
            >
              <span className="flex items-center gap-3">
                <Icon name="Check" size={28} />
                ЗАБРАТЬ ВЫИГРЫШ
                <div className="text-3xl">🍌</div>
              </span>
            </Button>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 p-5 bg-slate-900/60 rounded-xl border-2 border-yellow-500/30">
          <h3 className="text-yellow-300 font-bold mb-3 flex items-center gap-2">
            <Icon name="Info" size={20} />
            Как играть:
          </h3>
          <ul className="text-slate-200 space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-yellow-400">•</span>
              <span>Выберите любую из 5 верёвок, чтобы дёрнуть за неё</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-400">•</span>
              <span>У вас есть 3 попытки найти призы</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-400">•</span>
              <span>💥 Пусто - игра заканчивается</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-400">•</span>
              <span>🍌 x2 | 🥥 x5 | 💎 x10 | 🏆 x20 к ставке</span>
            </li>
          </ul>
        </div>
      </div>
    </Card>
  );
}
