import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

export default defineConfig({
  site: "https://nisanth-alla.github.io",
  base: "/engineering-journal",
  integrations: [
    starlight({
      title: "Engineering Journal",
      description:
        "Notes, experiments, and lessons from building distributed systems, learning Go, and studying system design.",
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/nisanth-alla",
        },
      ],
      sidebar: [
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
      customCss: [],
    }),
  ],
});
