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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-yellow-600/30 bg-slate-900/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-4xl">🦍</div>
              <div>
                <h1 className="text-3xl font-bold text-yellow-500" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Gorilla Gold
                </h1>
                <p className="text-sm text-slate-400">Классическое казино</p>
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
      <footer className="border-t border-yellow-600/30 bg-slate-900/80 backdrop-blur-sm mt-16 py-8">
        <div className="container mx-auto px-4 text-center text-slate-400 text-sm">
          <p>🔞 Только для лиц старше 18 лет</p>
          <p className="mt-2">Игра в демо-режиме с виртуальными фишками</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;