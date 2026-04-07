export type ExperienceEntry = {
  institutionName: string;
  title: string;
  description1: string;
  description2: string;
  dateRange: string;
  logoSrc: string;
  accentColor: string;
  logoFit?: "cover" | "contain";
  logoPadding?: string;
  logoBg?: string;
  link?: { label: string; href: string };
};

export const experienceData: ExperienceEntry[] = [
  {
    institutionName: "Zapier",
    title: "Software Engineer",
    description1:
      "Zapier is the automation platform connecting 7,000+ apps for millions of users, and a leader in bringing AI-powered automation to non-technical teams.",
    description2:
      "On the Interfaces team as a Software Engineer III, building and evolving the form and workflow products that power how customers design and automate complex integrations. Working across a highly modular TypeScript and React codebase with a strong emphasis on accessibility, testing, and code quality at scale.",
    dateRange: "Dec 2025 – Present",
    logoSrc: "/images/zapier-logo-sm.png",
    accentColor: "#ff4a00",
    logoFit: "contain",
    logoPadding: "p-2",
    logoBg: "#ffffff",
  },
  {
    institutionName: "Concertiv",
    title: "Senior Software Engineer",
    description1:
      "B2B SaaS platform delivering procurement-as-a-service to enterprise clients, driving significant cost savings on market data, technology, insurance, and operations.",
    description2:
      "Three years of full-stack ownership on a multi-tenant SaaS product. Highlights include designing an AI-powered contract workflow using AWS Bedrock that extracts structured data from contracts and integrates it into complex form flows, cutting manual entry time by 50%. Also owned Auth0 SSO, a custom feature flag system, AWS Step Functions data pipelines, and a large-scale React/TypeScript frontend including a customizable workflow editor.",
    dateRange: "Oct 2022 – Dec 2025",
    logoSrc: "/images/concertiv-logo-sm.png",
    accentColor: "#d79760",
    logoFit: "contain",
    logoBg: "#ffffff",
  },
  {
    institutionName: "Ruckus Marketing",
    title: "Software Engineer",
    description1:
      "NYC-based dev agency delivering React, WordPress, and Shopify builds across a range of industries.",
    description2:
      "Shipped multiple production client projects including SEBPO, Verify Faces, and Westrock Coffee, collaborating with product managers, backend developers, and designers to deliver polished, custom web applications.",
    dateRange: "Oct 2021 – Oct 2022",
    logoSrc: "/images/ruckus-logo.svg",
    accentColor: "#ff8300",
    logoFit: "contain",
    logoPadding: "p-1",
    logoBg: "#000000",
  },
  {
    institutionName: "LookFar Labs",
    title: "React Developer (Contractor)",
    description1:
      "Contracted by LookFar Labs to build the frontend for The Collective, an enterprise procurement platform for the construction industry.",
    description2:
      "Built complex, role-based UI flows in React and TypeScript including multi-step requisition management, vendor filtering, sortable data tables, and client-side CSV import with validation.",
    dateRange: "April 2021 – Oct 2021",
    logoSrc: "/images/lfl-logo-sm.png",
    accentColor: "#aaaaaa",
    logoFit: "contain",
    logoBg: "#ffffff",
  },
  {
    institutionName: "Gretrix",
    title: "Front-End Engineer",
    description1:
      "Atlanta-based agency specializing in custom analytics instrumentation and frontend engineering for enterprise clients.",
    description2:
      "Built custom JavaScript event tracking via Google Tag Manager and Adobe DTM for enterprise clients including Johnson & Johnson and Key Bank. Also contracted to build a production-grade React and TypeScript marketplace application.",
    dateRange: "Feb 2021 – Oct 2021",
    logoSrc: "/images/gx-logo.png",
    accentColor: "#b2dbef",
    logoFit: "contain",
    logoBg: "#ffffff",
  },
  {
    institutionName: "Freelance Web Developer",
    title: "Freelance",
    description1:
      "Right out of bootcamp, started taking on freelance client work to build real-world experience fast.",
    description2:
      "Sharpened fundamentals through data structures and algorithms, technical reading, and shipping actual client projects, laying the foundation for a full-time engineering career.",
    dateRange: "June 2020 – Feb 2021",
    logoSrc: "",
    accentColor: "#fd23de",
  },
  {
    institutionName: "General Assembly",
    title: "Full-Stack Software Engineering Bootcamp",
    description1:
      "Enrolled in GA's full-time, fully immersive software engineering bootcamp in March 2020, right at the start of the pandemic.",
    description2:
      "Twelve weeks of intensive full-stack training covering programming fundamentals, computer science concepts, and hands-on project work. The beginning of the whole story.",
    dateRange: "March 2020 – June 2020",
    logoSrc: "/images/ga-logo-gear-cropped.png",
    accentColor: "#ffe2e3",
    logoFit: "contain",
  },
  {
    institutionName: "University of Miami (FL)",
    title: "Doctor of Music",
    description1:
      "After years of studying classical percussion, earned a doctorate in music performance at one of the country's top conservatories.",
    description2:
      "My dissertation applied project management frameworks to high-stakes performance auditions. Developing that kind of rigorous, structured mindset was about to influence me in a major way...",
    link: {
      label: "Read the dissertation",
      href: "https://scholarship.miami.edu/esploro/outputs/doctoral/Utilizing-Select-Project-Management-Techniques-to/991031524184102976",
    },
    dateRange: "2017 – 2020",
    logoSrc: "/images/um-logo.jpg",
    accentColor: "#dce5df",
    logoFit: "contain",
    logoBg: "#000000",
  },
];
