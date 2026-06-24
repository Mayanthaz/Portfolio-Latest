import { createFileRoute } from "@tanstack/react-router";
import Portfolio from "@/components/portfolio/Portfolio";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Mayantha Portfolio — Full Stack Software Engineer" },
      {
        name: "description",
        content:
          "Software Engineering undergraduate building reliable full-stack, mobile and API-driven products.",
      },
      { property: "og:title", content: "Mayantha Portfolio — Full Stack Software Engineer" },
      {
        property: "og:description",
        content: "Portfolio of Mayantha Udayanga — Java, Spring Boot, Node.js, .NET, REST APIs.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Portfolio,
});
