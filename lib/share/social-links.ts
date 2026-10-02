export type SocialNetwork =
  | "whatsapp"
  | "facebook"
  | "x"
  | "linkedin"
  | "telegram"
  | "email";

export type SocialShareLink = {
  key: SocialNetwork;
  label: string;
  href: string;
};

export function buildSocialShareLinks({
  url,
  title,
  text,
}: {
  url: string;
  title: string;
  text?: string | null;
}): SocialShareLink[] {
  const trimmedText = (text || title).trim();
  const bodyLine = trimmedText ? `${trimmedText}\n\n${url}` : url;
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedText = encodeURIComponent(trimmedText);
  const encodedBody = encodeURIComponent(bodyLine);
  const waText = encodeURIComponent(
    trimmedText ? `${trimmedText} ${url}` : `${title} ${url}`,
  );

  return [
    {
      key: "whatsapp",
      label: "WhatsApp",
      href: `https://wa.me/?text=${waText}`,
    },
    {
      key: "facebook",
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`,
    },
    {
      key: "x",
      label: "X",
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`,
    },
    {
      key: "linkedin",
      label: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    },
    {
      key: "telegram",
      label: "Telegram",
      href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
    },
    {
      key: "email",
      label: "Email",
      href: `mailto:?subject=${encodedTitle}&body=${encodedBody}`,
    },
  ];
}
