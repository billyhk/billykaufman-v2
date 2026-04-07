export type SkillCategory = {
  heading: string;
  skills: string[];
};

export const skillsData: SkillCategory[] = [
  {
    heading: "Frontend",
    skills: [
      "React", "Next.js", "TypeScript", "JavaScript",
      "Tailwind CSS", "CSS / SCSS", "Framer Motion", "GSAP",
      "Three.js", "React Three Fiber", "Responsive Design",
    ],
  },
  {
    heading: "Backend",
    skills: [
      "Python", "Django", "Node.js", "REST API Design",
      "PostgreSQL", "GraphQL", "WebSockets", "Auth / OAuth",
    ],
  },
  {
    heading: "Cloud & DevOps",
    skills: [
      "AWS (S3, EC2, Lambda, Bedrock)", "GitHub Actions",
      "GitLab CI/CD", "Docker", "Vercel",
    ],
  },
  {
    heading: "AI & Modern Tooling",
    skills: [
      "Claude / Claude Code", "Cursor", "AWS Bedrock",
      "Prompt Engineering", "LLM Integration",
    ],
  },
  {
    heading: "Testing",
    skills: [
      "Jest", "Vitest", "React Testing Library",
      "Playwright", "E2E Testing", "Integration Testing",
    ],
  },
  {
    heading: "Documentation",
    skills: [
      "ADRs", "PRDs", "UML Diagrams",
      "API Documentation", "Technical Specs", "Runbooks",
    ],
  },
];
