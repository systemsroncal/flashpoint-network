import type { SxProps, Theme } from "@mui/material";

/** Keep filter rows inside the viewport on narrow admin screens. */
export const adminFilterRowSx: SxProps<Theme> = {
  width: "100%",
  maxWidth: "100%",
  minWidth: 0,
};

export const adminSelectFieldSx: SxProps<Theme> = {
  width: "100%",
  minWidth: 0,
  flex: { md: 1 },
};

export const adminFormStackSx: SxProps<Theme> = {
  width: "100%",
  maxWidth: "100%",
  minWidth: 0,
  "& .MuiTextField-root": {
    width: "100%",
    minWidth: 0,
  },
  "& .MuiButton-root": {
    width: { xs: "100%", sm: "auto" },
  },
};
