"use client";

import { Box, Button, Stack, TextField, Typography } from "@mui/material";
import ImageUploadField from "@/components/admin/shared/ImageUploadField";
import { saveSiteIdentitySettingsAction } from "@/lib/admin/actions";
import type { SiteIdentity } from "@/lib/site-identity/constants";
import LogoSizingFields from "@/components/admin/settings/LogoSizingFields";

const LOGO_ACCEPT =
  "image/jpeg,image/png,image/webp,image/gif,image/avif,image/svg+xml,.svg";

export default function SiteIdentityPanel({ identity }: { identity: SiteIdentity }) {
  return (
    <Box component="form" action={saveSiteIdentitySettingsAction}>
      <Stack spacing={3}>
        <TextField
          name="site_name"
          label="Site name"
          fullWidth
          required
          defaultValue={identity.siteName}
          helperText="Used in titles, header alt text, and footer."
        />

        <ImageUploadField
          name="header_logo_url"
          label="Header logo"
          defaultValue={identity.headerLogoUrl}
          accept={LOGO_ACCEPT}
        />
        <Typography variant="caption" color="text.secondary" sx={{ mt: -1.5 }}>
          Shown in the site header (desktop and mobile, left of the menu on small screens).
          SVG uploads are kept as vector files (not converted to WebP).
        </Typography>
        <LogoSizingFields
          prefix="header"
          label="Header logo"
          widths={identity.headerLogoMaxWidth}
          classNameDefault={identity.headerLogoClassName}
        />

        <ImageUploadField
          name="footer_logo_url"
          label="Footer logo"
          defaultValue={identity.footerLogoUrl ?? ""}
          accept={LOGO_ACCEPT}
        />
        <Typography variant="caption" color="text.secondary" sx={{ mt: -1.5 }}>
          Leave empty to use the default FlashPoint Television lockup in the footer.
        </Typography>
        <LogoSizingFields
          prefix="footer"
          label="Footer logo"
          widths={identity.footerLogoMaxWidth}
          classNameDefault={identity.footerLogoClassName}
        />

        <ImageUploadField
          name="auth_logo_url"
          label="Login / Register logo"
          defaultValue={identity.authLogoUrl ?? ""}
          accept={LOGO_ACCEPT}
        />
        <Typography variant="caption" color="text.secondary" sx={{ mt: -1.5 }}>
          Login, register, and password pages. Leave empty to use the header logo
          inside the badge lockup.
        </Typography>

        <ImageUploadField
          name="favicon_url"
          label="Favicon"
          defaultValue={identity.faviconUrl ?? ""}
          accept="image/png,image/x-icon,image/vnd.microsoft.icon,image/svg+xml,image/webp,image/jpeg"
        />
        <Typography variant="caption" color="text.secondary" sx={{ mt: -1.5 }}>
          Browser tab icon (PNG, ICO, SVG, or WebP). Falls back to /favicon.ico when empty.
        </Typography>

        <ImageUploadField
          name="default_featured_image_url"
          label="Default featured image"
          defaultValue={identity.defaultFeaturedImageUrl ?? ""}
        />
        <Typography variant="caption" color="text.secondary" sx={{ mt: -1.5 }}>
          Used on cards and social previews when a story has no featured image.
        </Typography>

        <Button type="submit" variant="contained" sx={{ alignSelf: "flex-start" }}>
          Save site identity
        </Button>
      </Stack>
    </Box>
  );
}
