import { useCallback, useEffect, useState } from "react";

import { useAutoRefresh } from "@/hooks/use-auto-refresh";
import { getItemBookings } from "@/lib/api/items";
import type { BookingSlot } from "@/types";

function mapBookingSlot(booking: {
  order_id: number;
  item_id: number;
  rental_start_at: string;
  rental_end_at: string;
  status: BookingSlot["status"];
}): BookingSlot {
  return {
    orderId: booking.order_id,
    itemId: booking.item_id,
    rentalStartAt: booking.rental_start_at,
    rentalEndAt: booking.rental_end_at,
    status: booking.status,
  };
}

export function useBookingSlots(itemId: number | null) {
  const [bookingSlots, setBookingSlots] = useState<BookingSlot[]>([]);
  const [isBookingsLoading, setIsBookingsLoading] = useState(false);
  const [bookingsError, setBookingsError] = useState<string | null>(null);

  const reloadBookingSlots = useCallback(async (
    { showLoading = true }: { showLoading?: boolean } = {},
  ) => {
    if (!itemId) {
      setBookingSlots([]);
      setBookingsError(null);
      return;
    }

    if (showLoading) {
      setIsBookingsLoading(true);
    }

    setBookingsError(null);

    try {
      const backendBookings = await getItemBookings(itemId);
      setBookingSlots(backendBookings.map(mapBookingSlot));
    } catch (error) {
      setBookingSlots([]);
      setBookingsError(
        error instanceof Error
          ? error.message
          : "Не удалось загрузить занятость",
      );
    } finally {
      if (showLoading) {
        setIsBookingsLoading(false);
      }
    }
  }, [itemId]);

  useEffect(() => {
    void Promise.resolve().then(() => reloadBookingSlots());
  }, [reloadBookingSlots]);

  useAutoRefresh({
    enabled: Boolean(itemId),
    intervalMs: 60_000,
    onRefresh: () => reloadBookingSlots({ showLoading: false }),
  });

  return {
    bookingSlots,
    isBookingsLoading,
    bookingsError,
    reloadBookingSlots,
  };
}
