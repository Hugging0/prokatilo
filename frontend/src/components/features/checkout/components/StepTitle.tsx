export function StepTitle({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div>
      <h2 className="text-3xl font-black leading-tight tracking-tight text-slate-900">
        {title}
      </h2>
      <p className="mt-3 text-base font-bold leading-relaxed text-slate-500">
        {subtitle}
      </p>
    </div>
  );
}
