"use client";

import Image from "next/image";
import {
  Check,
  EllipsisVertical,
  PlusSquare,
  Share,
  Smartphone,
  X,
} from "lucide-react";
import { useEffect, useRef } from "react";

import { AppButton } from "@/components/ui/AppButton";
import {
  type InstallPlatform,
  useInstallAppPrompt,
} from "@/hooks/use-install-app-prompt";

interface InstallStep {
  icon: typeof Share;
  text: string;
}

const INSTALL_STEPS: Record<InstallPlatform, InstallStep[]> = {
  ios: [
    { icon: Share, text: "Нажмите «Поделиться» в панели Safari" },
    { icon: PlusSquare, text: "Выберите «На экран „Домой“»" },
    { icon: Check, text: "Нажмите «Добавить»" },
  ],
  android: [
    { icon: EllipsisVertical, text: "Откройте меню браузера" },
    {
      icon: PlusSquare,
      text: "Выберите «Установить приложение» или «Добавить на главный экран»",
    },
    { icon: Check, text: "Подтвердите установку" },
  ],
};

export function InstallAppPrompt() {
  const { canInstallDirectly, dismiss, install, isOpen, platform } =
    useInstallAppPrompt();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") dismiss();
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [dismiss, isOpen]);

  if (!isOpen || !platform) return null;

  const showManualSteps = platform === "ios" || !canInstallDirectly;
  const steps = INSTALL_STEPS[platform];

  return (
    <div
      className="install-prompt-backdrop fixed inset-0 z-[60] flex items-end bg-slate-950/45 sm:items-center sm:justify-center sm:p-6"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) dismiss();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="install-app-title"
        aria-describedby="install-app-description"
        className="install-prompt-sheet max-h-[calc(100dvh-1rem)] w-full overflow-y-auto rounded-t-[1.75rem] bg-white px-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-5 shadow-2xl sm:max-w-md sm:rounded-[1.75rem] sm:p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <Image
              src="/icons/apple-touch-icon.png"
              alt=""
              width={56}
              height={56}
              className="size-14 shrink-0 rounded-2xl"
              priority
            />
            <div className="min-w-0">
              <p className="text-sm font-black text-orange-600">
                Быстрый доступ
              </p>
              <p className="mt-0.5 truncate text-base font-black text-slate-950">
                ПРОКАТило
              </p>
            </div>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={dismiss}
            className="flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 transition hover:bg-slate-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 active:scale-95"
            aria-label="Закрыть подсказку"
          >
            <X size={19} aria-hidden="true" />
          </button>
        </div>

        <div className="mt-5">
          <h2
            id="install-app-title"
            className="text-2xl font-black leading-tight tracking-tight text-slate-950 text-balance"
          >
            Добавьте приложение на экран «Домой»
          </h2>
          <p
            id="install-app-description"
            className="mt-2 text-base font-bold leading-relaxed text-slate-600 text-pretty"
          >
            Каталог и ваши брони будут открываться в одно касание.
          </p>
        </div>

        {showManualSteps ? (
          <ol className="mt-5 divide-y divide-slate-100 border-y border-slate-100">
            {steps.map(({ icon: Icon, text }, index) => (
              <li key={text} className="flex items-center gap-4 py-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
                  <Icon size={20} strokeWidth={2.2} aria-hidden="true" />
                </span>
                <p className="min-w-0 flex-1 text-base font-black leading-snug text-slate-800">
                  {text}
                </p>
                <span className="text-sm font-black tabular-nums text-slate-400">
                  {index + 1}
                </span>
              </li>
            ))}
          </ol>
        ) : (
          <div className="mt-5 flex items-center gap-4 rounded-2xl bg-orange-50 p-4 text-orange-950">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-white text-orange-600 shadow-sm">
              <Smartphone size={21} aria-hidden="true" />
            </span>
            <p className="text-sm font-bold leading-relaxed">
              Android откроет системное окно установки. Подтвердите добавление
              приложения.
            </p>
          </div>
        )}

        <div className="mt-5 flex flex-col gap-2">
          {platform === "android" && canInstallDirectly ? (
            <AppButton type="button" onClick={() => void install()} fullWidth>
              <Smartphone size={19} aria-hidden="true" />
              Установить приложение
            </AppButton>
          ) : (
            <AppButton type="button" onClick={dismiss} fullWidth>
              Понятно
            </AppButton>
          )}
          <AppButton type="button" variant="ghost" onClick={dismiss} fullWidth>
            Не сейчас
          </AppButton>
        </div>
      </section>
    </div>
  );
}
