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
import { getCurrentUser, loginUser, registerUser } from "@/lib/api/auth";
import {
  createOrder,
  createOrderPayment,
  getMyOrders,
} from "@/lib/api/orders";
import { clearAuthToken, getAuthToken, setAuthToken } from "@/lib/auth-session";
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

function mapBackendUserToUser(user: {
  id: number;
  email: string;
  name: string;
  phone: string | null;
  is_admin: boolean;
}): User {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    phone: user.phone ?? "",
    isAdmin: user.is_admin,
  };
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authToken, setAuthTokenState] = useState<string | null>(() =>
    getAuthToken(),
  );
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [view, setView] = useState<AppView>("home");
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

  async function reloadOrders(token = authToken) {
    if (!token) {
      setOrders([]);
      setOrdersError(null);
      return;
    }

    setIsOrdersLoading(true);
    setOrdersError(null);

    try {
      const backendOrders = await getMyOrders(token);
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
    if (!authToken) {
      return;
    }

    let isMounted = true;

    void getCurrentUser(authToken)
      .then((backendUser) => {
        if (!isMounted) {
          return;
        }

        setUser(mapBackendUserToUser(backendUser));
        return getMyOrders(authToken);
      })
      .then((backendOrders) => {
        if (!isMounted || !backendOrders) {
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
  }, [authToken, items]);

  const handleAuth = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const password = String(formData.get("password") ?? "");
    const name = String(formData.get("name") ?? "").trim();
    const phone = String(formData.get("phone") ?? "").trim();

    if (!email.includes("@")) {
      showNotification(UI_COPY.toast.invalidEmail);
      return;
    }

    if (password.length < 6) {
      showNotification(UI_COPY.toast.invalidPassword);
      return;
    }

    if (authMode === "register" && !name) {
      showNotification("Введите имя");
      return;
    }

    try {
      const authResponse =
        authMode === "register"
          ? await registerUser({
              email,
              password,
              name,
              phone: phone || null,
            })
          : await loginUser({
              email,
              password,
            });

      setAuthToken(authResponse.access_token);
      setAuthTokenState(authResponse.access_token);
      setUser(mapBackendUserToUser(authResponse.user));
      setIsOrdersLoading(true);
      setOrdersError(null);
      setView("home");
      showNotification(
        authMode === "register"
          ? UI_COPY.toast.registered
          : UI_COPY.toast.welcomeBack,
      );
    } catch (error) {
      showNotification(
        error instanceof Error ? error.message : "Не удалось войти",
      );
    }
  };

  const handleOpenDetails = (item: AppItem) => {
    setSelectedItem(item);
    setSelectedTariff("24h");
    setView("details");
  };

  const handleBook = async () => {
    if (!selectedItem) {
      showNotification(UI_COPY.toast.selectItemFirst);
      return;
    }

    if (!user || !authToken) {
      setView("auth");
      showNotification(UI_COPY.toast.loginRequired);
      return;
    }

    setIsBookingSubmitting(true);

    try {
      const createdOrder = await createOrder(
        authToken,
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
      await reloadOrders(authToken);
      setDeliveryAddress("");

      if (paymentMethod !== "cash") {
        const payment = await createOrderPayment(
          authToken,
          createdOrder.id,
        );

        if (payment.confirmation_url) {
          showNotification(UI_COPY.toast.paymentCreated);
          window.location.href = payment.confirmation_url;
          return;
        }
      }

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
    clearAuthToken();
    setAuthTokenState(null);
    setUser(null);
    setOrders([]);
    setView("home");
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

  return (
    <div className="min-h-screen bg-slate-50">
      <Toast message={toast} />

      {view === "auth" && (
        <AuthView
          mode={authMode}
          onModeChange={setAuthMode}
          onSubmit={(event) => void handleAuth(event)}
        />
      )}

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

      {view === "orders" && user && (
        <MyOrdersView
          orders={orders}
          isLoading={isOrdersLoading}
          error={ordersError}
          onRefresh={() => void reloadOrders()}
          onLeaveReview={leaveReview}
        />
      )}

      {view === "orders" && !user && (
        <AuthView
          mode={authMode}
          onModeChange={setAuthMode}
          onSubmit={(event) => void handleAuth(event)}
        />
      )}

      {view === "profile" && user && (
        <ProfileView
          user={user}
          onLogout={handleLogout}
        />
      )}

      {view === "profile" && !user && (
        <AuthView
          mode={authMode}
          onModeChange={setAuthMode}
          onSubmit={(event) => void handleAuth(event)}
        />
      )}

      {view === "admin-dashboard" && user?.isAdmin && authToken && (
        <OperatorDashboard
          authToken={authToken}
          items={items}
          onCatalogChanged={async () => {
            await reloadCatalog();
            await reloadOrders();
          }}
        />
      )}

      <AppNavigation
        view={view}
        isAdmin={Boolean(user?.isAdmin)}
        onNavigate={(nextView) => {
          if (nextView === "admin-dashboard" && !user?.isAdmin) {
            setView("profile");
            return;
          }

          setView(nextView);
        }}
        onBonusClick={() => showNotification(UI_COPY.bonus.comingSoon)}
      />
    </div>
  );
}
