export const LIVE_HEADLINE = "Watch FlashPoint Television Network Live";
export const LIVE_DESCRIPTION = "Programming changes throughout the day.";

export default function LiveHeroCopy() {
  return (
    <div className="w-full md:flex-1 md:max-w-[602px]">
      <h1 className="max-w-xl font-article text-[1.75rem] font-bold leading-[1.15] tracking-tight text-white md:text-[2.75rem]">
        {LIVE_HEADLINE}
      </h1>
      <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-white/80 md:mt-4 md:text-[17px]">
        {LIVE_DESCRIPTION}
      </p>
    </div>
  );
}
