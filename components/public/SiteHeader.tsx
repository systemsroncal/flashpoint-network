import Link from "next/link";

export default function SiteHeader() {
  return (
    <header className="border-b border-white/10 bg-[#001F3F] text-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-xl font-semibold tracking-tight">
          FP Network
        </Link>
        <nav className="flex items-center gap-4 text-sm text-white/80">
          <Link href="/" className="hover:text-white">
            Home
          </Link>
          <Link href="/admin" className="hover:text-white">
            Admin
          </Link>
        </nav>
      </div>
    </header>
  );
}
