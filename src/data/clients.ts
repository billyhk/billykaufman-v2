import { URLS } from "@/constants/urls";

export type Client = {
  title: string;
  description: string;
  domain?: string;  // display label
  url?: string;     // full href — overrides https://${domain} when set
  accentColor: string;
  logoBg?: string;
};

export const clientsData: Client[] = [
  {
    title: "Bloomberg",
    description: "Brought animated HTML5 ad banners to life. Given static assets and a motion spec, I built looping animated banner ads for one of the world's leading financial media brands.",
    url: URLS.bloomberg,
    accentColor: "#f97316",
  },
  {
    title: "Westrock Coffee",
    description: "Built and maintained westrockcoffee.com, their official company website featuring brand content, company info, and links to their online store.",
    url: URLS.westrock,
    accentColor: "#a16207",
  },
  {
    title: "Sebpo",
    description: "Contributed to sebpo.com, the agency's official site showcasing their full suite of advertising, media, and business process outsourcing services.",
    url: URLS.sebpo,
    accentColor: "#0ea5e9",
  },
  {
    title: "PharmaCare",
    description: "Developed a digital marketplace app connecting pharmacies with multiple vendor options, streamlining procurement and supplier relationships.",
    url: URLS.pharmacare,
    accentColor: "#22c55e",
  },
  {
    title: "Credit Reporting Services",
    description: "Implemented analytics and behavior tracking across their client onboarding flow using custom JavaScript tag management via Google Tag Manager.",
    url: URLS.crs,
    accentColor: "#8b5cf6",
  },
  {
    title: "Verify",
    description: "Built verifyfaces.com to introduce visitors and prospective clients to their facial verification products and services.",
    url: URLS.verify,
    accentColor: "#ec4899",
  },
  {
    title: "Johnson & Johnson",
    description: "Built custom JavaScript behavior tracking across J&J's worldwide Google Tag Manager accounts, touching tracking mechanisms across multiple global regions.",
    url: URLS.jnj,
    accentColor: "#cc0000",
  },
  {
    title: "Domino's",
    description: "Contributed to the Slice the Price card web application, a promotional experience built for one of the world's most iconic pizza brands.",
    domain: "slicethepricecard.com",
    accentColor: "#006491",
  },
];
