interface SectionHeaderProps {
  label?: string;
  title: string;
  description?: string;
  light?: boolean; // ダーク背景上での使用
  center?: boolean;
}

export function SectionHeader({
  label,
  title,
  description,
  light = false,
  center = false,
}: SectionHeaderProps) {
  const textColor = light ? "text-[var(--paper)]" : "text-[var(--ink)]";
  const labelColor = light ? "text-[var(--light-muted)]" : "text-[var(--philo-muted)]";
  const descColor = light ? "text-[var(--light-muted)]" : "text-[var(--philo-muted)]";
  const alignClass = center ? "text-center items-center" : "";

  return (
    <div className={`flex flex-col gap-3 ${alignClass}`}>
      {label && (
        <span
          className={`text-xs font-semibold uppercase tracking-[0.25em] ${labelColor}`}
          style={{ fontFamily: '"Noto Serif JP", serif' }}
        >
          {label}
        </span>
      )}
      <h2
        className={`text-3xl md:text-4xl font-semibold leading-tight ${textColor}`}
        style={{ fontFamily: '"Shippori Mincho", serif' }}
      >
        {title}
      </h2>
      <div
        className="w-[60px] h-[3px] rounded-full"
        style={{ backgroundColor: "var(--accent)" }}
      />
      {description && (
        <p className={`text-sm leading-relaxed max-w-xl ${descColor}`}>{description}</p>
      )}
    </div>
  );
}
