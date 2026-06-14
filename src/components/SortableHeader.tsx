export type SortDir = "asc" | "desc";

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) {
    return (
      <svg className="ml-1 inline h-3 w-3 opacity-30" viewBox="0 0 10 14" fill="currentColor" aria-hidden="true">
        <path d="M5 0L10 5H0z" />
        <path d="M5 14L0 9H10z" />
      </svg>
    );
  }
  return (
    <svg className="ml-1 inline h-3 w-3 text-f1-red" viewBox="0 0 10 6" fill="currentColor" aria-hidden="true">
      {dir === "asc" ? <path d="M5 0L10 6H0z" /> : <path d="M5 6L0 0H10z" />}
    </svg>
  );
}

interface SortableHeaderProps {
  label: string;
  active: boolean;
  dir: SortDir;
  onSort: () => void;
  className?: string;
  align?: "left" | "right";
}

/**
 * A sortable table header rendered as a real <button> inside the <th>, so it's
 * keyboard-operable and announces its sort state to assistive tech.
 */
export default function SortableHeader({
  label,
  active,
  dir,
  onSort,
  className = "",
  align = "left",
}: SortableHeaderProps) {
  return (
    <th
      className={`px-3 py-2.5 whitespace-nowrap text-xs uppercase tracking-wider ${className}`}
      aria-sort={active ? (dir === "asc" ? "ascending" : "descending") : "none"}
    >
      <button
        type="button"
        onClick={onSort}
        className={`flex w-full select-none items-center gap-0.5 transition-colors hover:text-f1-text focus:outline-none focus-visible:text-f1-red ${
          align === "right" ? "justify-end" : ""
        }`}
      >
        <span>{label}</span>
        <SortIcon active={active} dir={dir} />
      </button>
    </th>
  );
}
