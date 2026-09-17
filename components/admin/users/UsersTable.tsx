"use client";

import { useState } from "react";
import {
  Alert,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import DashboardCard from "@/components/admin/shared/DashboardCard";
import CreateUserDialog from "@/components/admin/users/CreateUserDialog";
import type { Profile } from "@/lib/types/cms";

type Props = {
  users: Profile[];
  flash?: { createdEmail?: string | null; error?: string | null };
};

export default function UsersTable({ users, flash }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {flash?.error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {flash.error}
        </Alert>
      ) : null}
      {flash?.createdEmail ? (
        <Alert severity="success" sx={{ mb: 2 }}>
          User created: {flash.createdEmail}
        </Alert>
      ) : null}

      <DashboardCard
        title="Users"
        subtitle={`${users.length} profiles`}
        action={
          <Button variant="contained" onClick={() => setOpen(true)}>
            Add user
          </Button>
        }
      >
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id} hover>
                <TableCell>
                  <Typography variant="subtitle2">
                    {user.full_name ||
                      [user.first_name, user.last_name].filter(Boolean).join(" ") ||
                      "—"}
                  </Typography>
                </TableCell>
                <TableCell>{user.email ?? "—"}</TableCell>
                <TableCell>
                  <Chip size="small" label={user.role} />
                </TableCell>
              </TableRow>
            ))}
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3}>
                  <Typography color="textSecondary">No users yet.</Typography>
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </DashboardCard>

      <CreateUserDialog open={open} onClose={() => setOpen(false)} />
    </>
  );
}
