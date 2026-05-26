"use client";

import React, { FormEvent, useState } from "react";
import {
  ArrowLeft,
  Bell,
  Calendar as CalendarIcon,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  Home,
  Info,
  LayoutDashboard,
  MessageCircle,
  Package,
  Phone,
  Search,
  Settings,
  ShoppingBag,
  Star,
  Timer,
  User as UserIcon,
  Wallet,
} from "lucide-react";

import { CATEGORIES, INITIAL_ITEMS } from "@/lib/mock-data";
import {
  ORDER_STATUS_OPTIONS,
  ORDER_STATUSES,
} from "@/lib/order-statuses";
import { getTariffPrice, TARIFFS } from "@/lib/tariffs";
import type {
  AppItem,
  AppOrder,
  AppView,
  OrderStatus,
  PaymentMethod,
  TariffType,
  User,
} from "@/types";

const PAYMENT_METHODS: Array<{
  id: PaymentMethod;
  label: string;
}> = [
  {
    id: "sbp",
    label: "СБП / Т-Банк / Сбер",
  },
  {
    id: "card",
    label: "Картой",
  },
  {
    id: "cash",
    label: "Наличными",
  },
];

const PROFILE_STATS = [
  {
    icon: Star,
    label: "Отзывы",
    val: "4.9 ⭐",
  },
  {
    icon: CreditCard,
    label: "Платежи",
    val: "Привязаны",
  },
  {
    icon: Bell,
    label: "Уведомления",
    val: "Вкл",
  },
];

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [view, setView] = useState<AppView>("auth");

  const [items] = useState<AppItem[]>(INITIAL_ITEMS);
  const [orders, setOrders] = useState<AppOrder[]>([]);
  const [selectedItem, setSelectedItem] = useState<AppItem | null>(null);

  const [selectedTariff, setSelectedTariff] =
    useState<TariffType>("24h");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [selectedTime, setSelectedTime] = useState("12:00");
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("sbp");

  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] =
    useState<(typeof CATEGORIES)[number]>("Все вещи");
  const [toast, setToast] = useState<string | null>(null);

  const showNotification = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const handleLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const phone = String(formData.get("phone") ?? "").trim();

    if (phone.length < 10) {
      showNotification("Введите корректный номер телефона");
      return;
    }

    setUser({
      phone,
      name: "Александр",
      id: "user_1",
    });
    setView("home");
    showNotification("С возвращением!");
  };

  const handleOpenDetails = (item: AppItem) => {
    setSelectedItem(item);
    setSelectedTariff("24h");
    setView("details");
  };

  const handleBook = () => {
    if (!selectedItem || !user) {
      showNotification("Сначала выберите вещь и войдите в аккаунт");
      return;
    }

    const newOrder: AppOrder = {
      id: `ord_${Date.now()}`,
      itemId: selectedItem.id,
      title: selectedItem.title,
      icon: selectedItem.icon,
      color: selectedItem.color,
      bg: selectedItem.bg,
      userId: user.id,
      tariff: selectedTariff,
      date: selectedDate,
      time: selectedTime,
      price: getTariffPrice(selectedItem, selectedTariff),
      status: "pending",
      review: null,
    };

    setOrders((currentOrders) => [newOrder, ...currentOrders]);
    setView("orders");
    showNotification("Заказ отправлен владельцу!");
  };

  const updateOrderStatus = (
    orderId: string,
    newStatus: OrderStatus,
  ) => {
    setOrders((currentOrders) =>
      currentOrders.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status: newStatus,
            }
          : order,
      ),
    );

    showNotification(
      `Статус обновлен на: ${ORDER_STATUSES[newStatus].label}`,
    );
  };

  const leaveReview = (
    orderId: string,
    rating: number,
    comment: string,
  ) => {
    setOrders((currentOrders) =>
      currentOrders.map((order) =>
        order.id === orderId
          ? {
              ...order,
              review: {
                rating,
                comment,
              },
            }
          : order,
      ),
    );

    showNotification("Спасибо за отзыв! ⭐");
  };

  const filteredItems = items.filter((item) => {
    const normalizedSearchQuery = searchQuery.toLowerCase();
    const matchesSearch =
      item.title.toLowerCase().includes(normalizedSearchQuery) ||
      item.desc.toLowerCase().includes(normalizedSearchQuery);

    const matchesCategory =
      activeCategory === "Все вещи" ||
      item.category === activeCategory;

    return matchesSearch && matchesCategory;
  });

  const myOrders = orders.filter((order) => order.userId === user?.id);

  const renderAuthView = () => (
    <main className="min-h-screen bg-gradient-to-b from-white to-slate-50 flex items-center justify-center p-6">
      <section className="w-full max-w-sm bg-white rounded-[2.5rem] p-8 shadow-2xl shadow-slate-200/70 border border-slate-100">
        <div className="w-24 h-24 bg-gradient-to-br from-amber-400 to-rose-600 rounded-[2.5rem] flex items-center justify-center text-white shadow-2xl shadow-rose-200 mb-8 rotate-3">
          <ShoppingBag size={42} strokeWidth={2.5} />
        </div>

        <h1 className="text-5xl font-black italic tracking-tighter text-rose-500 mb-2 leading-none">
          ПРОКАТило
        </h1>

        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-12">
          Сервис проката вещей
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
          <label
            htmlFor="phone"
            className="block text-xs font-black uppercase tracking-widest text-slate-400"
          >
            Номер телефона
          </label>

          <div className="relative">
            <Phone
              size={18}
              className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              id="phone"
              name="phone"
              type="tel"
              placeholder="+7 999 000-00-00"
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl py-5 pl-14 pr-6 font-bold text-slate-700 outline-none focus:border-rose-500 transition-all"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-slate-900 text-white py-5 rounded-3xl font-black text-lg shadow-xl shadow-slate-200 active:scale-95 transition-transform flex items-center justify-center gap-3"
          >
            Войти
            <ChevronRight size={20} />
          </button>
        </form>
      </section>
    </main>
  );

  const renderHomeView = () => (
    <main className="min-h-screen bg-slate-50 pb-28">
      <section className="w-full bg-gradient-to-br from-amber-400 via-orange-500 to-rose-600 rounded-b-[2.5rem] px-7 pt-16 pb-14 text-white shadow-lg relative z-30">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-black tracking-tighter italic leading-none">
              ПРОКАТило
            </h1>
            <p className="text-white/90 text-[10px] font-black uppercase tracking-[0.2em] mt-2 opacity-80 leading-none">
              Аренда без залога
            </p>
          </div>

          <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm border border-white/10 text-[10px] font-black uppercase">
            На связи
          </div>
        </div>

        <div className="relative">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70"
          />
          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="w-full text-white bg-white/20 backdrop-blur-md rounded-2xl border border-white/10 focus:border-white/40 focus:outline-none pl-11 pr-4 py-3 text-sm transition-all placeholder:text-white/60 shadow-inner font-bold"
            placeholder="Что ищем?"
          />
        </div>
      </section>

      <section className="px-6 -mt-8 relative z-40">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              className={`px-5 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all shadow-sm cursor-pointer ${
                activeCategory === category
                  ? "bg-slate-900 text-white shadow-lg scale-105 font-black"
                  : "bg-white text-slate-400 border border-slate-100 hover:bg-slate-100 font-bold"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="grid gap-4 mt-4">
          {filteredItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleOpenDetails(item)}
              className="bg-white p-4 shadow-sm rounded-[2rem] cursor-pointer transition-all active:scale-[0.97] border border-slate-100 flex items-center hover:shadow-md group text-left"
            >
              <div
                className={`w-16 h-16 rounded-[1.5rem] ${item.bg} ${item.color} flex items-center justify-center mr-4 shrink-0`}
              >
                <item.icon size={30} strokeWidth={1.7} />
              </div>

              <div className="flex-1 min-w-0">
                <h2 className="font-bold text-slate-800 text-base leading-tight tracking-tight">
                  {item.title}
                </h2>
                <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-tight italic mt-1">
                  {item.available ? "В наличии" : "Недоступно"}
                </p>
              </div>

              <div className="text-right">
                <p className="text-xl font-black text-slate-900 tracking-tighter leading-none">
                  {item.price3h}₽
                </p>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter opacity-60 mt-1">
                  за 3 часа
                </p>
              </div>
            </button>
          ))}

          {filteredItems.length === 0 && (
            <div className="bg-white rounded-[2rem] p-8 text-center text-slate-400 font-bold">
              Ничего не найдено
            </div>
          )}
        </div>
      </section>
    </main>
  );

  const renderDetailsView = () => {
    if (!selectedItem) {
      return null;
    }

    return (
      <main className="min-h-screen bg-white pb-32">
        <section
          className={`relative ${selectedItem.bg} min-h-[330px] rounded-b-[3rem] flex items-center justify-center`}
        >
          <button
            type="button"
            onClick={() => setView("home")}
            className="absolute top-12 left-6 z-20 bg-white/90 backdrop-blur-md p-3 rounded-2xl shadow-xl active:scale-90 transition-transform"
          >
            <ArrowLeft size={22} />
          </button>

          <selectedItem.icon
            size={96}
            strokeWidth={1.3}
            className={selectedItem.color}
          />
        </section>

        <section className="px-6 -mt-10 relative z-10">
          <div className="bg-white rounded-[2.5rem] p-6 shadow-xl shadow-slate-100 border border-slate-100">
            <p className="bg-slate-100 text-slate-500 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest mb-2 inline-block italic">
              {selectedItem.category}
            </p>

            <h2 className="text-3xl font-black text-slate-900 tracking-tighter leading-none mt-4">
              {selectedItem.title}
            </h2>

            <p className="text-slate-500 font-medium mt-4 leading-relaxed">
              {selectedItem.desc}
            </p>

            <div className="mt-8">
              <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1 flex items-center gap-2 mb-3">
                <CalendarIcon size={16} />
                Дата и время
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(event) =>
                    setSelectedDate(event.target.value)
                  }
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-4 text-sm font-bold focus:ring-2 ring-rose-500 outline-none"
                />
                <input
                  type="time"
                  value={selectedTime}
                  onChange={(event) =>
                    setSelectedTime(event.target.value)
                  }
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-4 text-sm font-bold focus:ring-2 ring-rose-500 outline-none"
                />
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1 flex items-center gap-2 mb-3">
                <Timer size={16} />
                Длительность
              </h3>

              <div className="grid grid-cols-3 gap-3">
                {TARIFFS.map((tariff) => (
                  <button
                    key={tariff.id}
                    type="button"
                    onClick={() => setSelectedTariff(tariff.id)}
                    className={`p-4 rounded-[1.5rem] border-2 text-center transition-all cursor-pointer ${
                      selectedTariff === tariff.id
                        ? "border-rose-500 bg-rose-50 text-rose-600 shadow-md scale-105 font-bold"
                        : "border-slate-50 bg-slate-50 opacity-70"
                    }`}
                  >
                    <span
                      className={`block text-[9px] font-black uppercase tracking-tighter mb-1 ${
                        selectedTariff === tariff.id
                          ? "text-rose-400"
                          : "text-slate-400"
                      }`}
                    >
                      {tariff.label}
                    </span>
                    <span className="block text-lg font-black leading-none">
                      {getTariffPrice(selectedItem, tariff.id)}₽
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setView("checkout")}
              className="mt-8 w-full bg-slate-900 text-white py-6 rounded-[2rem] font-black text-lg shadow-2xl shadow-slate-300 active:scale-95 transition-transform"
            >
              Далее к оформлению
            </button>
          </div>
        </section>
      </main>
    );
  };

  const renderCheckoutView = () => {
    if (!selectedItem) {
      return null;
    }

    return (
      <main className="min-h-screen bg-slate-50 px-6 pt-12 pb-32">
        <button
          type="button"
          onClick={() => setView("details")}
          className="bg-white p-3 rounded-2xl shadow-sm mb-8"
        >
          <ArrowLeft size={22} />
        </button>

        <h2 className="text-3xl font-black text-slate-900 tracking-tighter leading-none mb-6">
          Оформление
        </h2>

        <section className="bg-white rounded-[2rem] p-5 border border-slate-100 shadow-sm mb-5">
          <div className="flex items-center gap-4">
            <div
              className={`w-14 h-14 rounded-2xl ${selectedItem.bg} ${selectedItem.color} flex items-center justify-center`}
            >
              <selectedItem.icon size={28} />
            </div>

            <div>
              <h3 className="font-black text-slate-900">
                {selectedItem.title}
              </h3>
              <p className="text-sm text-slate-400 font-bold">
                {selectedDate} в {selectedTime}
              </p>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-[2rem] p-5 border border-slate-100 shadow-sm">
          <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-4">
            Способ оплаты
          </h3>

          <div className="space-y-3">
            {PAYMENT_METHODS.map((method) => (
              <button
                key={method.id}
                type="button"
                onClick={() => setPaymentMethod(method.id)}
                className={`w-full flex items-center justify-between gap-4 p-5 rounded-3xl border-2 transition-all cursor-pointer ${
                  paymentMethod === method.id
                    ? "border-slate-900 bg-slate-900 text-white shadow-xl"
                    : "border-slate-100 bg-white text-slate-900"
                }`}
              >
                <span className="flex items-center gap-3 font-black">
                  <Wallet size={20} />
                  {method.label}
                </span>

                {paymentMethod === method.id && (
                  <CheckCircle2 size={20} />
                )}
              </button>
            ))}
          </div>
        </section>

        <button
          type="button"
          onClick={handleBook}
          className="mt-8 w-full bg-gradient-to-br from-amber-400 via-orange-500 to-rose-600 text-white py-6 rounded-[2rem] font-black text-lg shadow-2xl shadow-rose-200 active:scale-95 transition-transform"
        >
          Подтвердить · {getTariffPrice(selectedItem, selectedTariff)}₽
        </button>
      </main>
    );
  };

  const renderMyOrdersView = () => (
    <main className="min-h-screen bg-slate-50 px-6 pt-12 pb-32">
      <h2 className="text-3xl font-black text-slate-900 tracking-tighter leading-none mb-6">
        Мои брони
      </h2>

      <div className="space-y-4">
        {myOrders.map((order) => {
          const status = ORDER_STATUSES[order.status];

          return (
            <article
              key={order.id}
              className="bg-white rounded-[2rem] p-5 border border-slate-100 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-14 h-14 rounded-2xl ${order.bg} ${order.color} flex items-center justify-center`}
                  >
                    <order.icon size={24} />
                  </div>

                  <div>
                    <h3 className="font-black text-slate-900 tracking-tight">
                      {order.title}
                    </h3>
                    <p className="text-xs font-bold text-slate-400 mt-1">
                      {order.date} • {order.time}
                    </p>
                  </div>
                </div>

                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-black ${status.color}`}
                >
                  <status.icon size={10} />
                  {status.label}
                </span>
              </div>

              <div className="mt-4 flex items-center justify-between text-sm font-black text-slate-500">
                <span>Тариф: {order.tariff}</span>
                <span>{order.price}₽</span>
              </div>

              {order.status === "returned" && !order.review && (
                <div className="mt-5 rounded-2xl bg-amber-50 p-4">
                  <p className="text-xs font-black text-amber-700 mb-3">
                    Вещь возвращена! Оцените прокат:
                  </p>

                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() =>
                          leaveReview(order.id, star, "")
                        }
                        className="text-amber-400 hover:scale-125 transition-transform"
                      >
                        <Star size={22} fill="currentColor" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {order.review && (
                <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-xs font-black text-slate-500">
                  Ваш отзыв учтен: {order.review.rating} ⭐
                </div>
              )}

              <button
                type="button"
                className="mt-5 w-full flex items-center justify-center gap-2 bg-slate-900 text-white rounded-2xl py-4 text-sm font-black"
              >
                <MessageCircle size={18} />
                Связаться со мной
              </button>
            </article>
          );
        })}

        {myOrders.length === 0 && (
          <div className="bg-white rounded-[2rem] p-8 text-center text-slate-400 font-bold">
            Заказов пока нет
          </div>
        )}
      </div>
    </main>
  );

  const renderAdminDashboard = () => (
    <main className="min-h-screen bg-slate-950 px-6 pt-12 pb-32 text-white">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-black tracking-tighter leading-none">
            Управление
          </h2>
          <p className="text-white/40 text-sm font-bold mt-1">
            Владелец
          </p>
        </div>

        <LayoutDashboard className="text-white/30" size={30} />
      </div>

      <h3 className="font-black mb-4">Активные аренды</h3>

      <div className="space-y-4">
        {orders.map((order) => (
          <article
            key={order.id}
            className="bg-white text-slate-900 rounded-[2rem] p-5"
          >
            <div className="flex items-center gap-4">
              <div
                className={`w-14 h-14 rounded-2xl ${order.bg} ${order.color} flex items-center justify-center`}
              >
                <order.icon size={24} />
              </div>

              <div>
                <h4 className="font-black">{order.title}</h4>
                <p className="text-xs font-bold text-slate-400">
                  Клиент: {order.userId} • {order.price}₽
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-5">
              {ORDER_STATUS_OPTIONS.map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => updateOrderStatus(order.id, status)}
                  className={`px-3 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${
                    order.status === status
                      ? "bg-slate-900 text-white shadow-md"
                      : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {ORDER_STATUSES[status].label}
                </button>
              ))}
            </div>
          </article>
        ))}

        {orders.length === 0 && (
          <div className="bg-white/5 rounded-[2rem] p-8 text-center text-white/40 font-bold">
            Пока пусто
          </div>
        )}
      </div>
    </main>
  );

  const renderProfileView = () => (
    <main className="min-h-screen bg-slate-50 px-6 pt-12 pb-32">
      <section className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm">
        <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-amber-400 via-orange-500 to-rose-600 text-white flex items-center justify-center mb-5 shadow-xl shadow-rose-200">
          <UserIcon size={34} />
        </div>

        <h2 className="text-3xl font-black text-slate-900 tracking-tighter leading-none">
          {user?.name}
        </h2>
        <p className="text-slate-400 font-bold mt-2">{user?.phone}</p>
      </section>

      <button
        type="button"
        onClick={() => setIsAdmin((currentValue) => !currentValue)}
        className={`mt-5 w-full p-5 rounded-[2rem] flex justify-between items-center cursor-pointer transition-all border-2 ${
          isAdmin
            ? "bg-rose-50 border-rose-200"
            : "bg-white border-slate-50 shadow-sm"
        }`}
      >
        <span className="flex items-center gap-3 font-black text-slate-900">
          <Settings size={20} />
          Панель управления
        </span>

        <span
          className={`text-xs font-black ${
            isAdmin ? "text-rose-500" : "text-slate-400"
          }`}
        >
          {isAdmin ? "Вкл" : "Выкл"}
        </span>
      </button>

      <div className="mt-5 space-y-3">
        {PROFILE_STATS.map((item) => (
          <div
            key={item.label}
            className="bg-white rounded-[1.5rem] p-5 flex items-center justify-between border border-slate-100"
          >
            <span className="flex items-center gap-3 font-black text-slate-900">
              <item.icon size={20} className="text-slate-400" />
              {item.label}
            </span>
            <span className="text-sm font-black text-slate-400">
              {item.val}
            </span>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => {
          setUser(null);
          setIsAdmin(false);
          setView("auth");
        }}
        className="mt-12 w-full text-slate-300 text-[10px] font-black uppercase tracking-widest hover:text-rose-500 transition-colors py-4"
      >
        Выйти
      </button>
    </main>
  );

  if (!user) {
    return renderAuthView();
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {toast && (
        <div className="fixed top-5 left-1/2 z-50 -translate-x-1/2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-black text-white shadow-2xl">
          {toast}
        </div>
      )}

      {view === "home" && renderHomeView()}
      {view === "details" && renderDetailsView()}
      {view === "checkout" && renderCheckoutView()}
      {view === "orders" && renderMyOrdersView()}
      {view === "profile" && renderProfileView()}
      {view === "admin-dashboard" && renderAdminDashboard()}

      <nav className="fixed bottom-4 left-1/2 z-40 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-[2rem] border border-slate-100 bg-white/95 p-2 shadow-2xl shadow-slate-300 backdrop-blur">
        <div className="grid grid-cols-4 gap-1">
          <button
            type="button"
            onClick={() => setView("home")}
            className={`flex flex-col items-center gap-1 rounded-3xl py-3 text-[10px] font-black ${
              view === "home"
                ? "bg-gradient-to-br from-amber-400 via-orange-500 to-rose-600 text-white shadow-lg"
                : "text-slate-400"
            }`}
          >
            <Home size={20} />
            Главная
          </button>

          <button
            type="button"
            onClick={() => setView("orders")}
            className={`flex flex-col items-center gap-1 rounded-3xl py-3 text-[10px] font-black ${
              view === "orders"
                ? "bg-gradient-to-br from-amber-400 via-orange-500 to-rose-600 text-white shadow-lg"
                : "text-slate-400"
            }`}
          >
            <Package size={20} />
            Брони
          </button>

          {isAdmin ? (
            <button
              type="button"
              onClick={() => setView("admin-dashboard")}
              className={`flex flex-col items-center gap-1 rounded-3xl py-3 text-[10px] font-black ${
                view === "admin-dashboard"
                  ? "bg-gradient-to-br from-amber-400 via-orange-500 to-rose-600 text-white shadow-lg"
                  : "text-slate-400"
              }`}
            >
              <LayoutDashboard size={20} />
              Админ
            </button>
          ) : (
            <button
              type="button"
              onClick={() => showNotification("Скоро добавим бонусы")}
              className="flex flex-col items-center gap-1 rounded-3xl py-3 text-[10px] font-black text-slate-400"
            >
              <Info size={20} />
              Бонусы
            </button>
          )}

          <button
            type="button"
            onClick={() => setView("profile")}
            className={`flex flex-col items-center gap-1 rounded-3xl py-3 text-[10px] font-black ${
              view === "profile"
                ? "bg-gradient-to-br from-amber-400 via-orange-500 to-rose-600 text-white shadow-lg"
                : "text-slate-400"
            }`}
          >
            <UserIcon size={20} />
            Профиль
          </button>
        </div>
      </nav>

      <button
        type="button"
        onClick={() => setView("checkout")}
        className="hidden"
        aria-label="Скрытая кнопка оформления"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
