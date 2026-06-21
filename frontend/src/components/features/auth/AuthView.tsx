import { useState, type FormEvent } from "react";
import { ChevronRight, Lock, Mail, Phone, ShoppingBag, User } from "lucide-react";
import Link from "next/link";

import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { BRAND_LOGO_CLASS } from "@/lib/brand";
import { UI_COPY } from "@/lib/copy";

interface AuthViewProps {
  mode: "login" | "register";
  onModeChange: (mode: "login" | "register") => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export function AuthView({
  mode,
  onModeChange,
  onSubmit,
}: AuthViewProps) {
  const isRegister = mode === "register";
  const [hasAcceptedLegalTerms, setHasAcceptedLegalTerms] = useState(false);
  const [showLegalError, setShowLegalError] = useState(false);

  const handleModeChange = (nextMode: "login" | "register") => {
    setShowLegalError(false);
    onModeChange(nextMode);
  };

  return (
    <main className="flex min-h-screen items-start justify-center bg-gradient-to-b from-white to-slate-50 px-5 pt-10 pb-[calc(8rem+env(safe-area-inset-bottom))] sm:items-center sm:p-6">
      <AppCard variant="hero" className="w-full max-w-sm p-8">
        <div className="mb-8 flex size-24 rotate-3 items-center justify-center rounded-[2rem] bg-gradient-to-br from-amber-400 to-rose-600 text-white shadow-2xl shadow-rose-200">
          <ShoppingBag size={42} strokeWidth={2.5} />
        </div>

        <h1
          className={`text-5xl ${BRAND_LOGO_CLASS} text-rose-500 mb-2 leading-none`}
        >
          ПРОКАТило
        </h1>

        <p className="mb-8 text-xs font-black uppercase tracking-widest text-slate-400">
          {UI_COPY.auth.subtitle}
        </p>

        <div className="mb-5 grid grid-cols-2 rounded-3xl bg-slate-50 p-1">
          {[
            ["login", UI_COPY.auth.loginTab],
            ["register", UI_COPY.auth.registerTab],
          ].map(([nextMode, label]) => (
            <button
              key={nextMode}
              type="button"
              onClick={() => handleModeChange(nextMode as "login" | "register")}
              className={`rounded-2xl py-3 text-xs font-black ${
                mode === nextMode
                  ? "bg-slate-900 text-white shadow-lg"
                  : "text-slate-400"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <form
          onSubmit={(event) => {
            if (isRegister && !hasAcceptedLegalTerms) {
              event.preventDefault();
              setShowLegalError(true);
              return;
            }

            onSubmit(event);
          }}
          className="space-y-4"
        >
          {isRegister && (
            <div className="relative">
              <User
                size={18}
                className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                name="name"
                type="text"
                placeholder={UI_COPY.auth.namePlaceholder}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl py-5 pl-14 pr-6 font-bold text-slate-700 outline-none focus:border-rose-500 transition-all"
              />
            </div>
          )}

          <div className="relative">
            <Mail
              size={18}
              className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              name="email"
              type="email"
              placeholder={UI_COPY.auth.emailPlaceholder}
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl py-5 pl-14 pr-6 font-bold text-slate-700 outline-none focus:border-rose-500 transition-all"
            />
          </div>

          <div className="relative">
            <Lock
              size={18}
              className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              name="password"
              type="password"
              placeholder={UI_COPY.auth.passwordPlaceholder}
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl py-5 pl-14 pr-6 font-bold text-slate-700 outline-none focus:border-rose-500 transition-all"
            />
          </div>

          {isRegister && (
            <div className="relative">
              <Phone
                size={18}
                className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                name="phone"
                type="tel"
                placeholder={UI_COPY.auth.phonePlaceholder}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl py-5 pl-14 pr-6 font-bold text-slate-700 outline-none focus:border-rose-500 transition-all"
              />
            </div>
          )}

          {isRegister && (
            <div className="rounded-3xl border border-slate-100 bg-slate-50 p-4">
              <label className="flex items-start gap-3">
                <input
                  name="legal_terms"
                  type="checkbox"
                  checked={hasAcceptedLegalTerms}
                  onChange={(event) => {
                    setHasAcceptedLegalTerms(event.target.checked);
                    if (event.target.checked) setShowLegalError(false);
                  }}
                  className="mt-1 size-5 rounded border-slate-300 accent-orange-500"
                />
                <span className="text-sm font-bold leading-relaxed text-slate-600">
                  Я принимаю{" "}
                  <Link
                    href="/terms"
                    className="font-black text-orange-600 hover:text-orange-700"
                  >
                    Пользовательское соглашение
                  </Link>{" "}
                  и даю{" "}
                  <Link
                    href="/consent"
                    className="font-black text-orange-600 hover:text-orange-700"
                  >
                    согласие на обработку персональных данных
                  </Link>{" "}
                  в соответствии с{" "}
                  <Link
                    href="/privacy"
                    className="font-black text-orange-600 hover:text-orange-700"
                  >
                    Политикой обработки персональных данных
                  </Link>
                  .
                </span>
              </label>
              {showLegalError && (
                <p className="mt-3 text-sm font-bold leading-relaxed text-slate-400">
                  {UI_COPY.legal.registrationAgreementHint}
                </p>
              )}
            </div>
          )}

          <AppButton
            type="submit"
            fullWidth
            className="bg-slate-900 shadow-slate-200"
          >
            {isRegister ? UI_COPY.auth.registerButton : UI_COPY.auth.loginButton}
            <ChevronRight size={20} />
          </AppButton>
        </form>
      </AppCard>
    </main>
  );
}
