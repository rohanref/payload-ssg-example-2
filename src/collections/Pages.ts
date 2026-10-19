import type { CollectionConfig } from "payload";

export const Pages: CollectionConfig = {
  slug: "pages",
  access: {
    read: () => true,
  },
  admin: {
    useAsTitle: "title",
    livePreview: {
      url: ({ data }) => (data.slug ? `/${data.slug}` : "/"),
    },
  },
  versions: {
    drafts: {
      autosave: {
        interval: 375,
      },
    },
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
    },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
    },
    {
      name: "content",
      type: "richText",
      required: true,
    },
    {
      type: "tabs",
      tabs: [
        {
          label: "SEO",
          fields: [
            {
              name: "metaTitle",
              type: "text",
              label: "Meta Title",
              admin: {
                description:
                  "The title displayed in search engine results and browser tabs.",
              },
            },
            {
              name: "metaImage",
              type: "upload",
              relationTo: "media",
              label: "Meta Image",
              admin: {
                description:
                  "The image used for social sharing previews, such as Open Graph.",
              },
            },
            {
              name: "metaDescription",
              type: "textarea",
              label: "Meta Description",
              admin: {
                description:
                  "A short summary of this page for search engines and social previews.",
              },
            },
          ],
        },
      ],
    },
  ],
};