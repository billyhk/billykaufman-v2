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
    description: "Engineered 48 HTML5 display ad banners for Bloomberg's B2B marketing campaign — 8 messaging variations across 6 IAB standard sizes. All animations and 3D transforms hand-written in CSS without a single JavaScript animation library.",
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
    technologies: ["CropperJS", "FabricJS"],
    description:
      "This personal project was inspired by my developer communication workflow. On an engineering team, I found myself sending annotated screenshots, but in doing so had to work with a screenshot app and a separate editor to add annotations. Then I would separately attach a note to elaborate on the observation. This handy chrome extension packs all of those functionalities into one lightweight tool.",
    images: [
      "/images/project-images/PageNote/01 extension pop up\.jpg",
      "/images/project-images/PageNote/02 cropper\.jpg",
      "/images/project-images/PageNote/03 editor\.jpg",
    ],
    sourceCode: "https://github.com/billyhk/PageNote",
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
      "Dynamic data generation with Wordpress plugins CPT-UI and Advanced Custom Fields (ACFs)",
    ],
    description:
      "Sebpo is a digital service provider that needed to reflect their technical prowess with a new and improved version of their old, stale, traditional Wordpress build. Gatsby was the perfect framework for this project because it provided seamless data delivery from Wordpress to offer the same content-control the client was used to, but paired with the luster of a fully custom user interface.",
    images: [
      "/images/project-images/sebpo/01 home\.jpg",
      "/images/project-images/sebpo/02 services index\.jpg",
      "/images/project-images/sebpo/03 our process\.jpg",
      "/images/project-images/sebpo/04 case studies\.jpg",
      "/images/project-images/sebpo/05 news index\.jpg",
      "/images/project-images/sebpo/07 job detail\.jpg",
      "/images/project-images/sebpo/06 contact us\.jpg",
    ],
  },
  {
    key: "verify",
    title: "Verify Faces",
    client: "Verify",
    technologies: [
      "ReactJS",
      "Redux",
      "TailwindCSS",
      "StripeAPI and NodeJS for payment-handler server-side operations",
    ],
    description:
      "This site serves as both a marketing platform for Verify's identity-verification services, AND as an access point for the service itself. Verify Faces is a web application that empowers employers with the ability to unveil any and all public-information on prospective and current employees. This application integrates Verify's patented facial recognition software, which can parse images as well as videos.",
    images: [
      "/images/project-images/verify/01 home\.jpg",
      "/images/project-images/verify/02 search by img or vid\.jpg",
      "/images/project-images/verify/03 search by name\.jpg",
      "/images/project-images/verify/04 about hero\.jpg",
      "/images/project-images/verify/05 why verify\.jpg",
      "/images/project-images/verify/06 lets connect form\.jpg",
      "/images/project-images/verify/07 terms page\.jpg",
    ],
  },
  {
    key: "westrock",
    title: "Westrock",
    client: "Westrock Coffee",
    technologies: ["JavaScript", "Shopify (Headless)", "{{ Liquid }}", "SCSS"],
    description:
      "Westrock Coffee requested a marketing website to advertise their B2C and B2B coffee distribution services. This application was built as a modularized, micro-frontend architecture. Dynamic data is provided to Liquid templates via Advanced Custom Fields in order to incorporate a headless Shopify backend.",
    images: [
      "/images/project-images/westrock/01 home\.jpg",
      "/images/project-images/westrock/02 capabilities innovation\.jpg",
      "/images/project-images/westrock/03 capabilities contact form\.jpg",
      "/images/project-images/westrock/04 animated card\.jpg",
      "/images/project-images/westrock/05 svg timeline\.jpg",
      "/images/project-images/westrock/06 retail\.jpg",
      "/images/project-images/westrock/07 global\.jpg",
    ],
  },
  {
    key: "the_collective",
    title: "The Collective",
    client: "G&G Holdings",
    technologies: [
      "ReactJS",
      "TypeScript",
      "React-Context",
      "TailwindCSS",
      "Formik/Yup",
      "React-Table",
      "PapaParse (client-side CSV-import validation)",
    ],
    description:
      "This web application served as a purchasing agent for the construction industry. The platform can be used to create vendors that can receive orders, or to only place orders to vendors created by other users.",
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
      "Material-Design-Bootstrap",
      "AWS On-The-Fly Image Optimization",
      "Java Spring Boot / MySQL / Spring Security",
    ],
    description:
      "Digital art gallery for prominent Cuban-American artist, Joel Spector. The artist's family commissioned this web-app project after he passed away. Users can view 88 of his works in high definition, and admin users can update the database of indexed works.",
    images: [
      "/images/project-images/jspect/jspect-home\.jpg",
      "/images/project-images/jspect/jspect-works\.jpg",
      "/images/project-images/jspect/jspect-detail\.jpg",
      "/images/project-images/jspect/jspect-form\.jpg",
      "/images/project-images/jspect/jspect-table\.jpg",
    ],
  },
];
