import { useMemo, useState, type ReactNode } from "react";
import {
  ArrowLeft,
  CalendarDays,
  ChevronRight,
  Clock3,
  MapPin,
  MessageCircle,
  MoreVertical,
  PackageOpen,
  Phone,
  RefreshCw,
  RotateCw,
  Trash2,
  type LucideIcon,
} from "lucide-react";

import { formatRentalPeriod, getRentalDurationLabel } from "@/lib/booking-time";
import { BRAND_GRADIENT } from "@/lib/brand";
import { UI_COPY } from "@/lib/copy";
import { ORDER_STATUSES } from "@/lib/order-statuses";
import { getTariffLabel } from "@/lib/tariffs";
import type { AppOrder, OrderStatus } from "@/types";

type OrdersTab = "active" | "completed" | "all";

interface MyOrdersViewProps {
  orders: AppOrder[];
  isLoading: boolean;
  error: string | null;
  onRefresh: () => void;
  onOpenCatalog: () => void;
  onLeaveReview: (
    orderId: number,
    rating: number,
    comment: string,
  ) => void;
}

const TABS: Array<{ id: OrdersTab; label: string }> = [
  { id: "active", label: "Активные" },
  { id: "completed", label: "Завершённые" },
  { id: "all", label: "Все" },
];

const ACTIVE_STATUSES: OrderStatus[] = [
  "pending",
  "confirmed",
  "delivery",
  "active",
];

export function MyOrdersView({
  orders,
  isLoading,
  error,
  onRefresh,
  onOpenCatalog,
  onLeaveReview,
}: MyOrdersViewProps) {
  const [activeTab, setActiveTab] = useState<OrdersTab>("active");
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const sortedOrders = useMemo(() => sortOrders(orders), [orders]);
  const selectedOrder = sortedOrders.find((order) => order.id === selectedOrderId);
  const activeOrders = sortedOrders.filter((order) =>
    ACTIVE_STATUSES.includes(order.status),
  );
  const completedOrders = sortedOrders.filter((order) =>
    ["returned", "cancelled"].includes(order.status),
  );
  const visibleOrders =
    activeTab === "active"
      ? activeOrders
      : activeTab === "completed"
        ? completedOrders
        : sortedOrders;
  const nextOrder = activeOrders[0] ?? null;
  const restOrders = visibleOrders.filter((order) => order.id !== nextOrder?.id);

  if (selectedOrder) {
    return (
      <OrderDetailsView
        order={selectedOrder}
        onBack={() => setSelectedOrderId(null)}
        onLeaveReview={onLeaveReview}
      />
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-5 pt-11 pb-32">
      <div className="mx-auto flex max-w-2xl flex-col gap-6">
        <header className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-slate-400">
              ПРОКАТИЛО
            </p>
            <h1 className="mt-2 text-[30px] font-black leading-tight tracking-tight text-slate-950">
              {UI_COPY.orders.title}
            </h1>
          </div>
          <button
            type="button"
            onClick={onRefresh}
            className="flex size-12 items-center justify-center rounded-2xl border border-slate-100 bg-white text-slate-600 shadow-sm active:scale-95"
            aria-label="Обновить брони"
          >
            <RefreshCw size={20} />
          </button>
        </header>

        {orders.length > 0 && (
          <div className="flex rounded-[1.35rem] border border-slate-100 bg-white p-1 shadow-sm">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`min-h-11 flex-1 rounded-[1.05rem] px-3 text-sm font-extrabold transition ${
                  activeTab === tab.id
                    ? "bg-slate-950 text-white shadow-sm"
                    : "text-slate-500"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {isLoading && (
          <NoticeCard>{UI_COPY.orders.loading}</NoticeCard>
        )}

        {error && (
          <NoticeCard tone="danger">
            <span>{error}</span>
            <button
              type="button"
              onClick={onRefresh}
              className="mt-3 text-sm font-black text-rose-700"
            >
              Обновить
            </button>
          </NoticeCard>
        )}

        {!isLoading && !error && orders.length === 0 && (
          <EmptyOrdersState onOpenCatalog={onOpenCatalog} />
        )}

        {orders.length > 0 && activeTab === "active" && nextOrder && (
          <section className="flex flex-col gap-3">
            <SectionHeader
              title="Следующая бронь"
              status={ORDER_STATUSES[nextOrder.status].clientLabel}
            />
            <FeaturedOrderCard
              order={nextOrder}
              onOpen={() => setSelectedOrderId(nextOrder.id)}
            />
          </section>
        )}

        {orders.length > 0 && (
          <section className="flex flex-col gap-3">
            <SectionHeader
              title={activeTab === "active" ? "Остальные брони" : "Брони"}
              status={`${visibleOrders.length}`}
            />
            {restOrders.length > 0 ? (
              <div className="flex flex-col gap-3">
                {restOrders.map((order) => (
                  <CompactOrderCard
                    key={order.id}
                    order={order}
                    onOpen={() => setSelectedOrderId(order.id)}
                  />
                ))}
              </div>
            ) : (
              <NoticeCard>
                {activeTab === "active"
                  ? "Других активных броней пока нет."
                  : "В этой вкладке пока нет броней."}
              </NoticeCard>
            )}
          </section>
        )}
      </div>
    </main>
  );
}

function FeaturedOrderCard({
  order,
  onOpen,
}: {
  order: AppOrder;
  onOpen: () => void;
}) {
  return (
    <article className="rounded-[1.75rem] border border-slate-100 bg-white p-5 shadow-sm">
      <OrderProductHeader order={order} />
      <div className="mt-5 flex flex-col gap-4">
        <OrderFact
          icon={CalendarDays}
          label="Когда"
          value={formatRentalPeriod(order.rentalStartAt, order.rentalEndAt)}
        />
        <OrderFact
          icon={MapPin}
          label="Доставка"
          value={order.deliveryAddress}
          hint="Курьер свяжется перед приездом"
        />
      </div>
      <button
        type="button"
        onClick={onOpen}
        className={`mt-5 flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl ${BRAND_GRADIENT} px-5 text-base font-black text-white shadow-xl shadow-rose-100 active:scale-95`}
      >
        Подробнее о брони
        <ChevronRight size={19} />
      </button>
    </article>
  );
}

function CompactOrderCard({
  order,
  onOpen,
}: {
  order: AppOrder;
  onOpen: () => void;
}) {
  const status = ORDER_STATUSES[order.status];

  return (
    <button
      type="button"
      onClick={onOpen}
      className="w-full rounded-[1.5rem] border border-slate-100 bg-white p-4 text-left shadow-sm active:scale-[0.99]"
    >
      <div className="flex items-start gap-4">
        <OrderIcon order={order} compact />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate text-base font-black leading-snug text-slate-950">
                {order.title}
              </h3>
              <p className="mt-1 text-sm font-bold text-slate-500">
                {formatPricePerDay(order)}
              </p>
            </div>
            <ChevronRight className="mt-1 shrink-0 text-slate-300" size={19} />
          </div>
          <div className="mt-3">
            <StatusBadge status={order.status} />
          </div>
          <div className="mt-4 flex flex-col gap-2 text-sm font-bold text-slate-600">
            <span className="flex items-start gap-2">
              <CalendarDays className="mt-0.5 shrink-0 text-slate-400" size={17} />
              {formatRentalPeriod(order.rentalStartAt, order.rentalEndAt)}
            </span>
            <span className="flex items-start gap-2">
              <MapPin className="mt-0.5 shrink-0 text-slate-400" size={17} />
              <span>{order.deliveryAddress}</span>
            </span>
          </div>
          <p className="mt-3 text-sm font-bold leading-relaxed text-slate-500">
            {status.description}
          </p>
        </div>
      </div>
    </button>
  );
}

function OrderDetailsView({
  order,
  onBack,
  onLeaveReview,
}: {
  order: AppOrder;
  onBack: () => void;
  onLeaveReview: MyOrdersViewProps["onLeaveReview"];
}) {
  const duration = getRentalDurationLabel(
    new Date(order.rentalStartAt),
    new Date(order.rentalEndAt),
  );

  return (
    <main className="min-h-screen bg-slate-50 px-5 pt-7 pb-32">
      <div className="mx-auto flex max-w-2xl flex-col gap-5">
        <header className="flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="flex size-12 items-center justify-center rounded-2xl border border-slate-100 bg-white text-slate-800 shadow-sm active:scale-95"
            aria-label="Назад к списку броней"
          >
            <ArrowLeft size={21} />
          </button>
          <button
            type="button"
            className="flex size-12 items-center justify-center rounded-2xl border border-slate-100 bg-white text-slate-500 shadow-sm"
            aria-label="Дополнительные действия"
          >
            <MoreVertical size={21} />
          </button>
        </header>

        <section className="rounded-[1.75rem] border border-slate-100 bg-white p-5 shadow-sm">
          <StatusBadge status={order.status} />
          <div className="mt-5">
            <OrderProductHeader order={order} />
          </div>
        </section>

        <section className="rounded-[1.75rem] border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-5">
            <DetailRow
              icon={CalendarDays}
              label={order.status === "returned" ? "Аренда была" : "Когда"}
              value={formatRentalPeriod(order.rentalStartAt, order.rentalEndAt)}
              hint={`${getTariffLabel(order.tariff)} · ${duration}`}
            />
            <DetailRow
              icon={MapPin}
              label="Доставка"
              value={order.deliveryAddress}
              hint={getDeliveryHint(order.status)}
            />
            <DetailRow
              icon={Phone}
              label="Контакт"
              value={order.customerPhone}
              hint={order.customerName}
            />
            <DetailRow
              icon={Clock3}
              label="Оплата"
              value="Курьеру при получении"
              hint={getCourierPaymentHint(order.status)}
            />
            <DetailRow
              icon={RefreshCw}
              label="Сумма"
              value={`${order.price} ₽`}
              hint="Итог по выбранному периоду аренды"
            />
          </div>
        </section>

        <StatusInfoBlock order={order} />

        {order.status === "returned" && (
          <ReviewBlock
            order={order}
            onLeaveReview={onLeaveReview}
          />
        )}

        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-black tracking-tight text-slate-950">
            Что можно сделать
          </h2>
          {getActionsForOrder(order).map((action) => (
            <button
              key={action.label}
              type="button"
              className={`flex min-h-14 w-full items-center justify-between gap-4 rounded-2xl border px-4 text-base font-black shadow-sm active:scale-[0.99] ${
                action.tone === "danger"
                  ? "border-rose-100 bg-rose-50 text-rose-700"
                  : "border-slate-100 bg-white text-slate-800"
              }`}
            >
              <span className="flex items-center gap-3">
                <action.icon size={20} />
                {action.label}
              </span>
              <ChevronRight size={19} className="text-slate-300" />
            </button>
          ))}
        </section>
      </div>
    </main>
  );
}

function OrderProductHeader({ order }: { order: AppOrder }) {
  return (
    <div className="flex items-center gap-4">
      <OrderIcon order={order} />
      <div className="min-w-0">
        <h2 className="text-lg font-black leading-snug tracking-tight text-slate-950">
          {order.title}
        </h2>
        <p className="mt-1 text-base font-bold text-slate-500">
          {formatPricePerDay(order)}
        </p>
      </div>
    </div>
  );
}

function OrderIcon({
  order,
  compact = false,
}: {
  order: AppOrder;
  compact?: boolean;
}) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-2xl ${order.bg} ${order.color} ${
        compact ? "size-14" : "size-16"
      }`}
    >
      <order.icon size={compact ? 24 : 30} />
    </div>
  );
}

function OrderFact({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 shrink-0 text-slate-400" size={19} />
      <div>
        <p className="text-sm font-extrabold text-slate-500">{label}</p>
        <p className="mt-1 text-base font-bold leading-relaxed text-slate-800">
          {value}
        </p>
        {hint && (
          <p className="mt-1 text-sm font-bold leading-relaxed text-slate-400">
            {hint}
          </p>
        )}
      </div>
    </div>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-slate-50 text-slate-500">
        <Icon size={19} />
      </div>
      <div>
        <p className="text-sm font-extrabold text-slate-500">{label}</p>
        <p className="mt-1 text-base font-black leading-relaxed text-slate-900">
          {value}
        </p>
        {hint && (
          <p className="mt-1 text-sm font-bold leading-relaxed text-slate-500">
            {hint}
          </p>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: OrderStatus }) {
  const meta = ORDER_STATUSES[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-black ${meta.color}`}
    >
      <meta.icon size={14} />
      {meta.clientLabel}
    </span>
  );
}

function StatusInfoBlock({ order }: { order: AppOrder }) {
  return (
    <section className="rounded-[1.5rem] border border-slate-100 bg-white p-5 shadow-sm">
      <p className="text-base font-black text-slate-950">
        {getStatusInfoTitle(order.status)}
      </p>
      <p className="mt-2 text-base font-bold leading-relaxed text-slate-600">
        {getStatusInfoText(order)}
      </p>
    </section>
  );
}

function ReviewBlock({
  order,
  onLeaveReview,
}: {
  order: AppOrder;
  onLeaveReview: MyOrdersViewProps["onLeaveReview"];
}) {
  if (order.review) {
    return (
      <section className="rounded-[1.5rem] border border-slate-100 bg-white p-5 text-center shadow-sm">
        <p className="text-base font-black text-slate-950">
          {UI_COPY.orders.reviewThanks}
        </p>
        <p className="mt-2 text-3xl font-black text-amber-400">
          {"★".repeat(order.review.rating)}
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-[1.5rem] border border-amber-100 bg-amber-50 p-5 text-center shadow-sm">
      <p className="text-base font-black text-amber-900">
        {UI_COPY.orders.reviewTitle}
      </p>
      <div className="mt-4 flex justify-center gap-3">
        {[1, 2, 3, 4, 5].map((rating) => (
          <button
            key={rating}
            type="button"
            onClick={() => onLeaveReview(order.id, rating, "")}
            className="text-3xl leading-none text-amber-400 transition active:scale-95"
            aria-label={`Оценить на ${rating}`}
          >
            ★
          </button>
        ))}
      </div>
    </section>
  );
}

function EmptyOrdersState({ onOpenCatalog }: { onOpenCatalog: () => void }) {
  return (
    <section className="flex min-h-[58vh] flex-col items-center justify-center rounded-[1.75rem] border border-slate-100 bg-white px-6 py-10 text-center shadow-sm">
      <div className="flex size-20 items-center justify-center rounded-[1.5rem] bg-slate-50 text-slate-300">
        <PackageOpen size={38} />
      </div>
      <h2 className="mt-6 text-2xl font-black tracking-tight text-slate-950">
        {UI_COPY.orders.empty}
      </h2>
      <p className="mt-3 max-w-xs text-base font-bold leading-relaxed text-slate-500">
        Выберите вещь из каталога, а мы привезём её после подтверждения.
      </p>
      <button
        type="button"
        onClick={onOpenCatalog}
        className={`mt-6 min-h-14 rounded-2xl ${BRAND_GRADIENT} px-6 text-base font-black text-white shadow-xl shadow-rose-100`}
      >
        Перейти в каталог
      </button>
    </section>
  );
}

function SectionHeader({
  title,
  status,
}: {
  title: string;
  status: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="text-lg font-black tracking-tight text-slate-950">
        {title}
      </h2>
      <span className="rounded-full bg-white px-3 py-1.5 text-xs font-black text-slate-500 shadow-sm">
        {status}
      </span>
    </div>
  );
}

function NoticeCard({
  children,
  tone = "default",
}: {
  children: ReactNode;
  tone?: "default" | "danger";
}) {
  return (
    <div
      className={`rounded-[1.5rem] border p-5 text-base font-bold leading-relaxed shadow-sm ${
        tone === "danger"
          ? "border-rose-100 bg-rose-50 text-rose-600"
          : "border-slate-100 bg-white text-slate-500"
      }`}
    >
      {children}
    </div>
  );
}

function sortOrders(orders: AppOrder[]) {
  return [...orders].sort((first, second) => {
    const firstTime = new Date(first.rentalStartAt).getTime();
    const secondTime = new Date(second.rentalStartAt).getTime();
    return firstTime - secondTime;
  });
}

function formatPricePerDay(order: AppOrder) {
  return `${order.price} ₽ · ${getTariffLabel(order.tariff)}`;
}

function getDeliveryHint(status: OrderStatus) {
  switch (status) {
    case "pending":
      return "Адрес можно уточнить до подтверждения";
    case "confirmed":
      return "Доставим в выбранный интервал";
    case "delivery":
      return "Курьер уже в пути";
    case "active":
      return "Вещь передана по этому адресу";
    case "returned":
      return "Доставка и возврат завершены";
    case "cancelled":
      return "Бронь отменена";
  }
}

function getCourierPaymentHint(status: OrderStatus) {
  if (status === "returned") {
    return "Оплата закрывается при получении или по договорённости с курьером";
  }

  if (status === "cancelled") {
    return "Деньги не списывались";
  }

  return "В приложении деньги сейчас не списываются";
}

function getStatusInfoTitle(status: OrderStatus) {
  switch (status) {
    case "pending":
      return "Оператор проверит наличие";
    case "confirmed":
      return "Бронь подтверждена";
    case "delivery":
      return "Курьер готовит передачу";
    case "active":
      return "Пользуйтесь вещью";
    case "returned":
      return "Аренда завершена";
    case "cancelled":
      return "Бронь отменена";
  }
}

function getStatusInfoText(order: AppOrder) {
  switch (order.status) {
    case "pending":
      return "Мы свяжемся с вами в ближайшее время и подтвердим детали аренды.";
    case "confirmed":
      return "Мы подготовим вещь и передадим её курьеру в выбранный интервал.";
    case "delivery":
      return "Отслеживания доставки пока нет, но вся информация по брони здесь.";
    case "active":
      return "Не забудьте вернуть вещь к окончанию выбранного периода аренды.";
    case "returned":
      return "Спасибо за аренду. Можно повторить бронь или оставить оценку.";
    case "cancelled":
      return "Эта заявка закрыта. Можно выбрать вещь и оформить новую бронь.";
  }
}

function getActionsForOrder(order: AppOrder): Array<{
  label: string;
  icon: LucideIcon;
  tone?: "danger";
}> {
  switch (order.status) {
    case "pending":
      return [
        { label: UI_COPY.orders.supportButton, icon: MessageCircle },
        { label: "Изменить адрес", icon: MapPin },
        { label: "Отменить бронь", icon: Trash2, tone: "danger" },
      ];
    case "confirmed":
    case "delivery":
      return [
        { label: UI_COPY.orders.supportButton, icon: MessageCircle },
        { label: "Изменить адрес", icon: MapPin },
      ];
    case "active":
      return [
        { label: "Продлить аренду", icon: Clock3 },
        { label: "Оформить возврат", icon: RotateCw },
        { label: UI_COPY.orders.supportButton, icon: MessageCircle },
      ];
    case "returned":
      return [
        { label: "Повторить бронь", icon: RotateCw },
        { label: UI_COPY.orders.supportButton, icon: MessageCircle },
      ];
    case "cancelled":
      return [
        { label: "Повторить бронь", icon: RotateCw },
        { label: UI_COPY.orders.supportButton, icon: MessageCircle },
      ];
  }
}
