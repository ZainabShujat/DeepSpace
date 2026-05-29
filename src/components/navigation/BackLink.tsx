import Link from "next/link";

type BackLinkProps = {
  href: string;
  label?: string;
  className?: string;
};

export default function BackLink({ href, label = "Back", className = "" }: BackLinkProps) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2 rounded-full border border-black/15 bg-white/85 px-4 py-2 text-sm font-semibold text-black shadow-sm backdrop-blur transition hover:bg-white ${className}`.trim()}
    >
      <span aria-hidden="true">←</span>
      <span>{label}</span>
    </Link>
  );
}