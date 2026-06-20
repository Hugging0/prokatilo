"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { AppButton } from "@/components/ui/AppButton";

const COOKIE_NOTICE_KEY = "prokatilo_cookie_notice_accepted";

export function CookieNotice() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      setIsVisible(localStorage.getItem(COOKIE_NOTICE_KEY) !== "true");
    }, 0);

    return () => window.clearTimeout(timerId);
  }, []);

  const acceptNotice = () => {
    localStorage.setItem(COOKIE_NOTICE_KEY, "true");
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed inset-x-4 bottom-[calc(5.75rem+env(safe-area-inset-bottom))] z-50 mx-auto max-w-lg rounded-[1.75rem] border border-slate-100 bg-white p-4 shadow-2xl shadow-slate-300 sm:inset-x-auto sm:top-5 sm:right-5 sm:bottom-auto sm:w-[26rem]">
      <p className="text-base font-bold leading-relaxed text-slate-600">
        Мы используем технические cookies для работы сайта, авторизации и
        безопасности. Продолжая пользоваться сайтом, вы соглашаетесь с их
        использованием.
      </p>
      <div className="mt-4 flex items-center justify-between gap-3">
        <Link
          href="/privacy"
          className="text-sm font-black text-orange-600 transition-colors hover:text-orange-700"
        >
          Подробнее
        </Link>
        <AppButton type="button" onClick={acceptNotice} className="px-5">
          Понятно
        </AppButton>
      </div>
    </div>
  );
}
