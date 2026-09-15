"use client";

import Menuitems from "./MenuItems";
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

const renderMenuItems = (items: any[], pathDirect: string) => {
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
          title={item.title}
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
          isSelected={pathDirect === item?.href}
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

const SidebarItems = () => {
  const pathname = usePathname();

  return (
    <>
      <MUI_Sidebar
        width="100%"
        showProfile={false}
        themeColor="#5D87FF"
        themeSecondaryColor="#49beff"
      >
        <Logo img="/images/logos/dark-logo.svg" component={Link} href="/admin">
          FP Network
        </Logo>
        {renderMenuItems(Menuitems, pathname)}
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
