export type Skill = {
  heading: string;
  logoSrc: string;
  bodyList: string[];
};

export const skillsData: Skill[] = [
  {
    heading: "TypeScript",
    logoSrc: "/images/ts-logo.svg",
    bodyList: [
      "Strongly Typed JavaScript!",
      "Typesafe, API-Driven, React Application Development",
      "Unit Testing with Jest & Vitest",
      `ES6 / ES${new Date().getFullYear()}+`,
    ],
  },
  {
    heading: "Styling & Animation",
    logoSrc: "/images/tailwind-logo.svg",
    bodyList: [
      "Advanced CSS Processing",
      "CSS-Modules | TailwindCSS | SCSS | CSS-in-JS",
      "Animations with Framer Motion and GSAP",
      "Implementation of Modern Design Trends and -morphisms",
    ],
  },
  {
    heading: "Headless CMS",
    logoSrc: "/images/gatsby-logo.svg",
    bodyList: [
      "Wordpress-Templating with GatsbyJS & GraphQL",
      "Source Data from Multiple APIs",
      "No-Code content-management for clients via Custom Post Types and Advanced Custom Fields",
    ],
  },
  {
    heading: "Other...",
    logoSrc: "",
    bodyList: [
      "CMS Development with Wordpress, Shopify, Wix, Squarespace, Etc.",
      "SVGs: Optimization, Integration, Animation",
      "Deployment with Amazon Web Services",
    ],
  },
];
