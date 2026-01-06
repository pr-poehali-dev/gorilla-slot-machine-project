import { useState } from 'react';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';

interface AgeVerificationProps {
  onVerify: () => void;
}

export default function AgeVerification({ onVerify }: AgeVerificationProps) {
  const [agreed, setAgreed] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-slate-800 border-2 border-yellow-600 rounded-2xl p-8 max-w-md w-full shadow-2xl animate-scale-in">
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">🦍</div>
          <h1 className="text-3xl font-bold text-yellow-500 mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
            Gorilla Gold
          </h1>
          <p className="text-slate-300">Классическое казино</p>
        </div>

        <div className="bg-red-900/20 border border-red-600/50 rounded-lg p-4 mb-6">
          <p className="text-red-400 text-center font-semibold text-lg mb-2">
            🔞 Возрастное ограничение
          </p>
          <p className="text-slate-300 text-sm text-center">
            Для доступа к игре вы должны подтвердить, что вам исполнилось 18 лет
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-start gap-3 bg-slate-900/50 p-4 rounded-lg">
            <Checkbox 
              id="age-confirm" 
              checked={agreed}
              onCheckedChange={(checked) => setAgreed(checked as boolean)}
              className="mt-1 border-yellow-600 data-[state=checked]:bg-yellow-600"
            />
            <label 
              htmlFor="age-confirm" 
              className="text-slate-300 text-sm cursor-pointer leading-relaxed"
            >
              Я подтверждаю, что мне исполнилось <span className="text-yellow-500 font-bold">18 лет</span>, 
              и я ознакомлен(а) с правилами игры в азартные игры
            </label>
          </div>

          <Button 
            onClick={onVerify}
            disabled={!agreed}
            className="w-full bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-slate-900 font-bold text-lg py-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Войти в казино
          </Button>

          <p className="text-xs text-slate-500 text-center">
            Это демо-версия с виртуальными фишками
          </p>
        </div>
      </div>
    </div>
  );
}
