import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  /** Center below md; left-aligned from md up (e.g. /news hero). */
  centerMobileOnly?: boolean;
};

/** Centers the red Share pill — same spacing as /live and home2 hero. */
export default function LiveStreamShareRow({
  children,
  className = "",
  centerMobileOnly = false,
}: Props) {
  const outerAlign = centerMobileOnly
    ? "justify-center text-center md:justify-start md:text-left"
    : "justify-center text-center";
  const innerAlign = centerMobileOnly
    ? "flex w-full justify-center md:w-auto md:justify-start"
    : "mx-auto flex justify-center";

  return (
    <div
      className={`mt-5 flex w-full items-center md:mt-6 ${outerAlign} ${className}`.trim()}
    >
      <div className={innerAlign}>{children}</div>
    </div>
  );
}
