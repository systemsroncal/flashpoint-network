import {
  IconCalendarEvent,
  IconCategory,
  IconLayoutDashboard,
  IconMail,
  IconNews,
  IconPhoto,
  IconSettings,
  IconTags,
  IconUsers,
} from "@tabler/icons-react";
import { uniqueId } from "lodash";

const Menuitems = [
  {
    navlabel: true,
    subheader: "HOME",
  },
  {
    id: uniqueId(),
    title: "Dashboard",
    icon: IconLayoutDashboard,
    href: "/admin",
  },
  {
    navlabel: true,
    subheader: "CONTENT",
  },
  {
    id: uniqueId(),
    title: "Posts",
    icon: IconNews,
    href: "/admin/posts",
  },
  {
    id: uniqueId(),
    title: "Events",
    icon: IconCalendarEvent,
    href: "/admin/events",
  },
  {
    id: uniqueId(),
    title: "Categories",
    icon: IconCategory,
    href: "/admin/categories",
  },
  {
    id: uniqueId(),
    title: "Tags",
    icon: IconTags,
    href: "/admin/tags",
  },
  {
    id: uniqueId(),
    title: "Media",
    icon: IconPhoto,
    href: "/admin/media",
  },
  {
    navlabel: true,
    subheader: "SYSTEM",
  },
  {
    id: uniqueId(),
    title: "Users",
    icon: IconUsers,
    href: "/admin/users",
  },
  {
    id: uniqueId(),
    title: "Email Templates",
    icon: IconMail,
    href: "/admin/email-templates",
  },
  {
    id: uniqueId(),
    title: "Settings",
    icon: IconSettings,
    href: "/admin/settings",
  },
];

export default Menuitems;
