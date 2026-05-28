import type { FormEvent } from "react";
import { ChevronRight, Lock, Mail, Phone, ShoppingBag, User } from "lucide-react";

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

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-slate-50 flex items-center justify-center p-6">
      <section className="w-full max-w-sm bg-white rounded-[2.5rem] p-8 shadow-2xl shadow-slate-200/70 border border-slate-100">
        <div className="w-24 h-24 bg-gradient-to-br from-amber-400 to-rose-600 rounded-[2.5rem] flex items-center justify-center text-white shadow-2xl shadow-rose-200 mb-8 rotate-3">
          <ShoppingBag size={42} strokeWidth={2.5} />
        </div>

        <h1
          className={`text-5xl ${BRAND_LOGO_CLASS} text-rose-500 mb-2 leading-none`}
        >
          ПРОКАТило
        </h1>

        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-8">
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
              onClick={() => onModeChange(nextMode as "login" | "register")}
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

        <form onSubmit={onSubmit} className="space-y-4">
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

          <button
            type="submit"
            className="w-full bg-slate-900 text-white py-5 rounded-3xl font-black text-lg shadow-xl shadow-slate-200 active:scale-95 transition-transform flex items-center justify-center gap-3"
          >
            {isRegister ? UI_COPY.auth.registerButton : UI_COPY.auth.loginButton}
            <ChevronRight size={20} />
          </button>
        </form>
      </section>
    </main>
  );
}
