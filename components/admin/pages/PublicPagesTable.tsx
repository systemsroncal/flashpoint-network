"use client";

import Link from "next/link";
import {
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import DashboardCard from "@/components/admin/shared/DashboardCard";
import type { PublicPageSeoRow } from "@/lib/public-pages/seo-store";

export default function PublicPagesTable({ pages }: { pages: PublicPageSeoRow[] }) {
  const grouped = pages.reduce<Record<string, PublicPageSeoRow[]>>((acc, row) => {
    const g = row.group;
    if (!acc[g]) acc[g] = [];
    acc[g].push(row);
    return acc;
  }, {});

  return (
    <Stack spacing={3}>
      {Object.entries(grouped).map(([group, rows]) => (
        <DashboardCard key={group} title={group} subtitle={`${rows.length} pages`}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Page</TableCell>
                <TableCell>Path</TableCell>
                <TableCell>Custom SEO</TableCell>
                <TableCell align="right">Edit</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => {
                const customized = Boolean(
                  row.seo?.seo_title ||
                    row.seo?.seo_description ||
                    row.seo?.og_image_url,
                );
                return (
                  <TableRow key={row.key} hover>
                    <TableCell>
                      <Typography variant="subtitle2">{row.label}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {row.path}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {customized ? (
                        <Chip size="small" color="primary" label="Custom" />
                      ) : (
                        <Chip size="small" variant="outlined" label="Defaults" />
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Link
                        href={`/admin/pages/${row.key}`}
                        className="text-sm font-semibold text-[var(--fpn-rojo)]"
                      >
                        SEO
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </DashboardCard>
      ))}
    </Stack>
  );
}
