import type { Block } from "payload";

const buttonFields = [
  {
    name: "text",
    type: "text" as const,
    required: true,
    label: "Button Text",
  },
  {
    name: "link",
    type: "text" as const,
    required: true,
    label: "Button Link",
    admin: {
      description: "Enter a URL or internal path, e.g. /about",
    },
  },
  {
    name: "outline",
    type: "checkbox" as const,
    defaultValue: false,
    label: "Outline Button",
  },
  {
    name: "btnColor",
    type: "select" as const,
    defaultValue: "blue",
    label: "Background Color",
    options: [
        {
        label: "White",
        value: "white",
        },
        {
        label: "Blue",
        value: "blue",
        },
    ],
    },
];

export const ImageTextBackground: Block = {
  slug: "imageTextBackground",
  labels: {
    singular: "Image and Text on Background",
    plural: "Image and Text on Background Blocks",
  },
  fields: [
    {
        name: "imagePosition",
        type: "select",
        label: "Image Position",
        defaultValue: "left",
        options: [
            {
            label: "Left",
            value: "left",
            },
            {
            label: "Right",
            value: "right",
            },
        ],
        required: true,
    },
    {
        name: "bgColor",
        type: "select" as const,
        defaultValue: "black",
        label: "Background Color",
        options: [
        {
            label: "Black",
            value: "black",
        },
        {
            label: "Light Blue",
            value: "lightBlue",
        },
        {
            label: "Dark Blue",
            value: "darkBlue",
        },
        ],
    },
    {
      name: "image",
      type: "upload",
      relationTo: "media",
      required: true,
      label: "Image",
    },
    {
      name: "heading",
      type: "text",
      required: true,
      label: "Heading",
    },
    {
      name: "text",
      type: "richText",
      required: true,
      label: "Text",
    },
    {
      name: "buttons",
      type: "array",
      label: "Buttons",
      minRows: 0,
      maxRows: 2,
      admin: {
        description: "Add up to two buttons.",
      },
      fields: buttonFields,
    },
  ],
};