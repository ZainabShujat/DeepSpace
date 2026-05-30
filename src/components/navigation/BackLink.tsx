"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

type BackLinkProps = {
  href?: string;
  label?: string;
  className?: string;
};

export default function BackLink({ href, label = "Back", className = "" }: BackLinkProps) {
  const router = useRouter();

  const baseClass = `inline-flex items-center gap-2 rounded-full border border-black/15 bg-white/85 px-4 py-2 text-sm font-semibold text-black shadow-sm backdrop-blur transition hover:bg-white ${className}`.trim();

  if (href) {
    return (
      <Link href={href} className={baseClass}>
        <span aria-hidden="true">←</span>
        <span>Back</span>
      </Link>
    );
  }

  const handleBack = () => {
    if (typeof window !== "undefined") {
      if (window.history.length > 1) {
        router.back();
        return;
      }
    }

    router.push("/explore");
  };

  return (
    <button onClick={handleBack} className={baseClass}>
      <span aria-hidden="true">←</span>
      <span>Back</span>
    </button>
  );
}