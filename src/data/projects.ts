import { URLS } from "@/constants/urls";

export type BannerSize = {
  label: string;
  width: number;
  height: number;
  src: string;
};

export type Project = {
  key: string;
  title: string;
  client: string;
  technologies: string[];
  description: string;
  images: string[];
  banners?: BannerSize[];
  sourceCode?: string;
  deployment?: string;
};

export const projectsData: Project[] = [
  {
    key: "bloomberg",
    title: "Bloomberg B2B Campaign Banners",
    client: "Bloomberg LP",
    technologies: ["HTML5", "CSS3", "CSS Keyframe Animations", "3D Transforms", "Radial Gradients"],
    description: "Engineered 48 HTML5 display ad banners for Bloomberg's B2B marketing campaign: 8 messaging variations across 6 IAB standard sizes. All animations and 3D transforms hand-written in CSS without a single JavaScript animation library.",
    images: [],
    banners: [
      { label: "300×250", width: 300, height: 250, src: "/bloomberg/300x250.html" },
      { label: "728×90",  width: 728, height: 90,  src: "/bloomberg/728x90.html"  },
      { label: "160×600", width: 160, height: 600, src: "/bloomberg/160x600.html" },
      { label: "320×100", width: 320, height: 100, src: "/bloomberg/320x100.html" },
      { label: "300×50",  width: 300, height: 50,  src: "/bloomberg/300x50.html"  },
      { label: "320×50",  width: 320, height: 50,  src: "/bloomberg/320x50.html"  },
    ],
  },
  {
    key: "page_note",
    title: "PageNote",
    client: "Personal Project",
    technologies: ["Chrome Extension API", "JavaScript", "CropperJS", "FabricJS"],
    description:
      "Built to scratch my own itch: dev teams waste time bouncing between screenshot tools, image editors, and message threads just to say \"look at this.\" PageNote collapses all of that into a single Chrome extension. Capture, crop, annotate, and share without leaving the browser. MIT licensed and open source on GitHub.",
    images: [
      "/images/project-images/PageNote/01 extension pop up\.jpg",
      "/images/project-images/PageNote/02 cropper\.jpg",
      "/images/project-images/PageNote/03 editor\.jpg",
    ],
    sourceCode: URLS.pageNote,
  },
  {
    key: "sebpo",
    title: "SEBPO",
    client: "Sebpo USA",
    technologies: [
      "React / Gatsby",
      "TailwindCSS",
      "GraphQL",
      "Wordpress (headless)",
      "CPT-UI",
      "Advanced Custom Fields",
    ],
    description:
      "Engineered the original sebpo.com frontend as a headless Gatsby + WordPress stack, giving the team full content control through a familiar CMS while delivering a fully custom UI. GraphQL powered the data layer; ACFs and CPT-UI drove dynamic page generation. The UI was later ported to a WordPress rebuild, and much of the design and component work carried over to the live site.",
    images: [
      "/images/project-images/sebpo/01 home\.jpg",
      "/images/project-images/sebpo/02 services index\.jpg",
      "/images/project-images/sebpo/03 our process\.jpg",
      "/images/project-images/sebpo/04 case studies\.jpg",
      "/images/project-images/sebpo/05 news index\.jpg",
      "/images/project-images/sebpo/07 job detail\.jpg",
      "/images/project-images/sebpo/06 contact us\.jpg",
    ],
    deployment: URLS.sebpo,
  },
  {
    key: "verify",
    title: "Verify Faces",
    client: "Verify",
    technologies: [
      "ReactJS",
      "Redux",
      "TailwindCSS",
      "Stripe API",
      "Node.js",
    ],
    description:
      "Marketing site and live product in one. Verifyfaces.com lets employers run background checks powered by Verify's patented facial recognition engine, with search by name, image, or video upload. Built the full frontend in React/Redux and handled payment flows via a Node.js/Stripe backend.",
    images: [
      "/images/project-images/verify/01 home\.jpg",
      "/images/project-images/verify/02 search by img or vid\.jpg",
      "/images/project-images/verify/03 search by name\.jpg",
      "/images/project-images/verify/04 about hero\.jpg",
      "/images/project-images/verify/05 why verify\.jpg",
      "/images/project-images/verify/06 lets connect form\.jpg",
      "/images/project-images/verify/07 terms page\.jpg",
    ],
    deployment: URLS.verify,
  },
  {
    key: "westrock",
    title: "Westrock Coffee",
    client: "Westrock Coffee",
    technologies: ["JavaScript", "SCSS", "CMS Integration"],
    description:
      "Built the UI for westrockcoffee.com, a marketing site advertising Westrock's B2C and B2B coffee distribution services. Architected as a modular, component-driven frontend integrated with a CMS backend so the marketing team could manage content without touching code.",
    images: [
      "/images/project-images/westrock/01 home\.jpg",
      "/images/project-images/westrock/02 capabilities innovation\.jpg",
      "/images/project-images/westrock/03 capabilities contact form\.jpg",
      "/images/project-images/westrock/04 animated card\.jpg",
      "/images/project-images/westrock/05 svg timeline\.jpg",
      "/images/project-images/westrock/06 retail\.jpg",
      "/images/project-images/westrock/07 global\.jpg",
    ],
    deployment: URLS.westrock,
  },
  {
    key: "pharmacare",
    title: "PharmaCare Marketplace",
    client: "PharmaCare",
    technologies: ["React", "Redux", "Node.js", "PostgreSQL", "REST API"],
    description:
      "Full-stack B2B pharmaceutical marketplace connecting independent pharmacies with wholesale drug suppliers. Buyers can browse by NDC number, compare prices across anonymous sellers, track products on a watchlist with stock/price notifications, and check out with Stripe. Sellers post single or bulk CSV listings and manage inventory from a unified dashboard.",
    images: [
      "/images/project-images/pharmacare/01 login.jpg",
      "/images/project-images/pharmacare/02 dashboard.jpg",
      "/images/project-images/pharmacare/03 marketplace.jpg",
      "/images/project-images/pharmacare/04 cart.jpg",
      "/images/project-images/pharmacare/05 checkout.jpg",
      "/images/project-images/pharmacare/06 order confirmation.jpg",
      "/images/project-images/pharmacare/07 post listing.jpg",
    ],
    deployment: URLS.pharmacare,
  },
  {
    key: "the_collective",
    title: "The Collective",
    client: "G&G Holdings",
    technologies: [
      "ReactJS",
      "TypeScript",
      "React Context",
      "TailwindCSS",
      "Formik / Yup",
      "React Table",
      "PapaParse",
    ],
    description:
      "Enterprise procurement platform for the construction industry. Vendors and buyers operate in the same system: companies can register as suppliers, place orders against other vendors, or both. Complex multi-step requisition flows, role-based access, client-side CSV import with validation, and sortable/filterable data tables throughout. Deployed behind an enterprise paywall.",
    images: [
      "/images/project-images/collective/01 login\.jpg",
      "/images/project-images/collective/02a dashboard\.jpg",
      "/images/project-images/collective/02b company-details\.jpg",
      "/images/project-images/collective/3 users can have vendors that receive orders, or only use the platform to place orders -- filtered-vendors-list\.jpg",
      "/images/project-images/collective/04a create requisition for placing orders with other vendors\.jpg",
      "/images/project-images/collective/04b requisitions are broken down into orders\.jpg",
      "/images/project-images/collective/04c order-details\.jpg",
    ],
  },
  {
    key: "j_spect",
    title: "Joel Spector, Art Gallery",
    client: "The Family of Joel Spector",
    technologies: [
      "ReactJS",
      "SCSS",
      "Material Design Bootstrap",
      "AWS Image Optimization",
      "Java Spring Boot",
      "MySQL",
      "Spring Security",
    ],
    description:
      "Commissioned by my best friend's family to preserve and share the legacy of Cuban-American artist Joel Spector after his passing. The gallery showcases 88 of his works in high definition with AWS on-the-fly image optimization, and includes a password-protected admin panel for the family to manage the collection.",
    images: [
      "/images/project-images/jspect/jspect-home\.jpg",
      "/images/project-images/jspect/jspect-works\.jpg",
      "/images/project-images/jspect/jspect-detail\.jpg",
      "/images/project-images/jspect/jspect-form\.jpg",
      "/images/project-images/jspect/jspect-table\.jpg",
    ],
  },
];
