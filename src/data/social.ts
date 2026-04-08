import { FaGithub, FaLinkedin } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import type { IconType } from "react-icons";
import { URLS } from "@/constants/urls";

export type SocialLink = {
  Icon: IconType;
  href: string;
  displayName: string;
  label: string;
};

export const socialLinks: SocialLink[] = [
  {
    Icon: FaGithub,
    href: URLS.github,
    displayName: "github.com/billyhk",
    label: "GitHub",
  },
  {
    Icon: FaLinkedin,
    href: URLS.linkedin,
    displayName: "/in/billykaufman",
    label: "LinkedIn",
  },
  {
    Icon: MdEmail,
    href: "mailto:billyhkaufman@gmail.com",
    displayName: "billyhkaufman@gmail.com",
    label: "Email",
  },
];
