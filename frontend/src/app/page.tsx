"use client";

import { useState } from "react";

import { AuthView } from "@/components/features/auth/AuthView";
import { BonusesView } from "@/components/features/bonuses/BonusesView";
import { CheckoutView } from "@/components/features/checkout/CheckoutView";
import { DetailsView } from "@/components/features/catalog/DetailsView";
import { HomeView } from "@/components/features/catalog/HomeView";
import { MyOrdersView } from "@/components/features/orders/MyOrdersView";
import { OperatorDashboard } from "@/components/features/operator/OperatorDashboard";
import { ProfileView } from "@/components/features/profile/ProfileView";
import { AppNavigation } from "@/components/layout/AppNavigation";
import { CookieNotice } from "@/components/legal/CookieNotice";
import { Toast } from "@/components/ui/Toast";
import { useAuth } from "@/hooks/use-auth";
import { useBookingSlots } from "@/hooks/use-booking-slots";
import { useCatalogFilter } from "@/hooks/use-catalog-filter";
import { useCheckoutState } from "@/hooks/use-checkout-state";
import { useItems } from "@/hooks/use-items";
import { useOrders } from "@/hooks/use-orders";
import { useToast } from "@/hooks/use-toast";
import { createOrder } from "@/lib/api/orders";
import { getSelectedRentalInterval } from "@/lib/booking-time";
import { UI_COPY } from "@/lib/copy";
import { mapAppCheckoutToOrderCreatePayload } from "@/lib/mappers/orders";
import { getRentalTotalPrice } from "@/lib/tariffs";
import type { AppItem, AppView, PaymentMethod } from "@/types";

export default function App() {
  const [view, setView] = useState<AppView>("home");
  const [paymentMethod] = useState<PaymentMethod>("cash");
  const [isBookingSubmitting, setIsBookingSubmitting] = useState(false);

  const {
    items,
    isLoading: isCatalogLoading,
    error: catalogError,
    source: catalogSource,
    reload: reloadCatalog,
  } = useItems();
  const { toast, showNotification } = useToast();
  const auth = useAuth({
    onNotify: showNotification,
    onAuthenticated: () => setView("home"),
    onLogout: () => setView("home"),
  });
  const ordersState = useOrders({
    authToken: auth.authToken,
    items,
    onNotify: showNotification,
  });
  const checkout = useCheckoutState();
  const catalogFilter = useCatalogFilter(items);
  const bookingSlotsState = useBookingSlots(checkout.selectedItem?.id ?? null);

  const handleOpenDetails = (item: AppItem) => {
    checkout.openDetails(item);
    setView("details");
  };

  const handleBook = async () => {
    if (!checkout.selectedItem) {
      showNotification(UI_COPY.toast.selectItemFirst);
      return;
    }

    if (!auth.user || !auth.authToken) {
      setView("auth");
      showNotification(UI_COPY.toast.loginRequired);
      return;
    }

    setIsBookingSubmitting(true);

    try {
      const selectedInterval = getSelectedRentalInterval(
        checkout.selectedDate,
        checkout.selectedTime,
        checkout.selectedEndDate,
        checkout.selectedEndTime,
      );
      await createOrder(
        auth.authToken,
        mapAppCheckoutToOrderCreatePayload({
          user: auth.user,
          item: checkout.selectedItem,
          tariff: checkout.selectedTariff,
          paymentMethod,
          deliveryAddress: checkout.deliveryAddress,
          courierComment: checkout.courierComment,
          promoCode: checkout.appliedPromoCode,
          bonusSpendAmount: checkout.bonusSpendAmount,
          selectedDate: checkout.selectedDate,
          selectedTime: checkout.selectedTime,
          selectedEndDate: checkout.selectedEndDate,
          selectedEndTime: checkout.selectedEndTime,
          totalPrice: getRentalTotalPrice(
            checkout.selectedItem,
            checkout.selectedTariff,
            selectedInterval?.startAt ?? null,
            selectedInterval?.endAt ?? null,
          ),
        }),
      );

      await reloadCatalog();
      await bookingSlotsState.reloadBookingSlots();
      await ordersState.reloadOrders(auth.authToken);
      checkout.resetCheckoutForm();

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

  return (
    <div className="min-h-screen bg-slate-50">
      <Toast message={toast} />
      <CookieNotice />

      {view === "auth" && (
        <AuthView
          mode={auth.authMode}
          onModeChange={auth.setAuthMode}
          onSubmit={(event) => void auth.handleAuth(event)}
        />
      )}

      {view === "home" && (
        <HomeView
          items={catalogFilter.filteredItems}
          categories={catalogFilter.categories}
          searchQuery={catalogFilter.searchQuery}
          activeCategory={catalogFilter.activeCategory}
          isLoading={isCatalogLoading}
          catalogSource={catalogSource}
          catalogError={catalogError}
          onSearchChange={catalogFilter.setSearchQuery}
          onCategoryChange={catalogFilter.setActiveCategory}
          onOpenDetails={handleOpenDetails}
        />
      )}

      {view === "details" && checkout.selectedItem && (
        <DetailsView
          item={checkout.selectedItem}
          onBack={() => setView("home")}
          onCheckout={() => setView("checkout")}
        />
      )}

      {view === "checkout" && checkout.selectedItem && (
        <CheckoutView
          selectedItem={checkout.selectedItem}
          selectedTariff={checkout.selectedTariff}
          selectedDate={checkout.selectedDate}
          selectedTime={checkout.selectedTime}
          selectedEndDate={checkout.selectedEndDate}
          selectedEndTime={checkout.selectedEndTime}
          deliveryAddress={checkout.deliveryAddress}
          courierComment={checkout.courierComment}
          clarifyAddress={checkout.clarifyAddress}
          authToken={auth.authToken ?? ""}
          promoCode={checkout.promoCode}
          appliedPromoCode={checkout.appliedPromoCode}
          promoDiscountPreview={checkout.promoDiscountPreview}
          bonusSpendAmount={checkout.bonusSpendAmount}
          bookingSlots={bookingSlotsState.bookingSlots}
          isBookingsLoading={bookingSlotsState.isBookingsLoading}
          bookingsError={bookingSlotsState.bookingsError}
          isSubmitting={isBookingSubmitting}
          onBack={() => setView("details")}
          onTariffChange={checkout.selectTariff}
          onDateChange={checkout.setSelectedDate}
          onTimeChange={checkout.setSelectedTime}
          onEndDateChange={checkout.setSelectedEndDate}
          onEndTimeChange={checkout.setSelectedEndTime}
          onDeliveryAddressChange={checkout.setDeliveryAddress}
          onCourierCommentChange={checkout.setCourierComment}
          onClarifyAddressChange={checkout.setClarifyAddress}
          onNotify={showNotification}
          onPromoCodeChange={checkout.setPromoCode}
          onPromoApplied={(code, discountAmount) => {
            checkout.setAppliedPromoCode(code);
            checkout.setPromoDiscountPreview(discountAmount);
          }}
          onBonusSpendChange={checkout.setBonusSpendAmount}
          onSubmit={() => void handleBook()}
        />
      )}

      {view === "orders" && auth.user && (
        <MyOrdersView
          orders={ordersState.orders}
          isLoading={ordersState.isOrdersLoading}
          error={ordersState.ordersError}
          onRefresh={() => void ordersState.reloadOrders()}
          onOpenCatalog={() => setView("home")}
          onLeaveReview={ordersState.leaveReview}
        />
      )}

      {view === "orders" && !auth.user && (
        <AuthView
          mode={auth.authMode}
          onModeChange={auth.setAuthMode}
          onSubmit={(event) => void auth.handleAuth(event)}
        />
      )}

      {view === "bonuses" && auth.user && auth.authToken && (
        <BonusesView
          authToken={auth.authToken}
          onNotify={showNotification}
        />
      )}

      {view === "bonuses" && !auth.user && (
        <AuthView
          mode={auth.authMode}
          onModeChange={auth.setAuthMode}
          onSubmit={(event) => void auth.handleAuth(event)}
        />
      )}

      {view === "profile" && auth.user && (
        <ProfileView
          user={auth.user}
          onLogout={() => {
            ordersState.clearOrders();
            auth.logout();
          }}
        />
      )}

      {view === "profile" && !auth.user && (
        <AuthView
          mode={auth.authMode}
          onModeChange={auth.setAuthMode}
          onSubmit={(event) => void auth.handleAuth(event)}
        />
      )}

      {view === "admin-dashboard" && auth.user?.isAdmin && auth.authToken && (
        <OperatorDashboard
          authToken={auth.authToken}
          items={items}
          onCatalogChanged={async () => {
            await reloadCatalog();
            await ordersState.reloadOrders();
          }}
        />
      )}

      {view !== "checkout" && (
        <AppNavigation
          view={view}
          isAdmin={Boolean(auth.user?.isAdmin)}
          onNavigate={(nextView) => {
            if (nextView === "admin-dashboard" && !auth.user?.isAdmin) {
              setView("profile");
              return;
            }

            setView(nextView);
          }}
        />
      )}
    </div>
  );
}
