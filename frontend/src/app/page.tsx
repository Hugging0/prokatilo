"use client";

import type { FormEvent } from "react";
import { useState } from "react";

import { AuthView } from "@/components/features/auth/AuthView";
import { CheckoutView } from "@/components/features/checkout/CheckoutView";
import { DetailsView } from "@/components/features/catalog/DetailsView";
import { HomeView } from "@/components/features/catalog/HomeView";
import { MyOrdersView } from "@/components/features/orders/MyOrdersView";
import { OperatorDashboard } from "@/components/features/operator/OperatorDashboard";
import { ProfileView } from "@/components/features/profile/ProfileView";
import { AppNavigation } from "@/components/layout/AppNavigation";
import { Toast } from "@/components/ui/Toast";
import { useItems } from "@/hooks/use-items";
import { UI_COPY } from "@/lib/copy";
import { ORDER_STATUSES } from "@/lib/order-statuses";
import { getTariffPrice } from "@/lib/tariffs";
import type {
  AppItem,
  AppOrder,
  AppView,
  OrderStatus,
  PaymentMethod,
  TariffType,
  User,
} from "@/types";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [view, setView] = useState<AppView>("auth");

  const {
    items,
    isLoading: isCatalogLoading,
    error: catalogError,
    source: catalogSource,
    reload: reloadCatalog,
  } = useItems();
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
  const [deliveryAddress, setDeliveryAddress] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("Все вещи");
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
      showNotification(UI_COPY.toast.invalidPhone);
      return;
    }

    setUser({
      phone,
      name: "Александр",
      id: "user_1",
    });
    setView("home");
    showNotification(UI_COPY.toast.welcomeBack);
  };

  const handleOpenDetails = (item: AppItem) => {
    setSelectedItem(item);
    setSelectedTariff("24h");
    setView("details");
  };

  const handleBook = () => {
    if (!selectedItem || !user) {
      showNotification(UI_COPY.toast.selectItemFirst);
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
      paymentMethod,
      deliveryAddress:
        deliveryAddress.trim() || UI_COPY.checkout.addressFallback,
      status: "pending",
      review: null,
    };

    setOrders((currentOrders) => [newOrder, ...currentOrders]);
    setDeliveryAddress("");
    setView("orders");
    showNotification(UI_COPY.toast.bookingCreated);
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

    showNotification(UI_COPY.toast.reviewThanks);
  };

  const handleLogout = () => {
    setUser(null);
    setIsAdmin(false);
    setView("auth");
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
  const categories = [
    "Все вещи",
    ...Array.from(new Set(items.map((item) => item.category))),
  ];

  if (!user) {
    return <AuthView onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Toast message={toast} />

      {view === "home" && (
        <HomeView
          items={filteredItems}
          categories={categories}
          searchQuery={searchQuery}
          activeCategory={activeCategory}
          isLoading={isCatalogLoading}
          catalogSource={catalogSource}
          catalogError={catalogError}
          onSearchChange={setSearchQuery}
          onCategoryChange={setActiveCategory}
          onOpenDetails={handleOpenDetails}
        />
      )}

      {view === "details" && selectedItem && (
        <DetailsView
          item={selectedItem}
          selectedTariff={selectedTariff}
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          onBack={() => setView("home")}
          onCheckout={() => setView("checkout")}
          onTariffChange={setSelectedTariff}
          onDateChange={setSelectedDate}
          onTimeChange={setSelectedTime}
        />
      )}

      {view === "checkout" && selectedItem && (
        <CheckoutView
          selectedItem={selectedItem}
          selectedTariff={selectedTariff}
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          paymentMethod={paymentMethod}
          deliveryAddress={deliveryAddress}
          onBack={() => setView("details")}
          onPaymentMethodChange={setPaymentMethod}
          onDeliveryAddressChange={setDeliveryAddress}
          onSubmit={handleBook}
        />
      )}

      {view === "orders" && (
        <MyOrdersView orders={myOrders} onLeaveReview={leaveReview} />
      )}

      {view === "profile" && (
        <ProfileView
          user={user}
          isAdmin={isAdmin}
          onToggleAdmin={() =>
            setIsAdmin((currentValue) => !currentValue)
          }
          onLogout={handleLogout}
        />
      )}

      {view === "admin-dashboard" && (
        <OperatorDashboard
          orders={orders}
          onUpdateOrderStatus={updateOrderStatus}
          onCatalogChanged={reloadCatalog}
        />
      )}

      <AppNavigation
        view={view}
        isAdmin={isAdmin}
        onNavigate={setView}
        onBonusClick={() =>
          showNotification(UI_COPY.bonus.comingSoon)
        }
      />
    </div>
  );
}
