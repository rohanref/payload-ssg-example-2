import type { Block } from "payload";

export const SimpleContent: Block = {
  slug: "simpleContent",
  labels: {
    singular: "Simple Content",
    plural: "Simple Content Blocks",
  },
  fields: [
    {
      name: "content",
      type: "richText",
      required: true,
      label: "Content",
    },
  ],
};