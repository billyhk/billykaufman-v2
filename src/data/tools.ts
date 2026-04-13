export type ToolCategory = {
  title: string;
  items: string[];
};

export const toolsData: ToolCategory[] = [
  { title: "IDE",             items: ["VS Code", "Cursor", "PyCharm"] },
  { title: "Version Control", items: ["Git", "GitHub", "GitLab", "Bitbucket"] },
  { title: "Project Mgmt",    items: ["Jira", "Agile", "Asana", "ClickUp"] },
  { title: "Design",          items: ["Figma", "Storybook", "draw.io"] },
];
