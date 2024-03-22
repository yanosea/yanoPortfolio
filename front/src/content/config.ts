import { defineCollection, z } from "astro:content";

const about = defineCollection({
  type: "content",
  schema: z.object({
    image: z.object({
      url: z.string(),
      alt: z.string(),
    }),
    greeting: z.object({
      subject: z.string(),
      description: z.string(),
    }),
    likes: z.array(
      z.object({
        subject: z.string(),
        description: z.string(),
      }),
    ),
  }),
});
const blog = defineCollection({
  type: "content",
  schema: z.object({
    date: z.date(),
    title: z.string(),
    title_icon: z.string(),
    description: z.string(),
    images: z.array(
      z.object({
        url: z.string(),
        alt: z.string(),
      }).optional(),
    ),
    tags: z.array(z.string()).optional(),
  }),
});
const links = defineCollection({
  type: "content",
  schema: z.object({
    links: z.array(
      z.object({
        icon: z.string(),
        name: z.string(),
        url: z.string(),
      }),
    ),
    tags: z.array(z.string()).optional(),
  }),
});

export const collections = { about, blog, links };
