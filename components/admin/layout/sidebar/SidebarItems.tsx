"use client";

import Menuitems, { type MenuItemConfig } from "./MenuItems";
import { Box, Typography } from "@mui/material";
import {
  Logo,
  Sidebar as MUI_Sidebar,
  Menu,
  MenuItem,
  Submenu,
} from "react-mui-sidebar";
import { IconPoint } from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { UserRole } from "@/lib/types/cms";

function filterMenuItems(
  items: MenuItemConfig[],
  role: UserRole,
): MenuItemConfig[] {
  const filtered: MenuItemConfig[] = [];
  for (const item of items) {
    if (item.roles && !item.roles.includes(role)) continue;
    if (item.children) {
      const children = filterMenuItems(item.children, role);
      if (!children.length) continue;
      filtered.push({ ...item, children });
      continue;
    }
    filtered.push(item);
  }

  // Drop orphan subheaders (nav labels with no following items before next label)
  const cleaned: MenuItemConfig[] = [];
  for (let i = 0; i < filtered.length; i++) {
    const item = filtered[i];
    if (item.subheader) {
      const hasFollowing = filtered
        .slice(i + 1)
        .some((next) => !next.subheader && (next.href || next.children));
      if (!hasFollowing) continue;
    }
    cleaned.push(item);
  }
  return cleaned;
}

const renderMenuItems = (items: MenuItemConfig[], pathDirect: string) => {
  return items.map((item) => {
    const Icon = item.icon ? item.icon : IconPoint;
    const itemIcon = <Icon stroke={1.5} size="1.3rem" />;

    if (item.subheader) {
      return (
        <Menu subHeading={item.subheader} key={item.subheader}>
          <></>
        </Menu>
      );
    }

    if (item.children) {
      return (
        <Submenu
          key={item.id}
          title={item.title ?? ""}
          icon={itemIcon}
          borderRadius="7px"
        >
          {renderMenuItems(item.children, pathDirect)}
        </Submenu>
      );
    }

    return (
      <Box px={3} key={item.id}>
        <MenuItem
          isSelected={
            item.href === "/admin"
              ? pathDirect === "/admin"
              : Boolean(item.href && pathDirect.startsWith(item.href))
          }
          borderRadius="8px"
          icon={itemIcon}
          link={item.href}
          component={Link}
        >
          {item.title}
        </MenuItem>
      </Box>
    );
  });
};

const SidebarItems = ({ role }: { role: UserRole }) => {
  const pathname = usePathname();
  const items = filterMenuItems(Menuitems, role);

  return (
    <>
      <MUI_Sidebar
        width="100%"
        showProfile={false}
        themeColor="#1B2A64"
        themeSecondaryColor="#FF490D"
      >
        <Logo img="/images/logos/dark-logo.svg" component={Link} href="/admin">
          FP Network
        </Logo>
        {renderMenuItems(items, pathname)}
        <Box px={2} mt={3}>
          <Typography variant="caption" color="textSecondary">
            Flash Point Network — Admin
          </Typography>
        </Box>
      </MUI_Sidebar>
    </>
  );
};

export default SidebarItems;
