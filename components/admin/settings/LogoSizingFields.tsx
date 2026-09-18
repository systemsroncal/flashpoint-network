import { Stack, TextField, Typography } from "@mui/material";
import type { ResponsiveLogoMaxWidth } from "@/lib/site-identity/logo-layout";

export default function LogoSizingFields({
  prefix,
  label,
  widths,
  classNameDefault,
}: {
  prefix: "header" | "footer";
  label: string;
  widths: ResponsiveLogoMaxWidth;
  classNameDefault: string;
}) {
  return (
    <Stack spacing={1.5} sx={{ pl: 1, borderLeft: "3px solid", borderColor: "divider" }}>
      <Typography variant="subtitle2" fontWeight={700}>
        {label} — max-width
      </Typography>
      <Typography variant="caption" color="text.secondary">
        Phone (&lt;640px), tablet (640–1023px), laptop (1024–1279px), desktop (1280px+).
      </Typography>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} useFlexGap flexWrap="wrap">
        <TextField
          name={`${prefix}_logo_max_phone`}
          label="Phone"
          size="small"
          placeholder="140px"
          defaultValue={widths.phone}
          sx={{ minWidth: 120, flex: "1 1 120px" }}
        />
        <TextField
          name={`${prefix}_logo_max_tablet`}
          label="Tablet"
          size="small"
          placeholder="160px"
          defaultValue={widths.tablet}
          sx={{ minWidth: 120, flex: "1 1 120px" }}
        />
        <TextField
          name={`${prefix}_logo_max_laptop`}
          label="Laptop"
          size="small"
          placeholder="180px"
          defaultValue={widths.laptop}
          sx={{ minWidth: 120, flex: "1 1 120px" }}
        />
        <TextField
          name={`${prefix}_logo_max_desktop`}
          label="Desktop"
          size="small"
          placeholder="200px"
          defaultValue={widths.desktop}
          sx={{ minWidth: 120, flex: "1 1 120px" }}
        />
      </Stack>
      <TextField
        name={`${prefix}_logo_class_name`}
        label={`${label} — extra className`}
        fullWidth
        size="small"
        placeholder="object-left opacity-95"
        defaultValue={classNameDefault}
        helperText="Optional Tailwind / utility classes appended to the logo image."
      />
    </Stack>
  );
}
