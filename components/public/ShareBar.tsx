"use client";

import Image from "next/image";

type Props = {
  title: string;
  urlPath: string;
  orientation?: "vertical" | "horizontal";
};

const ITEMS = [
  { key: "linkedin", label: "Linkedin", icon: "/brand/share/linkedin.svg" },
  { key: "threads", label: "Threads", icon: "/brand/share/threads.svg" },
  { key: "facebook", label: "Facebook", icon: "/brand/share/facebook.svg" },
  { key: "x", label: "X", icon: "/brand/share/x.svg" },
  { key: "share", label: "Share", icon: "/brand/share/share.svg" },
  { key: "print", label: "Print", icon: "/brand/share/print.svg" },
] as const;

export default function ShareBar({
  title,
  urlPath,
  orientation = "horizontal",
}: Props) {
  const onClick = async (key: (typeof ITEMS)[number]["key"]) => {
    const absoluteUrl = `${window.location.origin}${urlPath}`;
    const encoded = encodeURIComponent(absoluteUrl);
    const text = encodeURIComponent(title);
    if (key === "print") {
      window.print();
      return;
    }
    if (key === "share" && navigator.share) {
      try {
        await navigator.share({ title, url: absoluteUrl });
      } catch {
        /* dismissed */
      }
      return;
    }
    const map: Record<string, string> = {
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encoded}`,
      threads: `https://www.threads.net/intent/post?text=${text}%20${encoded}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encoded}`,
      x: `https://twitter.com/intent/tweet?url=${encoded}&text=${text}`,
      share: absoluteUrl,
    };
    const href = map[key];
    if (!href) return;
    if (key === "share") {
      try {
        await navigator.clipboard.writeText(absoluteUrl);
      } catch {
        /* ignore */
      }
      return;
    }
    window.open(href, "_blank", "noopener,noreferrer");
  };

  if (orientation === "vertical") {
    return (
      <div className="flex flex-col gap-3">
        <p className="font-article text-[1.35rem] font-black tracking-tight text-black">
          Share
        </p>
        <ul className="flex flex-col gap-1">
          {ITEMS.map((item) => (
            <li key={item.key}>
              <button
                type="button"
                onClick={() => onClick(item.key)}
                className="inline-flex items-center gap-3 py-1.5 text-[15px] font-medium text-black hover:text-[var(--fpn-rojo)]"
              >
                <Image src={item.icon} alt="" width={18} height={18} />
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div>
      <p className="font-article text-[1.35rem] font-black tracking-tight text-black">
        Share
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2">
        {ITEMS.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => onClick(item.key)}
            className="inline-flex items-center gap-2.5 text-[15px] font-medium text-black hover:text-[var(--fpn-rojo)]"
          >
            <Image src={item.icon} alt="" width={18} height={18} />
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
