import { formatPrice } from "@/lib/booking-utils";
import { cn } from "@/lib/utils";

export function PriceDisplay({
  price,
  className,
}: {
  price: number;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "font-price text-2xl font-semibold text-gold tabular-nums",
        className
      )}
    >
      {formatPrice(price)}
    </span>
  );
}
