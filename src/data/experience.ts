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
};

export const experienceData: ExperienceEntry[] = [
  {
    institutionName: "Zapier",
    title: "Software Engineer",
    description1:
      "Zapier is a no-code automation platform that enables millions of users to connect apps, automate workflows, and build powerful integrations without writing code.",
    description2:
      "As a software engineer on the Interfaces team, my work focuses on building and evolving user-facing products such as forms and workflow interfaces, emphasizing usability, scalability, and maintainable front-end architecture while collaborating closely with product and design.",
    dateRange: "Dec 2025 – Present",
    logoSrc: "/images/zapier-logo-sm.png",
    accentColor: "#ff4a00",
  },
  {
    institutionName: "Concertiv",
    title: "Senior Software Engineer",
    description1:
      "B2B software company offering Procurement as a service, resulting in massive savings for corporate clients on market data, technology infrastructure, insurance, and travel.",
    description2:
      "As a member of the engineering team, my work contributes to the development of the company's internal platform, C360, which is central to the management of client services.",
    dateRange: "Oct 2022 – Dec 2025",
    logoSrc: "/images/concertiv-logo-sm.png",
    accentColor: "#d79760",
  },
  {
    institutionName: "Ruckus Marketing",
    title: "Software Engineer",
    description1:
      "NYC-based business-facing agency that delivers web applications developed with React, Wordpress, and Shopify across a variety of industries.",
    description2:
      "I worked closely with project managers, backend developers, and an internal design team to produce modern web apps with React that are as pleasant to use as they are aesthetically captivating.",
    dateRange: "Oct 2021 – Oct 2022",
    logoSrc: "/images/ruckus-logo-nyc.png",
    accentColor: "#ff8300",
    logoFit: "contain",
    logoPadding: "p-1",
  },
  {
    institutionName: "LookFar Labs",
    title: "React Developer (Contractor)",
    description1:
      "I was contracted by LookFar to build the front-end of a two-way purchasing agent with ReactJS and TypeScript.",
    description2:
      "Our web app, called The Collective, empowers a network of users who can post and/or rent instruments of construction. Excavators, Backhoes, Hydraulic Drills.",
    dateRange: "April 2021 – Oct 2021",
    logoSrc: "/images/lfl-logo-sm.png",
    accentColor: "#aaaaaa",
    logoFit: "contain",
  },
  {
    institutionName: "Gretrix",
    title: "Front-End Engineer",
    description1:
      "Agency based in Atlanta that handles various web-development business needs, from troubleshooting web-app performance issues, to making custom e-commerce solutions.",
    description2:
      "As a front-end dev, I was responsible for a significant volume of JavaScript development, such as implementing complex animations, integrating CRMs with form-based webpages, and custom tag-management.",
    dateRange: "Feb 2021 – Oct 2021",
    logoSrc: "/images/gx-logo.png",
    accentColor: "#b2dbef",
    logoFit: "contain",
  },
  {
    institutionName: "Freelance Web Developer",
    title: "Freelance",
    description1:
      "As a fresh graduate from a coding bootcamp, I quickly learned that I had to take the initiative in order to take my skills to the next level.",
    description2:
      "I practiced data structures & algorithms, read textbooks, and freelanced to start gaining Web-Dev XP.",
    dateRange: "June 2020 – Feb 2021",
    logoSrc: "",
    accentColor: "#fd23de",
  },
  {
    institutionName: "General Assembly",
    title: "Full-Stack Software Engineering Bootcamp",
    description1:
      "Full-time, fully-immersive education in the skills required to be a professional software engineer.",
    description2:
      "This web-dev centric bootcamp taught me the fundamentals of programming beyond the syntax, and introduced me to many critical areas in the CS space.",
    dateRange: "March 2020 – June 2020",
    logoSrc: "/images/ga-logo-gear-cropped.png",
    accentColor: "#ffe2e3",
    logoFit: "contain",
  },
  {
    institutionName: "University of Miami (FL)",
    title: "Doctor of Music",
    description1:
      "After many years of studying classical percussion, I achieved a doctorate in the field of music performance.",
    description2:
      "My dissertation was about getting SUPER organized for complicated and nuanced projects (i.e. Auditions). Developing that kind of creative and highly-structured mindset was about to influence me in a major way...",
    dateRange: "2017 – 2020",
    logoSrc: "/images/um-logo.jpg",
    accentColor: "#dce5df",
    logoFit: "contain",
  },
];
