"use client";

import { Box, Chip, Link as MuiLink, Stack, Typography } from "@mui/material";
import { normalizePublicUrl } from "@/lib/env";

export type NewsCardPreviewProps = {
  title: string;
  slug: string;
  excerpt: string;
  featuredImageUrl: string;
  categoryName?: string | null;
  status: string;
  isFeatured: boolean;
  isPremium: boolean;
  isVideo: boolean;
  isPodcast: boolean;
  isPopular: boolean;
  siteUrl: string;
  publicHref?: string | null;
};

function homeSlots(flags: {
  isFeatured: boolean;
  isPremium: boolean;
  isVideo: boolean;
  isPodcast: boolean;
  isPopular: boolean;
  status: string;
}): string[] {
  if (flags.status !== "published") {
    return ["Not on home (not published)"];
  }
  const slots: string[] = [];
  slots.push("Latest News (by publish date)");
  if (flags.isFeatured) slots.push("Featured badge");
  if (flags.isPodcast) slots.push("Podcasts");
  if (flags.isVideo) slots.push("Must-Watch");
  if (flags.isPremium) slots.push("Exclusives");
  if (flags.isPopular) slots.push("Popular");
  return slots.length ? slots : ["Published feed"];
}

export default function NewsCardPreview({
  title,
  slug,
  excerpt,
  featuredImageUrl,
  categoryName,
  status,
  isFeatured,
  isPremium,
  isVideo,
  isPodcast,
  isPopular,
  siteUrl,
  publicHref,
}: NewsCardPreviewProps) {
  const displayTitle = title.trim() || "Untitled story";
  const category = (categoryName || "News").toUpperCase();
  const slots = homeSlots({
    isFeatured,
    isPremium,
    isVideo,
    isPodcast,
    isPopular,
    status,
  });
  const origin = (() => {
    try {
      return new URL(normalizePublicUrl(siteUrl)).origin.replace(/\/$/, "");
    } catch {
      return siteUrl.replace(/\/$/, "") || "";
    }
  })();
  const link =
    publicHref ||
    (slug ? `${origin}/news/${slug}` : null);

  return (
    <Box
      sx={{
        position: { md: "sticky" },
        top: { md: 88 },
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        bgcolor: "background.paper",
        p: 2,
      }}
    >
      <Typography variant="subtitle2" fontWeight={700} gutterBottom>
        Live card preview
      </Typography>
      <Typography variant="caption" color="text.secondary" display="block" mb={1.5}>
        How this story reads on home cards (updates as you type).
      </Typography>

      <Box
        sx={{
          borderRadius: 1.5,
          overflow: "hidden",
          bgcolor: "grey.100",
          aspectRatio: "16 / 10",
          mb: 1.5,
        }}
      >
        {featuredImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <Box
            component="img"
            src={featuredImageUrl}
            alt=""
            sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        ) : (
          <Stack
            alignItems="center"
            justifyContent="center"
            sx={{ height: "100%", px: 2 }}
          >
            <Typography variant="caption" color="text.secondary" textAlign="center">
              Add a featured image to fill the card
            </Typography>
          </Stack>
        )}
      </Box>

      <Typography
        variant="caption"
        sx={{
          color: "error.main",
          fontWeight: 600,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
        }}
      >
        {category}
      </Typography>
      <Typography
        variant="subtitle1"
        fontWeight={800}
        sx={{ mt: 0.5, lineHeight: 1.25, fontFamily: "Georgia, Times New Roman, serif" }}
      >
        {displayTitle}
      </Typography>
      {excerpt.trim() ? (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, lineHeight: 1.45 }}>
          {excerpt.trim().length > 140
            ? `${excerpt.trim().slice(0, 137)}…`
            : excerpt.trim()}
        </Typography>
      ) : (
        <Typography variant="body2" color="text.disabled" sx={{ mt: 1 }}>
          Excerpt appears under the title on some cards.
        </Typography>
      )}

      <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ mt: 1.5 }}>
        <Chip size="small" label={status} variant="outlined" />
        {isFeatured ? <Chip size="small" color="primary" label="Featured" /> : null}
        {isPremium ? <Chip size="small" label="Exclusive" /> : null}
        {isVideo ? <Chip size="small" label="Video" /> : null}
        {isPodcast ? <Chip size="small" label="Podcast" /> : null}
      </Stack>

      <Box sx={{ mt: 2 }}>
        <Typography variant="caption" color="text.secondary" fontWeight={600} display="block">
          Home sections
        </Typography>
        <Typography variant="body2" sx={{ mt: 0.5 }}>
          {slots.join(" · ")}
        </Typography>
      </Box>

      {link ? (
        <MuiLink
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          variant="body2"
          sx={{ mt: 1.5, display: "inline-block", wordBreak: "break-all" }}
        >
          {status === "published" ? "Open public page →" : "Public URL (after publish) →"}
        </MuiLink>
      ) : null}
    </Box>
  );
}
