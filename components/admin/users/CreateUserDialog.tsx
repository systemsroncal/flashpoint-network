"use client";

import { useFormStatus } from "react-dom";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
} from "@mui/material";
import { createAdminUserAction } from "@/lib/admin/actions";
import type { UserRole } from "@/lib/types/cms";

const ROLES: { value: UserRole; label: string }[] = [
  { value: "subscriber", label: "Subscriber" },
  { value: "guest", label: "Guest" },
  { value: "journalist", label: "Journalist (staff)" },
  { value: "editor", label: "Editor (staff)" },
  { value: "admin", label: "Admin (staff)" },
  { value: "superadmin", label: "Superadmin (staff)" },
];

type Props = {
  open: boolean;
  onClose: () => void;
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="contained" disabled={pending}>
      {pending ? "Creating…" : "Create user"}
    </Button>
  );
}

function CancelButton({ onClose }: { onClose: () => void }) {
  const { pending } = useFormStatus();
  return (
    <Button onClick={onClose} disabled={pending}>
      Cancel
    </Button>
  );
}

export default function CreateUserDialog({ open, onClose }: Props) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <form action={createAdminUserAction}>
        <DialogTitle>Add user</DialogTitle>
        <DialogContent>
          <Stack spacing={2} pt={0.5}>
            <Alert severity="info">
              Creates a Supabase Auth account and matching profile. Staff roles
              can open /admin; subscriber/guest stay on the public site.
            </Alert>
            <TextField
              name="name"
              label="Name"
              required
              fullWidth
              autoFocus
              helperText="Stored as full name (first word → first name)."
            />
            <TextField
              name="email"
              label="Email"
              type="email"
              required
              fullWidth
              autoComplete="off"
            />
            <TextField
              name="password"
              label="Password"
              type="password"
              required
              fullWidth
              autoComplete="new-password"
              helperText="At least 8 characters. User can sign in immediately."
            />
            <TextField
              select
              name="role"
              label="Role"
              fullWidth
              defaultValue="subscriber"
              helperText="Pick subscriber or any staff role the app already uses."
            >
              {ROLES.map((r) => (
                <MenuItem key={r.value} value={r.value}>
                  {r.label}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <CancelButton onClose={onClose} />
          <SubmitButton />
        </DialogActions>
      </form>
    </Dialog>
  );
}
