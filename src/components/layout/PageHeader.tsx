export default function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-8 md:mb-10">
      <div className="min-w-0">
        {eyebrow && <p className="page-eyebrow">{eyebrow}</p>}
        <h1 className="title-1 text-[var(--text-primary)]">{title}</h1>
        {description && <p className="subhead mt-1.5 max-w-2xl">{description}</p>}
      </div>
      {action && <div className="flex flex-shrink-0 gap-2">{action}</div>}
    </div>
  );
}
