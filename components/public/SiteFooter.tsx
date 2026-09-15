export default function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-[#001F3F]/10 bg-[#F7F8FA]">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-[#5A6A85] sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} Flash Point Network</p>
        <p>Digital newspaper platform — Phase 1 scaffold</p>
      </div>
    </footer>
  );
}
