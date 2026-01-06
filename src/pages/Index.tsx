import { useState, useEffect } from 'react';
import SlotMachine from '../components/SlotMachine';
import Statistics from '../components/Statistics';
import AgeVerification from '../components/AgeVerification';
import PaymentSection from '../components/PaymentSection';

const Index = () => {
  const [isVerified, setIsVerified] = useState(false);
  const [balance, setBalance] = useState(10000);
  const [totalWins, setTotalWins] = useState(0);
  const [totalLosses, setTotalLosses] = useState(0);
  const [gamesPlayed, setGamesPlayed] = useState(0);

  useEffect(() => {
    const verified = localStorage.getItem('ageVerified');
    if (verified === 'true') {
      setIsVerified(true);
    }
  }, []);

  const handleVerification = () => {
    localStorage.setItem('ageVerified', 'true');
    setIsVerified(true);
  };

  const handleGameResult = (won: boolean, amount: number) => {
    setGamesPlayed(prev => prev + 1);
    if (won) {
      setBalance(prev => prev + amount);
      setTotalWins(prev => prev + amount);
    } else {
      setBalance(prev => prev - amount);
      setTotalLosses(prev => prev + amount);
    }
  };

  const handleDeposit = (amount: number) => {
    setBalance(prev => prev + amount);
  };

  const handleWithdraw = (amount: number) => {
    setBalance(prev => prev - amount);
  };

  if (!isVerified) {
    return <AgeVerification onVerify={handleVerification} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-yellow-900 to-orange-900">
      {/* Header */}
      <header className="border-b border-yellow-500/50 bg-green-900/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-4xl animate-bounce">🐵</div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Crazy Monkey
                </h1>
                <p className="text-sm text-yellow-300">Легендарный игровой автомат</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-400">Ваш баланс</div>
              <div className="text-2xl font-bold text-yellow-500">
                {balance.toLocaleString('ru-RU')} ₽
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Slot Machine */}
          <div className="lg:col-span-2 space-y-8">
            <SlotMachine 
              balance={balance}
              onGameResult={handleGameResult}
            />
            
            {/* Payment Section */}
            <PaymentSection 
              balance={balance}
              onDeposit={handleDeposit}
              onWithdraw={handleWithdraw}
            />
          </div>

          {/* Statistics */}
          <div className="lg:col-span-1">
            <Statistics 
              balance={balance}
              totalWins={totalWins}
              totalLosses={totalLosses}
              gamesPlayed={gamesPlayed}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-yellow-500/50 bg-green-900/80 backdrop-blur-sm mt-16 py-8">
        <div className="container mx-auto px-4 text-center text-yellow-200 text-sm">
          <p className="font-bold">🔞 Только для лиц старше 18 лет</p>
          <p className="mt-2">Игра в демо-режиме с виртуальными фишками</p>
          <p className="mt-1 text-yellow-300/70">🐵 Crazy Monkey - Легендарный игровой автомат 🍌</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;