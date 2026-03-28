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
    <div className="soft-card p-7 md:p-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          {eyebrow && <p className="page-eyebrow">{eyebrow}</p>}
          <h2 className="title-1 mt-4">{title}</h2>
          {description && <p className="mt-2 max-w-2xl text-[15px] text-[var(--text-secondary)]">{description}</p>}
        </div>
        {action && <div className="flex flex-wrap gap-2">{action}</div>}
      </div>
    </div>
  );
}
