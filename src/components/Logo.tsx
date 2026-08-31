import { cn } from "@/lib/utils";

/**
 * Aproximación tipográfica del logotipo de Godoyecom (verde #b7ef10 / negro
 * #1a1a1a / blanco #feffff), a partir del manual de marca. Si cuentan con el
 * archivo original del logo (SVG o PNG), lo ideal es reemplazar este
 * componente por esa imagen para un resultado 1:1.
 */
export function LogoWordmark({
  className,
  onDark = true,
}: {
  className?: string;
  onDark?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-baseline font-extrabold tracking-tight leading-none",
        className
      )}
    >
      <span className="text-brand-green">G</span>
      <span className={onDark ? "text-white" : "text-brand-black"}>odoy</span>
      <span className="text-brand-green">ecom</span>
      <span className="text-brand-green">.</span>
    </span>
  );
}

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-lg bg-brand-black font-black text-brand-green select-none",
        className
      )}
      aria-hidden
    >
      G
    </span>
  );
}
