import type { ElementType } from "react";
import {
  IconCalendarEvent,
  IconCategory,
  IconChartBar,
  IconCross,
  IconDeviceTvOld,
  IconLayoutDashboard,
  IconMail,
  IconMessageCircle,
  IconNews,
  IconPhoto,
  IconAd2,
  IconSettings,
  IconTags,
  IconUsers,
} from "@tabler/icons-react";
import type { UserRole } from "@/lib/types/cms";

export type MenuItemConfig = {
  id?: string;
  title?: string;
  icon?: ElementType;
  href?: string;
  navlabel?: boolean;
  subheader?: string;
  children?: MenuItemConfig[];
  /** If set, item is shown only when the viewer role is included. */
  roles?: UserRole[];
  /** Optional program module kill-switch. */
  module?: "classic" | "schedule";
};

/** Stable ids — avoid lodash uniqueId() (SSR/client mismatch). */
const Menuitems: MenuItemConfig[] = [
  {
    navlabel: true,
    subheader: "HOME",
  },
  {
    id: "nav-dashboard",
    title: "Dashboard",
    icon: IconLayoutDashboard,
    href: "/admin",
  },
  {
    id: "nav-analytics",
    title: "Analytics",
    icon: IconChartBar,
    href: "/admin/analytics",
    roles: ["superadmin", "admin"],
  },
  {
    navlabel: true,
    subheader: "CONTENT",
  },
  {
    id: "nav-news",
    title: "News",
    icon: IconNews,
    href: "/admin/posts",
  },
  {
    id: "nav-events",
    title: "Events",
    icon: IconCalendarEvent,
    href: "/admin/events",
  },
  {
    id: "nav-classic-programs",
    title: "Family Classics",
    icon: IconDeviceTvOld,
    href: "/admin/classic-programs",
    module: "classic",
  },
  {
    id: "nav-network-programs",
    title: "Network Programs",
    icon: IconCross,
    href: "/admin/network-programs",
  },
  {
    id: "nav-schedule-programs",
    title: "Schedule Programs",
    icon: IconCalendarEvent,
    href: "/admin/schedule-programs",
    module: "schedule",
  },
  {
    id: "nav-categories",
    title: "Categories",
    icon: IconCategory,
    href: "/admin/categories",
  },
  {
    id: "nav-tags",
    title: "Tags",
    icon: IconTags,
    href: "/admin/tags",
  },
  {
    id: "nav-media",
    title: "Media",
    icon: IconPhoto,
    href: "/admin/media",
  },
  {
    id: "nav-banners",
    title: "Banners",
    icon: IconAd2,
    href: "/admin/banners",
  },
  {
    id: "nav-help-center",
    title: "Help Center",
    icon: IconMessageCircle,
    href: "/admin/help-center",
  },
  {
    navlabel: true,
    subheader: "SYSTEM",
  },
  {
    id: "nav-users",
    title: "Users",
    icon: IconUsers,
    href: "/admin/users",
  },
  {
    id: "nav-email-templates",
    title: "Email Templates",
    icon: IconMail,
    href: "/admin/email-templates",
  },
  {
    id: "nav-settings",
    title: "Settings",
    icon: IconSettings,
    href: "/admin/settings",
  },
];

export default Menuitems;
