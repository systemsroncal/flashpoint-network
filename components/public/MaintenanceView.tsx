import Image from "next/image";

type Props = {
  message?: string;
};

const DEFAULT_BODY = (
  <>
    <p className="font-bold uppercase tracking-[-0.02em]">
      The new digital home of FlashPoint Television Network
    </p>
    <p className="mt-4">
      <span className="font-bold">24 hours a day. 7 days a week. One growing network.</span>
      <br />
      FlashPoint Television Network is more than news. It is a destination for{" "}
      <span className="font-bold">
        faith, culture, commentary, ministry, original programming, live shows,
        interviews, teaching, and voices shaping the conversation across America.
      </span>
    </p>
    <p className="mt-4">
      Watch FlashPoint Live, discover programs from ministries and leaders across
      the nation, explore exclusive interviews and original content, and stay
      connected to a growing network built to inform, inspire, and equip.
    </p>
    <p className="mt-4">
      From television and broadcast stations to{" "}
      <span className="font-bold">
        Roku, Xfinity, streaming platforms, YouTube, Rumble, and more,
      </span>{" "}
      FPTN is expanding everywhere people watch.
    </p>
    <p className="mt-4 font-bold">
      And now, for the first time, everything is coming together in one digital
      home.
    </p>
    <p className="mt-4 font-bold">
      Programming. News. Shows. Ministries. Commentary. Exclusive Content. Ways
      to Watch.
      <br />
      FlashPoint Television Network is coming alive.
    </p>
    <p className="mt-4 font-bold">Stay tuned. The next chapter begins here.</p>
  </>
);

/**
 * Full-bleed Coming Soon / maintenance screen from Figma 221:4472.
 */
export default function MaintenanceView({ message }: Props) {
  return (
    <div
      className="relative isolate flex min-h-screen flex-col overflow-hidden bg-[#05070f] text-white"
      data-node-id="221:4472"
    >
      {/* Background */}
      <div className="pointer-events-none absolute inset-0">
        <Image
          src="/brand/maintenance/coming-soon-bg.png"
          alt=""
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/56" />
      </div>

      {/* Watermark */}
      <p
        aria-hidden
        className="pointer-events-none absolute bottom-[4%] left-[-2%] z-0 max-w-[min(90vw,580px)] font-article text-[clamp(3.5rem,12vw,7.75rem)] font-black leading-none tracking-[-0.01em] text-white/[0.09]"
      >
        Coming Soon
      </p>

      <div className="relative z-10 mx-auto flex w-full max-w-[1166px] flex-1 flex-col items-center px-4 pb-16 pt-10 sm:pt-14 md:pt-[6.5rem]">
        {/* Logo lockup — Flash Point badge + NETWORK bar (not a link) */}
        <div
          className="flex w-[min(100%,256px)] flex-col overflow-hidden rounded-[6px] border-[4px] border-white bg-black"
          aria-label="Flash Point Network"
        >
          <span className="relative flex h-[134px] items-center justify-center bg-black px-3">
            <Image
              src="/brand/maintenance/fpn-logo-lockup.svg"
              alt="Flash Point"
              width={216}
              height={103}
              className="h-[88px] w-auto sm:h-[103px]"
              priority
            />
          </span>
          <span className="bg-[var(--fpn-rojo)] py-2 text-center text-[clamp(0.85rem,2.5vw,1.05rem)] font-bold uppercase tracking-[0.55em] text-white">
            Network
          </span>
        </div>

        <h1 className="mt-8 text-center font-article text-[clamp(2.25rem,6vw,3.35rem)] font-black leading-tight tracking-[-0.01em] text-white md:mt-10">
          COMING SOON
        </h1>

        <div className="mt-6 max-w-[1166px] text-center font-[family-name:var(--font-roboto)] text-[clamp(0.95rem,2.2vw,1.3125rem)] leading-[1.45] tracking-[-0.02em] text-white sm:mt-8">
          {message?.trim() ? (
            <p className="whitespace-pre-wrap font-bold">{message.trim()}</p>
          ) : (
            DEFAULT_BODY
          )}
        </div>
      </div>
    </div>
  );
}
