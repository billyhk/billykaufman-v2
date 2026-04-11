import { URLS } from "@/constants/urls";

export const IS_OPEN_TO_WORK = false;

export const RESUME_URL = URLS.resume;

export const bioData = {
  name: "Billy Kaufman",
  title: "Full-stack engineer based in NYC",
  paragraphs: [
    "I build products from idea to deployment: fast, clean, and with real attention to UX. I'm most at home in TypeScript and React on the frontend, Python and Django on the backend, and AWS when it's time to ship.",
    "I got my start through General Assembly's software engineering immersive and have been heads-down building ever since, working across startups, agencies, and enterprise clients alike.",
    "Before code, I earned a DMA in musical performance and played with orchestras. These days I channel that same obsessive attention to detail into software.",
    "When I'm not coding, I'm training for the next road running race, playing chess, and keeping the music going!"
  ],
  generalAssemblyUrl: URLS.generalAssembly,
  headshotSrc: "/images/headshot-2.jpg",
  highlights: ["NYC", `${new Date().getFullYear() - 2020}+ yrs`, "Full-stack"],
};
