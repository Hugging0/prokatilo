export function AppDeepLinkLoading() {
  return (
    <main className="min-h-screen animate-pulse bg-slate-50 pb-28">
      <div className="h-[330px] rounded-b-[2.5rem] bg-white px-8 pb-8 pt-16">
        <div className="mx-auto h-full max-w-sm rounded-[2rem] bg-slate-100" />
      </div>
      <div className="relative z-10 -mt-8 px-6">
        <div className="mx-auto max-w-lg rounded-[2rem] border border-slate-100 bg-white p-6 shadow-xl shadow-slate-200/60">
          <div className="h-3 w-24 rounded-full bg-slate-200" />
          <div className="mt-4 h-9 w-3/4 rounded-xl bg-slate-200" />
          <div className="mt-5 h-4 w-full rounded-full bg-slate-100" />
          <div className="mt-2 h-4 w-5/6 rounded-full bg-slate-100" />
          <p className="mt-7 text-sm font-black text-slate-400">Загружаем вещь…</p>
        </div>
      </div>
    </main>
  );
}
