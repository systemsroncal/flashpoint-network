import {
  IconCalendarEvent,
  IconCategory,
  IconCross,
  IconDeviceTvOld,
  IconLayoutDashboard,
  IconMail,
  IconNews,
  IconPhoto,
  IconSettings,
  IconTags,
  IconUsers,
} from "@tabler/icons-react";

/** Stable ids — avoid lodash uniqueId() (SSR/client mismatch). */
const Menuitems = [
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
    title: "Classic Programs",
    icon: IconDeviceTvOld,
    href: "/admin/classic-programs",
  },
  {
    id: "nav-ministry-programs",
    title: "Ministry Programs",
    icon: IconCross,
    href: "/admin/ministry-programs",
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
