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
        "Deep dives into JavaScript, TypeScript, React, Node.js, Next.js, Go, Databases, Playwright, and distributed systems. Interactive demos, real code, and interview prep.",
      head: [
        {
          tag: "link",
          attrs: { rel: "preconnect", href: "https://fonts.googleapis.com" },
        },
        {
          tag: "link",
          attrs: {
            rel: "preconnect",
            href: "https://fonts.gstatic.com",
            crossorigin: "",
          },
        },
        {
          tag: "link",
          attrs: {
            rel: "stylesheet",
            href: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:ital,wght@0,400;0,500;1,400&display=swap",
          },
        },
      ],
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/nisanth-alla",
        },
      ],
      sidebar: [
        { label: "JavaScript", items: [{ autogenerate: { directory: "javascript" } }] },
        { label: "TypeScript", items: [{ autogenerate: { directory: "typescript" } }] },
        { label: "React", items: [{ autogenerate: { directory: "react" } }] },
        { label: "Next.js", items: [{ autogenerate: { directory: "nextjs" } }] },
        { label: "Node.js", items: [{ autogenerate: { directory: "node" } }] },
        { label: "Learning Go", items: [{ autogenerate: { directory: "go" } }] },
        { label: "Databases", items: [{ autogenerate: { directory: "databases" } }] },
        { label: "Interview Prep", items: [{ autogenerate: { directory: "interview" } }] },
        { label: "Playwright", items: [{ autogenerate: { directory: "playwright" } }] },
        { label: "Experiments", items: [{ autogenerate: { directory: "experiments" } }] },
        { label: "Build Notes", items: [{ autogenerate: { directory: "build-notes" } }] },
      ],
      editLink: {
        baseUrl: "https://github.com/nisanth-alla/engineering-journal/edit/main/",
      },
      customCss: ["./src/styles/components.css"],
      components: {
        ThemeSelect: "./src/components/ThemeSelect.astro",
      },
    }),
    react(),
  ],
});
