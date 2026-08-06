import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import react from "@astrojs/react";

export default defineConfig({
  site: "https://nisanth-alla.github.io",
  base: "/engineering-journal",
  integrations: [
    starlight({
      title: "Engineering Journal",
      description:
        "Deep dives into React, TypeScript, JavaScript, Go, and distributed systems. Interactive demos, real code, and interview prep.",
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/nisanth-alla",
        },
      ],
      sidebar: [
        {
          label: "JavaScript",
          autogenerate: { directory: "javascript" },
        },
        {
          label: "TypeScript",
          autogenerate: { directory: "typescript" },
        },
        {
          label: "React",
          autogenerate: { directory: "react" },
        },
        {
          label: "Node.js",
          autogenerate: { directory: "node" },
        },
        {
          label: "Learning Go",
          autogenerate: { directory: "go" },
        },
        {
          label: "Experiments",
          autogenerate: { directory: "experiments" },
        },
      ],
      editLink: {
        baseUrl:
          "https://github.com/nisanth-alla/engineering-journal/edit/main/",
      },
      customCss: ["./src/styles/components.css"],
    }),
    react(),
  ],
});
