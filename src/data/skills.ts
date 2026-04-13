export type SkillCategory = {
  heading: string;
  skills: string[];
};

export const skillsData: SkillCategory[] = [
  {
    heading: "Frontend",
    skills: [
      "React", "Next.js", "TypeScript", "JavaScript",
      "Redux", "Tailwind CSS", "CSS / SCSS", "Framer Motion", "GSAP",
      "Three.js", "React Three Fiber", "Responsive Design",
      "Complex State Management", "Authentication Solutions",
    ],
  },
  {
    heading: "Backend",
    skills: [
      "Python", "Django", "Fastify", "Node.js",
      "REST API Design", "OpenAPI", "tRPC", "GraphQL",
      "PostgreSQL", "Redis", "WebSockets", "Auth / OAuth",
      "Endpoint Optimization at Scale", "asyncio",
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
      "MCP (Model Context Protocol)", "Prompt Engineering",
      "LLM Integration", "Multi-Context AI Applications",
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
