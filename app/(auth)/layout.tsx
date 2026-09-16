import Image from "next/image";
import Link from "next/link";

/**
 * Auth shell must never throw — a layout failure would skip (auth)/error.tsx
 * and paint the global "Couldn't load this page" boundary.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      data-auth-shell
      className="relative flex min-h-dvh min-h-screen min-h-[100lvh] flex-1 flex-col bg-[#001428] bg-[linear-gradient(160deg,#001428_0%,#0a2744_45%,#132f4a_100%)] text-white"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        aria-hidden
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, #e85d04 0%, transparent 40%), radial-gradient(circle at 80% 0%, #1b2a64 0%, transparent 35%)",
        }}
      />
      <header className="relative z-10 mx-auto flex w-full max-w-lg items-center justify-between px-4 py-6">
        <Link href="/" className="inline-flex items-center gap-3">
          <span className="flex w-[96px] flex-col overflow-hidden rounded-[3px] border-2 border-white bg-black">
            <span className="relative flex h-12 items-center justify-center bg-black px-2">
              <Image
                src="/brand/fpn-logo-mark.svg"
                alt="Flash Point"
                width={88}
                height={40}
                className="h-9 w-auto"
                priority
              />
            </span>
            <span className="bg-[var(--fpn-rojo)] py-0.5 text-center text-[9px] font-bold uppercase tracking-[0.3em] text-white">
              Network
            </span>
          </span>
        </Link>
        <Link
          href="/"
          className="text-sm font-semibold text-white/80 underline-offset-4 hover:text-white hover:underline"
        >
          Back to site
        </Link>
      </header>
      <main className="relative z-10 mx-auto flex w-full max-w-lg flex-1 flex-col px-4 pb-16">
        {children}
      </main>
    </div>
  );
}
