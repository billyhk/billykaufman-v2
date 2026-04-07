export type ToolCategory = {
  title: string;
  items: string[];
};

export const toolsData: ToolCategory[] = [
  { title: "IDE",              items: ["Cursor", "VS Code"] },
  { title: "Version Control",  items: ["Git", "GitHub", "GitLab", "Bitbucket"] },
  { title: "Project Mgmt",     items: ["Jira", "Linear", "Asana", "ClickUp"] },
  { title: "Design",           items: ["Figma", "Storybook"] },
];
