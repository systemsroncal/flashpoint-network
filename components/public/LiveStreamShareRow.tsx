import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
};

/** Centers the red Share pill — same spacing as /live and home2 hero. */
export default function LiveStreamShareRow({ children, className = "" }: Props) {
  return (
    <div
      className={`mt-5 flex w-full justify-center md:mt-6 ${className}`.trim()}
    >
      {children}
    </div>
  );
}
