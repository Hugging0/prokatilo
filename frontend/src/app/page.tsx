"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";

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
import { createOrder, getMyOrders } from "@/lib/api/orders";
import { UI_COPY } from "@/lib/copy";
import { mapAppCheckoutToOrderCreatePayload, mapBackendOrdersToAppOrders } from "@/lib/mappers/orders";
import { getTariffPrice } from "@/lib/tariffs";
import type {
  AppItem,
  AppOrder,
  AppView,
  PaymentMethod,
  TariffType,
  User,
} from "@/types";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [view, setView] = useState<AppView>("auth");
  const [selectedItem, setSelectedItem] = useState<AppItem | null>(null);
  const [selectedTariff, setSelectedTariff] = useState<TariffType>("24h");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [selectedTime, setSelectedTime] = useState("12:00");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("sbp");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("Все вещи");
  const [toast, setToast] = useState<string | null>(null);
  const [orders, setOrders] = useState<AppOrder[]>([]);
  const [isOrdersLoading, setIsOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [isBookingSubmitting, setIsBookingSubmitting] = useState(false);

  const {
    items,
    isLoading: isCatalogLoading,
    error: catalogError,
    source: catalogSource,
    reload: reloadCatalog,
  } = useItems();

  const showNotification = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  async function reloadOrders(customerPhone = user?.phone) {
    if (!customerPhone) {
      setOrders([]);
      setOrdersError(null);
      return;
    }

    setIsOrdersLoading(true);
    setOrdersError(null);

    try {
      const backendOrders = await getMyOrders(customerPhone);
      setOrders((currentOrders) =>
        mapBackendOrdersToAppOrders(backendOrders, items, currentOrders),
      );
    } catch (error) {
      setOrdersError(
        error instanceof Error
          ? error.message
          : UI_COPY.orders.loadError,
      );
    } finally {
      setIsOrdersLoading(false);
    }
  }

  useEffect(() => {
    if (!user?.phone) {
      return;
    }

    let isMounted = true;

    void getMyOrders(user.phone)
      .then((backendOrders) => {
        if (!isMounted) {
          return;
        }

        setOrders((currentOrders) =>
          mapBackendOrdersToAppOrders(backendOrders, items, currentOrders),
        );
      })
      .catch((error) => {
        if (!isMounted) {
          return;
        }

        setOrdersError(
          error instanceof Error
            ? error.message
            : UI_COPY.orders.loadError,
        );
      })
      .finally(() => {
        if (isMounted) {
          setIsOrdersLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [user?.phone, items]);

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
      id: `user_${phone}`,
    });
    setIsOrdersLoading(true);
    setOrdersError(null);
    setView("home");
    showNotification(UI_COPY.toast.welcomeBack);
  };

  const handleOpenDetails = (item: AppItem) => {
    setSelectedItem(item);
    setSelectedTariff("24h");
    setView("details");
  };

  const handleBook = async () => {
    if (!selectedItem || !user) {
      showNotification(UI_COPY.toast.selectItemFirst);
      return;
    }

    setIsBookingSubmitting(true);

    try {
      await createOrder(
        mapAppCheckoutToOrderCreatePayload({
          user,
          item: selectedItem,
          tariff: selectedTariff,
          paymentMethod,
          deliveryAddress,
          selectedDate,
          selectedTime,
          totalPrice: getTariffPrice(selectedItem, selectedTariff),
        }),
      );

      await reloadCatalog();
      await reloadOrders(user.phone);
      setDeliveryAddress("");
      setView("orders");
      showNotification(UI_COPY.toast.bookingCreated);
    } catch (error) {
      showNotification(
        error instanceof Error
          ? error.message
          : UI_COPY.toast.bookingError,
      );
    } finally {
      setIsBookingSubmitting(false);
    }
  };

  const leaveReview = (
    orderId: number,
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
    setOrders([]);
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
          isSubmitting={isBookingSubmitting}
          onBack={() => setView("details")}
          onPaymentMethodChange={setPaymentMethod}
          onDeliveryAddressChange={setDeliveryAddress}
          onSubmit={() => void handleBook()}
        />
      )}

      {view === "orders" && (
        <MyOrdersView
          orders={orders}
          isLoading={isOrdersLoading}
          error={ordersError}
          onRefresh={() => void reloadOrders()}
          onLeaveReview={leaveReview}
        />
      )}

      {view === "profile" && (
        <ProfileView
          user={user}
          isAdmin={isAdmin}
          onToggleAdmin={() => setIsAdmin((currentValue) => !currentValue)}
          onLogout={handleLogout}
        />
      )}

      {view === "admin-dashboard" && (
        <OperatorDashboard
          items={items}
          onCatalogChanged={async () => {
            await reloadCatalog();
            await reloadOrders();
          }}
        />
      )}

      <AppNavigation
        view={view}
        isAdmin={isAdmin}
        onNavigate={setView}
        onBonusClick={() => showNotification(UI_COPY.bonus.comingSoon)}
      />
    </div>
  );
}
