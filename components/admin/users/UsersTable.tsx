"use client";

import {
  Chip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import DashboardCard from "@/components/admin/shared/DashboardCard";
import type { Profile } from "@/lib/types/cms";

export default function UsersTable({ users }: { users: Profile[] }) {
  return (
    <DashboardCard title="Users" subtitle={`${users.length} profiles`}>
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
  );
}
