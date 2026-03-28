export default function PageHeader({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: React.ReactNode; }) {
  return (
    <div className="premium-panel mb-8 overflow-hidden p-6 sm:p-7 md:mb-10 md:p-8">
      <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(41,88,214,.45),rgba(17,122,101,.35),transparent)]" />
      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          {eyebrow && <p className="page-eyebrow">{eyebrow}</p>}
          <h1 className="title-1 max-w-3xl text-[var(--text-primary)]">{title}</h1>
          {description && <p className="subhead mt-2 max-w-2xl">{description}</p>}
        </div>
        {action && <div className="flex flex-shrink-0 flex-wrap gap-2">{action}</div>}
      </div>
    </div>
  );
}
