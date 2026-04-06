export type Client = {
  title: string;
  description: string;
  domain?: string; // used to fetch logo via Clearbit
  accentColor: string;
};

export const clientsData: Client[] = [
  {
    title: "Bloomberg",
    description: "The world's leading source for financial news and private banking solutions.",
    domain: "bloomberg.com",
    accentColor: "#f97316",
  },
  {
    title: "Westrock Coffee",
    description: "International coffee distributor & major supplier for Dunkin' Donuts and Starbucks.",
    domain: "westrockcoffee.com",
    accentColor: "#a16207",
  },
  {
    title: "Sebpo",
    description: "Agency for advertising, media, and technical services.",
    domain: "sebpo.com",
    accentColor: "#0ea5e9",
  },
  {
    title: "PharmaCare",
    description: "Specialty generic and brand pharmaceutical wholesaler.",
    domain: "pharmacare.com",
    accentColor: "#22c55e",
  },
  {
    title: "Credit Reporting Services",
    description: "Credit data provider handling reporting, CRM integrations, and underwriting.",
    domain: "creditreportingservices.com",
    accentColor: "#8b5cf6",
  },
  {
    title: "Verify",
    description: "Employee records verification service provider.",
    domain: "verifyfast.com",
    accentColor: "#ec4899",
  },
];
