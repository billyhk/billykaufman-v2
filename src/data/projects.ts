export type Project = {
  key: string;
  title: string;
  client: string;
  technologies: string[];
  description: string;
  images: string[];
  sourceCode?: string;
  deployment?: string;
};

export const projectsData: Project[] = [
  {
    key: "page_note",
    title: "PageNote",
    client: "Personal Project",
    technologies: ["CropperJS", "FabricJS"],
    description:
      "This personal project was inspired by my developer communication workflow. On an engineering team, I found myself sending annotated screenshots, but in doing so had to work with a screenshot app and a separate editor to add annotations. Then I would separately attach a note to elaborate on the observation. This handy chrome extension packs all of those functionalities into one lightweight tool.",
    images: [
      "/images/project-images/PageNote/01 extension pop up.png",
      "/images/project-images/PageNote/02 cropper.png",
      "/images/project-images/PageNote/03 editor.png",
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
      "/images/project-images/sebpo/01 home.png",
      "/images/project-images/sebpo/02 services index.png",
      "/images/project-images/sebpo/03 our process.png",
      "/images/project-images/sebpo/04 case studies.png",
      "/images/project-images/sebpo/05 news index.png",
      "/images/project-images/sebpo/07 job detail.png",
      "/images/project-images/sebpo/06 contact us.png",
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
      "/images/project-images/verify/01 home.png",
      "/images/project-images/verify/02 search by img or vid.png",
      "/images/project-images/verify/03 search by name.png",
      "/images/project-images/verify/04 about hero.png",
      "/images/project-images/verify/05 why verify.png",
      "/images/project-images/verify/06 lets connect form.png",
      "/images/project-images/verify/07 terms page.png",
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
      "/images/project-images/westrock/01 home.png",
      "/images/project-images/westrock/02 capabilities innovation.png",
      "/images/project-images/westrock/03 capabilities contact form.png",
      "/images/project-images/westrock/04 animated card.png",
      "/images/project-images/westrock/05 svg timeline.png",
      "/images/project-images/westrock/06 retail.png",
      "/images/project-images/westrock/07 global.png",
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
      "/images/project-images/collective/01 login.png",
      "/images/project-images/collective/02a dashboard.png",
      "/images/project-images/collective/02b company-details.png",
      "/images/project-images/collective/3 users can have vendors that receive orders, or only use the platform to place orders -- filtered-vendors-list.png",
      "/images/project-images/collective/04a create requisition for placing orders with other vendors.png",
      "/images/project-images/collective/04b requisitions are broken down into orders.png",
      "/images/project-images/collective/04c order-details.png",
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
      "/images/project-images/jspect/jspect-home.png",
      "/images/project-images/jspect/jspect-works.png",
      "/images/project-images/jspect/jspect-detail.png",
      "/images/project-images/jspect/jspect-form.png",
      "/images/project-images/jspect/jspect-table.png",
    ],
  },
];
