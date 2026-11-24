import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { statuses } from "./statuses";

// Every page of the site. A page whose metadata does not match the schema
// fails the build.
const pages = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/pages" }),
  schema: z.strictObject({
    title: z.string().min(1),
    description: z.string().min(1),
    status: z.enum(statuses),
  }),
});

export const collections = { pages };
