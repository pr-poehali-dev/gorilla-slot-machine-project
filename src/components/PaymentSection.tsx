import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useToast } from './ui/use-toast';
import Icon from './ui/icon';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface PaymentSectionProps {
  balance: number;
  onDeposit: (amount: number) => void;
  onWithdraw: (amount: number) => void;
}

export default function PaymentSection({ balance, onDeposit, onWithdraw }: PaymentSectionProps) {
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    return formatted.slice(0, 19); // 16 digits + 3 spaces
  };

  const handleDeposit = async () => {
    const amount = parseInt(depositAmount);
    
    if (!amount || amount < 100) {
      toast({
        title: "Ошибка пополнения",
        description: "Минимальная сумма пополнения 100 ₽",
        variant: "destructive"
      });
      return;
    }

    if (!cardNumber || cardNumber.replace(/\s/g, '').length !== 16) {
      toast({
        title: "Ошибка",
        description: "Введите корректный номер карты",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    
    // Имитация обработки платежа
    setTimeout(() => {
      onDeposit(amount);
      setDepositAmount('');
      setCardNumber('');
      setIsProcessing(false);
      
      toast({
        title: "✅ Пополнение успешно!",
        description: `На ваш баланс зачислено ${amount.toLocaleString('ru-RU')} ₽`,
      });
    }, 2000);
  };

  const handleWithdraw = async () => {
    const amount = parseInt(withdrawAmount);
    
    if (!amount || amount < 100) {
      toast({
        title: "Ошибка вывода",
        description: "Минимальная сумма вывода 100 ₽",
        variant: "destructive"
      });
      return;
    }

    if (amount > balance) {
      toast({
        title: "Недостаточно средств",
        description: "На балансе недостаточно средств для вывода",
        variant: "destructive"
      });
      return;
    }

    if (!cardNumber || cardNumber.replace(/\s/g, '').length !== 16) {
      toast({
        title: "Ошибка",
        description: "Введите корректный номер карты Озон Банка",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    
    // Имитация обработки вывода
    setTimeout(() => {
      onWithdraw(amount);
      setWithdrawAmount('');
      setCardNumber('');
      setIsProcessing(false);
      
      toast({
        title: "✅ Заявка на вывод принята!",
        description: `${amount.toLocaleString('ru-RU')} ₽ будет переведено на карту в течение 24 часов`,
      });
    }, 2000);
  };

  const quickAmounts = [500, 1000, 2500, 5000, 10000];

  return (
    <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-yellow-600 p-6 shadow-2xl">
      <h2 className="text-2xl font-bold text-yellow-500 mb-6 flex items-center gap-2" style={{ fontFamily: 'Playfair Display, serif' }}>
        <Icon name="CreditCard" size={24} />
        Пополнение и вывод
      </h2>

      <Tabs defaultValue="deposit" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-slate-900/50 mb-6">
          <TabsTrigger value="deposit" className="data-[state=active]:bg-green-600/20 data-[state=active]:text-green-500">
            <Icon name="ArrowDownToLine" size={18} className="mr-2" />
            Пополнить
          </TabsTrigger>
          <TabsTrigger value="withdraw" className="data-[state=active]:bg-blue-600/20 data-[state=active]:text-blue-500">
            <Icon name="ArrowUpFromLine" size={18} className="mr-2" />
            Вывести
          </TabsTrigger>
        </TabsList>

        {/* Deposit Tab */}
        <TabsContent value="deposit" className="space-y-4">
          <div className="bg-slate-900/50 p-4 rounded-lg border border-green-600/30">
            <div className="flex items-center gap-2 text-green-400 mb-2">
              <Icon name="Info" size={16} />
              <span className="text-sm font-semibold">Мгновенное зачисление</span>
            </div>
            <p className="text-xs text-slate-400">
              Средства поступают на баланс моментально после подтверждения платежа
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="deposit-amount" className="text-slate-300">
                Сумма пополнения (₽)
              </Label>
              <Input
                id="deposit-amount"
                type="number"
                placeholder="1000"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="bg-slate-900 border-yellow-600/30 text-white mt-2"
                disabled={isProcessing}
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              {quickAmounts.map((amount) => (
                <Button
                  key={amount}
                  onClick={() => setDepositAmount(amount.toString())}
                  variant="outline"
                  size="sm"
                  className="border-green-600/50 hover:bg-green-600/20 text-green-500"
                  disabled={isProcessing}
                >
                  {amount.toLocaleString('ru-RU')}
                </Button>
              ))}
            </div>

            <div>
              <Label htmlFor="deposit-card" className="text-slate-300">
                Номер карты Озон Банка
              </Label>
              <Input
                id="deposit-card"
                type="text"
                placeholder="0000 0000 0000 0000"
                value={cardNumber}
                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                className="bg-slate-900 border-yellow-600/30 text-white mt-2 font-mono"
                maxLength={19}
                disabled={isProcessing}
              />
              <p className="text-xs text-slate-500 mt-1">
                💳 Принимаются карты Озон Банка
              </p>
            </div>

            <Button
              onClick={handleDeposit}
              disabled={isProcessing}
              className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-bold py-6"
            >
              {isProcessing ? (
                <span className="flex items-center gap-2">
                  <Icon name="Loader2" size={20} className="animate-spin" />
                  Обработка...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Icon name="CreditCard" size={20} />
                  Пополнить баланс
                </span>
              )}
            </Button>
          </div>
        </TabsContent>

        {/* Withdraw Tab */}
        <TabsContent value="withdraw" className="space-y-4">
          <div className="bg-slate-900/50 p-4 rounded-lg border border-blue-600/30">
            <div className="flex items-center gap-2 text-blue-400 mb-2">
              <Icon name="Clock" size={16} />
              <span className="text-sm font-semibold">Вывод в течение 24 часов</span>
            </div>
            <p className="text-xs text-slate-400">
              Средства поступят на карту Озон Банка в течение одного рабочего дня
            </p>
          </div>

          <div className="bg-yellow-900/20 p-4 rounded-lg border border-yellow-600/30">
            <div className="flex items-center gap-2 text-yellow-400 mb-1">
              <Icon name="Wallet" size={16} />
              <span className="text-sm font-semibold">Доступно для вывода</span>
            </div>
            <p className="text-2xl font-bold text-yellow-500">
              {balance.toLocaleString('ru-RU')} ₽
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="withdraw-amount" className="text-slate-300">
                Сумма вывода (₽)
              </Label>
              <Input
                id="withdraw-amount"
                type="number"
                placeholder="1000"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                className="bg-slate-900 border-yellow-600/30 text-white mt-2"
                disabled={isProcessing}
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              {quickAmounts.filter(amt => amt <= balance).map((amount) => (
                <Button
                  key={amount}
                  onClick={() => setWithdrawAmount(amount.toString())}
                  variant="outline"
                  size="sm"
                  className="border-blue-600/50 hover:bg-blue-600/20 text-blue-500"
                  disabled={isProcessing}
                >
                  {amount.toLocaleString('ru-RU')}
                </Button>
              ))}
            </div>

            <div>
              <Label htmlFor="withdraw-card" className="text-slate-300">
                Номер карты Озон Банка для вывода
              </Label>
              <Input
                id="withdraw-card"
                type="text"
                placeholder="0000 0000 0000 0000"
                value={cardNumber}
                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                className="bg-slate-900 border-yellow-600/30 text-white mt-2 font-mono"
                maxLength={19}
                disabled={isProcessing}
              />
              <p className="text-xs text-slate-500 mt-1">
                💳 Вывод только на карты Озон Банка
              </p>
            </div>

            <Button
              onClick={handleWithdraw}
              disabled={isProcessing}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold py-6"
            >
              {isProcessing ? (
                <span className="flex items-center gap-2">
                  <Icon name="Loader2" size={20} className="animate-spin" />
                  Обработка...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Icon name="Banknote" size={20} />
                  Вывести средства
                </span>
              )}
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      <div className="mt-6 p-3 bg-slate-900/50 rounded-lg border border-slate-700">
        <p className="text-xs text-slate-400 text-center">
          🔒 Все платежи защищены SSL-шифрованием
        </p>
      </div>
    </Card>
  );
}
