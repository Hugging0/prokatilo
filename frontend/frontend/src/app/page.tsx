'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, Home, ShoppingBag, User, Drill, Bike, 
  ArrowLeft, Clock, MapPin, CheckCircle2, ChevronRight, 
  Info, CreditCard, Star, Package, MessageCircle, Zap, X,
  Phone, Send, Calendar as CalendarIcon, Wallet, Bell,
  Timer, Sparkles, Loader2
} from 'lucide-react';

// --- НАСТРОЙКИ GEMINI API ---
const apiKey = ""; // Ключ предоставляется средой выполнения

async function callGemini(userQuery, systemPrompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
  
  let delay = 1000;
  for (let i = 0; i < 5; i++) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: userQuery }] }],
          systemInstruction: { parts: [{ text: systemPrompt }] }
        })
      });
      
      if (!response.ok) throw new Error('API request failed');
      
      const result = await response.json();
      return result.candidates?.[0]?.content?.parts?.[0]?.text || "Извините, я не смог получить ответ.";
    } catch (error) {
      if (i === 4) throw error;
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2;
    }
  }
}

// --- ДАННЫЕ ПО УМОЛЧАНИЮ ---
const INITIAL_ITEMS = [
  { 
    id: 1, 
    title: "Перфоратор Makita HR2470", 
    desc: "Профессиональный инструмент. Пробурит бетон, кирпич и камень. В комплекте дам набор буров (6, 8, 10 мм). Чистый, исправный, мощный.",
    price3h: 300, price6h: 500, price24h: 900, 
    icon: Drill, color: "text-rose-500", border: "border-rose-500", bg: "bg-rose-50",
    category: "Инструменты"
  },
  { 
    id: 2, 
    title: "Горный велосипед STELS", 
    desc: "Отличное состояние, смазанная цепь. Подойдет для роста 170-185 см. Могу вынести к подъезду в течение 15 минут.",
    price3h: 400, price6h: 600, price24h: 1200, 
    icon: Bike, color: "text-amber-500", border: "border-amber-500", bg: "bg-amber-50",
    category: "Спорт"
  },
  { 
    id: 3, 
    title: "Палатка Trek Planet 4", 
    desc: "Очень просторная, двухслойная. Идеально для выезда на выходные. Все колышки на месте, собирается легко.",
    price3h: 300, price6h: 450, price24h: 800, 
    icon: ShoppingBag, color: "text-blue-500", border: "border-blue-500", bg: "bg-blue-50",
    category: "Отдых"
  },
];

const CATEGORIES = ['Все вещи', 'Инструменты', 'Спорт', 'Отдых'];

export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('auth'); 
  const [items] = useState(INITIAL_ITEMS);
  const [selectedItem, setSelectedItem] = useState(null);
  
  // Состояния бронирования
  const [selectedTariff, setSelectedTariff] = useState('24h');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime] = useState("12:00");
  const [paymentMethod, setPaymentMethod] = useState('sbp');
  
  // Состояния интерфейса
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Все вещи');
  const [myOrders, setMyOrders] = useState([]);
  const [toast, setToast] = useState(null);

  // Состояния ИИ
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiMessages, setAiMessages] = useState([]);
  const [aiInput, setAiInput] = useState('');

  const showNotification = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const phone = e.target.phone.value;
    if (phone.length < 10) return;
    setUser({ phone, name: "Сосед" });
    setView('home');
    showNotification("Добро пожаловать в ПРОКАТило! 👋");
  };

  const handleBook = () => {
    const newOrder = {
      ...selectedItem,
      orderId: Date.now(),
      tariff: selectedTariff,
      bookDate: selectedDate,
      bookTime: selectedTime,
      payment: paymentMethod,
      status: 'active'
    };
    setMyOrders([newOrder, ...myOrders]);
    showNotification("Заказ успешно оформлен! Скоро принесу. 🚀");
    setView('orders');
  };

  const askAi = async () => {
    if (!aiInput.trim()) return;
    const userMsg = aiInput;
    setAiMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setAiInput('');
    setAiLoading(true);

    const systemPrompt = `Ты - дружелюбный помощник сервиса аренды "ПРОКАТило". Твоя цель - помогать соседям выбирать инструменты и давать советы по их использованию. Доступные товары: ${INITIAL_ITEMS.map(i => i.title).join(', ')}. Отвечай кратко, профессионально и по-соседски.`;

    try {
      const response = await callGemini(userMsg, systemPrompt);
      setAiMessages(prev => [...prev, { role: 'ai', text: response }]);
    } catch (error) {
      setAiMessages(prev => [...prev, { role: 'ai', text: "Упс, мой мозг заклинило. Попробуйте еще раз!" }]);
    } finally {
      setAiLoading(false);
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'Все вещи' || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  // --- КОМПОНЕНТЫ ЭКРАНОВ ---

  const AuthView = () => (
    <div className="flex-1 flex flex-col px-8 pt-24 pb-12 bg-gradient-to-b from-white to-slate-50 animate-in fade-in duration-700">
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 bg-gradient-to-br from-amber-400 to-rose-600 rounded-[2.5rem] flex items-center justify-center text-white shadow-2xl mb-8 rotate-3">
          <Zap size={48} fill="white" />
        </div>
        <h1 className="text-5xl font-black italic tracking-tighter text-rose-500 mb-2">ПРОКАТило</h1>
        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-12">Сервис аренды вещей у соседа</p>
        
        <form onSubmit={handleLogin} className="w-full space-y-4">
          <div className="relative group">
            <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-rose-500 transition-colors" size={18} />
            <input 
              name="phone"
              type="tel" 
              required
              placeholder="Номер телефона" 
              className="w-full bg-white border-2 border-slate-100 rounded-3xl py-5 pl-14 pr-6 font-bold text-slate-700 outline-none focus:border-rose-500 transition-all shadow-sm"
            />
          </div>
          <button type="submit" className="w-full bg-slate-900 text-white py-5 rounded-3xl font-black text-lg shadow-xl active:scale-95 transition-transform flex items-center justify-center gap-3">
            Войти <ChevronRight size={20} />
          </button>
        </form>
      </div>
    </div>
  );

  const HomeView = () => (
    <div className="flex flex-col flex-1 h-full relative">
      {/* Хедер - Фиксируем z-index */}
      <div className="w-full bg-gradient-to-br from-amber-400 via-orange-500 to-rose-600 pt-16 pb-14 px-7 text-white shadow-lg relative z-10">
        <div className="mb-6 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/70" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-white bg-white/20 backdrop-blur-md rounded-2xl border border-white/10 focus:border-white/40 focus:outline-none pl-11 pr-4 py-3 text-sm transition-all placeholder:text-white/60 shadow-inner font-bold" 
            placeholder="Что вам нужно сегодня?" 
          />
        </div>
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-black tracking-tighter italic leading-none">ПРОКАТило</h1>
            <p className="text-white/90 text-[10px] font-black uppercase tracking-[0.2em] mt-2 opacity-80 leading-none">Твой личный склад вещей</p>
          </div>
          <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm border border-white/10 text-[10px] font-black uppercase tracking-widest">Online</div>
        </div>
      </div>

      {/* Контент - Поднимаем z-index */}
      <div className="bg-slate-50 px-5 pt-0 pb-28 flex-1 overflow-y-auto scrollbar-hide relative z-20 -mt-8">
        <div className="space-y-4">
          <div className="flex gap-3 overflow-x-auto py-2 scrollbar-hide">
            {CATEGORIES.map((cat) => (
              <span 
                key={cat} 
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all shadow-sm cursor-pointer ${activeCategory === cat ? 'bg-slate-900 text-white shadow-lg scale-105' : 'bg-white text-slate-400 border border-slate-100 hover:bg-slate-100'}`}
              >
                {cat}
              </span>
            ))}
          </div>

          <div className="grid gap-4">
            {filteredItems.map((item) => (
              <div 
                key={item.id}
                onClick={() => { setSelectedItem(item); setView('details'); }}
                className={`bg-white p-4 shadow-[0_10px_40px_rgb(0,0,0,0.03)] rounded-[2rem] cursor-pointer transition-all active:scale-[0.97] border border-slate-100 flex items-center hover:shadow-xl group`}
              >
                <div className={`w-16 h-16 flex items-center justify-center rounded-2xl ${item.bg} ${item.color} mr-4 group-hover:rotate-6 transition-transform`}>
                  <item.icon size={32} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-800 text-base leading-tight tracking-tight">{item.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{item.category}</span>
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                    <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-tight italic">В наличии</span>
                  </div>
                </div>
                <div className="text-right pl-2">
                  <span className="text-xl font-black text-slate-900 tracking-tighter">{item.price3h}₽</span>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter opacity-60">от 3ч</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="bg-rose-50 border border-rose-100 p-5 rounded-[2.5rem] flex items-center gap-4">
            <div className="bg-rose-500 p-3 rounded-2xl text-white shadow-lg shadow-rose-200">
               <Zap size={24} fill="white" />
            </div>
            <div>
              <p className="text-sm font-black text-rose-900 tracking-tight">Доставка за 15 мин</p>
              <p className="text-[11px] font-medium text-rose-600">Принесу вещь прямо к вашей двери</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* AI Assistant Button */}
      <button 
        onClick={() => setIsAiOpen(true)}
        className="fixed bottom-28 right-8 z-50 bg-slate-900 text-white p-4 rounded-full shadow-2xl active:scale-90 transition-transform border border-white/20 flex items-center gap-2 pr-5"
      >
        <Sparkles size={20} className="text-amber-400" />
        <span className="text-xs font-black uppercase tracking-widest">AI Помощник</span>
      </button>
    </div>
  );

  const DetailsView = () => (
    <div className="animate-in slide-in-from-right duration-300 flex flex-col min-h-screen bg-white">
      <div className="relative h-64 bg-slate-50 overflow-hidden flex items-center justify-center">
        <button onClick={() => setView('home')} className="absolute top-12 left-6 z-20 bg-white/90 backdrop-blur-md p-3 rounded-2xl shadow-xl active:scale-90">
          <ArrowLeft size={20} className="text-slate-900" />
        </button>
        <div className={`w-36 h-36 rounded-[3rem] ${selectedItem?.bg} flex items-center justify-center ${selectedItem?.color} shadow-2xl`}>
          <selectedItem.icon size={70} strokeWidth={1.5} />
        </div>
      </div>

      <div className="bg-white rounded-t-[3.5rem] -mt-12 relative z-10 px-8 pt-10 pb-32 flex-1 shadow-[0_-20px_50px_rgba(0,0,0,0.05)] overflow-y-auto scrollbar-hide">
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1">
             <span className="bg-slate-100 text-slate-500 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest mb-2 inline-block">
               {selectedItem?.category}
             </span>
             <h2 className="text-3xl font-black text-slate-900 tracking-tighter leading-none">{selectedItem?.title}</h2>
          </div>
          <div className="bg-emerald-50 px-4 py-2 rounded-2xl text-center shadow-sm">
            <p className="text-[9px] font-black text-emerald-400 uppercase tracking-tighter italic leading-none">В наличии</p>
            <p className="text-xs font-black text-emerald-500 uppercase mt-1 leading-none italic">Сегодня</p>
          </div>
        </div>

        <p className="text-slate-500 text-sm leading-relaxed mb-8 font-medium">{selectedItem?.desc}</p>

        <div className="space-y-6 mb-10">
          <div className="space-y-4">
            <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1 flex items-center gap-2 leading-none">
              <CalendarIcon size={12} /> Дата и точное время
            </h4>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <input 
                  type="date" 
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-4 text-sm font-bold focus:ring-2 ring-rose-500 outline-none appearance-none" 
                />
              </div>
              <div className="relative">
                <input 
                  type="time" 
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-4 text-sm font-bold focus:ring-2 ring-rose-500 outline-none appearance-none" 
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1 flex items-center gap-2 leading-none">
              <Timer size={12} /> Длительность аренды
            </h4>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: '3h', label: '3 часа', price: selectedItem?.price3h },
                { id: '6h', label: '6 часов', price: selectedItem?.price6h },
                { id: '24h', label: 'Сутки', price: selectedItem?.price24h }
              ].map((t) => (
                <div 
                  key={t.id}
                  onClick={() => setSelectedTariff(t.id)}
                  className={`p-4 rounded-[1.5rem] border-2 text-center transition-all cursor-pointer ${selectedTariff === t.id ? 'border-rose-500 bg-rose-50 text-rose-600 shadow-md scale-105 font-bold' : 'border-slate-50 bg-slate-50 opacity-60'}`}
                >
                  <p className={`text-[9px] font-black uppercase tracking-tighter mb-1 ${selectedTariff === t.id ? 'text-rose-400' : 'text-slate-400'}`}>{t.label}</p>
                  <p className="text-lg font-black leading-none">{t.price}₽</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <button 
          onClick={() => setView('checkout')}
          className="w-full bg-slate-900 text-white py-6 rounded-[2rem] font-black text-lg shadow-2xl shadow-slate-300 active:scale-95 transition-transform flex items-center justify-center gap-3 mb-4"
        >
          Далее к оплате
        </button>
        <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Оплата после получения веши</p>
      </div>
    </div>
  );

  const CheckoutView = () => (
    <div className="animate-in slide-in-from-right duration-300 flex flex-col min-h-screen bg-slate-50">
      <div className="pt-16 pb-8 px-8">
        <button onClick={() => setView('details')} className="bg-white p-3 rounded-2xl shadow-sm mb-8">
          <ArrowLeft size={20} className="text-slate-900" />
        </button>
        <h2 className="text-3xl font-black tracking-tighter text-slate-900 mb-2">Оформление</h2>
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest italic opacity-60 leading-none">Проверьте детали заказа</p>
      </div>

      <div className="flex-1 bg-white rounded-t-[3.5rem] px-8 pt-10 pb-32 shadow-[0_-20px_50px_rgba(0,0,0,0.03)] overflow-y-auto scrollbar-hide">
        <div className="bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100 flex items-center gap-4 mb-6">
          <div className={`w-14 h-14 rounded-2xl ${selectedItem?.bg} flex items-center justify-center ${selectedItem?.color}`}>
            <selectedItem.icon size={28} />
          </div>
          <div>
            <p className="font-black text-slate-800 leading-tight tracking-tight">{selectedItem?.title}</p>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 italic leading-none">
              {selectedDate} в {selectedTime}
            </p>
          </div>
        </div>

        <div className="space-y-6 mb-10">
          <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1 leading-none">Способ оплаты</h4>
          <div className="space-y-3">
            {[
              { id: 'sbp', label: 'СБП (Т-Банк / Сбер)', icon: Zap, color: 'text-indigo-500' },
              { id: 'card', label: 'Банковской картой', icon: CreditCard, color: 'text-rose-500' },
              { id: 'cash', label: 'Наличными при получении', icon: Wallet, color: 'text-amber-500' }
            ].map((m) => (
              <div 
                key={m.id}
                onClick={() => setPaymentMethod(m.id)}
                className={`flex items-center gap-4 p-5 rounded-3xl border-2 transition-all cursor-pointer ${paymentMethod === m.id ? 'border-slate-900 bg-slate-900 text-white shadow-xl translate-x-2' : 'border-slate-100 bg-white'}`}
              >
                <m.icon size={20} className={paymentMethod === m.id ? 'text-white' : m.color} />
                <span className="text-sm font-bold tracking-tight">{m.label}</span>
                {paymentMethod === m.id && <CheckCircle2 size={16} className="ml-auto text-emerald-400" />}
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center mb-8 px-2">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Итого к оплате</p>
            <p className="text-3xl font-black text-slate-900 tracking-tighter mt-1 leading-none">
              {selectedTariff === '24h' ? selectedItem?.price24h : selectedTariff === '6h' ? selectedItem?.price6h : selectedItem?.price3h}₽
            </p>
          </div>
          <div className="text-right">
             <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest italic leading-none">Залог 0₽</p>
          </div>
        </div>

        <button 
          onClick={handleBook}
          className="w-full bg-rose-500 text-white py-6 rounded-[2rem] font-black text-lg shadow-2xl shadow-rose-200 active:scale-95 transition-transform"
        >
          Подтвердить и заказать
        </button>
      </div>
    </div>
  );

  const MyOrdersView = () => (
    <div className="px-7 pt-16 pb-32 animate-in fade-in duration-500 flex flex-col flex-1 overflow-y-auto scrollbar-hide">
      <h2 className="text-4xl font-black tracking-tighter mb-2 italic text-rose-500 leading-none">Мои брони</h2>
      <p className="text-slate-400 text-sm font-bold uppercase tracking-tight mb-8 opacity-60 tracking-widest leading-none">История вашей аренды</p>

      <div className="space-y-4 flex-1">
        {myOrders.length > 0 ? myOrders.map((order) => (
          <div key={order.orderId} className="bg-white p-6 rounded-[2.5rem] border-2 border-rose-100 shadow-xl shadow-rose-50 relative overflow-hidden animate-in slide-in-from-bottom duration-300">
            <div className="absolute top-0 right-0 bg-rose-500 text-white px-4 py-1 rounded-bl-2xl text-[10px] font-black uppercase tracking-tighter">Активно</div>
            <div className="flex gap-4 items-center mb-4">
               <div className={`w-12 h-12 ${order.bg} rounded-2xl flex items-center justify-center ${order.color}`}>
                  <order.icon size={24} />
               </div>
               <div>
                  <p className="font-black text-slate-900 text-[15px] leading-tight tracking-tight">{order.title}</p>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mt-1 leading-none">{order.bookDate} • {order.bookTime}</p>
               </div>
            </div>
            <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl mb-4 border border-slate-100">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Тариф: {order.tariff === '24h' ? 'Сутки' : order.tariff === '6h' ? '6ч' : '3ч'}</span>
              <span className="font-black text-slate-900 text-lg leading-none">{order.tariff === '24h' ? order.price24h : order.tariff === '6h' ? order.price6h : order.price3h}₽</span>
            </div>
            <div className="flex gap-2">
              <button className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-transform">
                <MessageCircle size={14} /> Чат с владельцем
              </button>
            </div>
          </div>
        )) : (
          <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-[2.5rem] flex flex-col items-center justify-center gap-4">
              <Package size={48} strokeWidth={1} className="text-slate-200" />
              <div>
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Тут пока пусто</p>
                <p className="text-[9px] font-medium text-slate-300 italic">Выберите вещь в каталоге</p>
              </div>
          </div>
        )}
      </div>
    </div>
  );

  const ProfileView = () => (
    <div className="px-7 pt-16 animate-in fade-in duration-500 overflow-y-auto scrollbar-hide pb-32">
      <div className="flex flex-col items-center text-center mb-10">
        <div className="w-28 h-28 rounded-[3rem] bg-slate-50 p-1 mb-4 shadow-inner flex items-center justify-center text-slate-200 border-2 border-white overflow-hidden relative">
             <User size={56} strokeWidth={1.5} />
             <div className="absolute inset-0 bg-gradient-to-tr from-rose-500/10 to-transparent"></div>
        </div>
        <h2 className="text-3xl font-black tracking-tighter leading-none">{user?.name || "Сосед"}</h2>
        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mt-3 leading-none">{user?.phone}</p>
      </div>

      <div className="space-y-3">
        {[
          { icon: Star, label: 'Мои отзывы', val: '0 от соседа' },
          { icon: CreditCard, label: 'Карты для оплаты', val: 'Нет' },
          { icon: Bell, label: 'Уведомления', val: 'Вкл' },
          { icon: Info, label: 'О сервисе', val: 'v1.1' }
        ].map((item, i) => (
          <div key={i} className="bg-white p-5 rounded-[2rem] flex justify-between items-center group cursor-pointer border border-slate-50 hover:border-rose-100 transition-all shadow-sm">
            <div className="flex items-center gap-4">
              <div className="bg-slate-50 p-2.5 rounded-xl shadow-sm text-slate-400 group-hover:text-rose-500 transition-colors">
                <item.icon size={18} />
              </div>
              <span className="text-sm font-bold text-slate-700 tracking-tight leading-none">{item.label}</span>
            </div>
            <span className="text-[9px] font-black text-slate-300 uppercase tracking-tighter leading-none">{item.val}</span>
          </div>
        ))}
      </div>
      
      <button 
        onClick={() => setUser(null) || setView('auth')}
        className="mt-12 w-full text-slate-300 text-[10px] font-black uppercase tracking-widest hover:text-rose-500 transition-colors py-4 italic leading-none"
      >
        Выйти из аккаунта
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-200 flex items-center justify-center p-4">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[100] bg-slate-900 text-white px-6 py-4 rounded-3xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-top duration-500 font-bold text-sm tracking-tight border border-white/10 backdrop-blur-md">
          <Zap size={18} className="text-amber-400" fill="currentColor" />
          {toast}
        </div>
      )}

      {/* AI Assistant Modal */}
      {isAiOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsAiOpen(false)}></div>
          <div className="w-full max-w-[400px] bg-white rounded-[3rem] shadow-2xl relative z-10 overflow-hidden flex flex-col h-[70vh]">
            <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-400 rounded-xl text-slate-900">
                  <Sparkles size={20} />
                </div>
                <div>
                  <p className="font-black uppercase tracking-widest text-xs">ПРОКАТило AI</p>
                  <p className="text-[10px] opacity-60 uppercase font-bold italic">Ваш умный сосед</p>
                </div>
              </div>
              <button onClick={() => setIsAiOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide">
              {aiMessages.length === 0 && (
                <div className="text-center py-10 opacity-40">
                  <Sparkles size={40} className="mx-auto mb-3" />
                  <p className="text-sm font-bold uppercase tracking-widest">Спроси меня о чем угодно!</p>
                  <p className="text-xs mt-2 italic px-10 leading-relaxed">Например: "Как пользоваться перфоратором?" или "Посоветуй веломаршрут"</p>
                </div>
              )}
              {aiMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-4 rounded-3xl text-sm font-bold leading-relaxed tracking-tight ${msg.role === 'user' ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-800'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {aiLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-100 p-4 rounded-3xl flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin text-rose-500" />
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-400 italic">Думаю...</span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-slate-100 flex gap-2">
              <input 
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && askAi()}
                placeholder="Спросить соседа..." 
                className="flex-1 bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 ring-rose-500 outline-none"
              />
              <button 
                onClick={askAi}
                disabled={aiLoading}
                className="bg-slate-900 text-white p-3 rounded-2xl active:scale-95 transition-transform disabled:opacity-50"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&display=swap');
        .font-manrope { font-family: 'Manrope', sans-serif; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        input[type="date"]::-webkit-calendar-picker-indicator,
        input[type="time"]::-webkit-calendar-picker-indicator {
          background: transparent;
          bottom: 0;
          color: transparent;
          cursor: pointer;
          height: auto;
          left: 0;
          position: absolute;
          right: 0;
          top: 0;
          width: auto;
        }
      `}} />

      <div className="font-manrope w-full max-w-[414px] bg-white text-slate-800 overflow-hidden border-4 border-white rounded-[3.8rem] shadow-2xl relative min-h-[850px] tracking-tight flex flex-col">
        <div className="phone-top"><div className="phone-top-inner"></div></div>
        
        <div className="flex-1 overflow-hidden relative flex flex-col">
          {view === 'auth' && <AuthView />}
          {view === 'home' && <HomeView />}
          {view === 'details' && <DetailsView />}
          {view === 'checkout' && <CheckoutView />}
          {view === 'orders' && <MyOrdersView />}
          {view === 'profile' && <ProfileView />}
        </div>

        {/* Нижняя навигация - исправлено позиционирование */}
        {view !== 'auth' && view !== 'details' && view !== 'checkout' && (
          <div className="absolute bottom-8 left-0 w-full px-8 z-[100] pointer-events-none">
            <div className="bg-slate-900/95 backdrop-blur-xl rounded-[2.5rem] p-4 shadow-2xl flex justify-around items-center pointer-events-auto border border-white/5">
              <button onClick={() => setView('home')} className={`flex flex-col items-center gap-1 transition-all active:scale-90 ${view === 'home' ? 'text-white' : 'text-white/30'}`}>
                <Home size={22} strokeWidth={2.5} />
                <span className="text-[8px] font-black uppercase tracking-widest leading-none mt-1">Каталог</span>
              </button>
              <button onClick={() => setView('orders')} className={`flex flex-col items-center gap-1 transition-all active:scale-90 ${view === 'orders' ? 'text-white' : 'text-white/30'}`}>
                <Package size={22} strokeWidth={2.5} />
                <span className="text-[8px] font-black uppercase tracking-widest leading-none mt-1">Заказы</span>
              </button>
              <button onClick={() => setView('profile')} className={`flex flex-col items-center gap-1 transition-all active:scale-90 ${view === 'profile' ? 'text-white' : 'text-white/30'}`}>
                <User size={22} strokeWidth={2.5} />
                <span className="text-[8px] font-black uppercase tracking-widest leading-none mt-1">Аккаунт</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}