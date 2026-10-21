import { convertLexicalToHTML } from "@payloadcms/richtext-lexical/html";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

const payloadURL = process.env.PAYLOAD_URL ?? "http://localhost:3000";
const slug = process.env.PAGE_SLUG ?? "home";

async function downloadImage(
  image: any,
  index: number,
  imagesDir: string,
): Promise<string | null> {
  if (!image?.url) return null;

  const imageURL = new URL(image.url, payloadURL);

  const originalFilename = path.basename(
    image.filename ?? imageURL.pathname,
  );

  const extension =
    path.extname(originalFilename) ||
    path.extname(imageURL.pathname) ||
    ".img";

  const imageFilename = path.basename(
    image.filename ?? `image-${index}${extension}`,
  );

  const imagePath = path.join(imagesDir, imageFilename);

  const response = await fetch(imageURL);

  if (!response.ok) {
    throw new Error(
      `Failed to download image: ${response.status} ${imageURL}`,
    );
  }

  await mkdir(imagesDir, { recursive: true });

  await writeFile(
    imagePath,
    Buffer.from(await response.arrayBuffer()),
  );

  console.log(`Downloaded image: ${imagePath}`);

  return `images/${imageFilename}`;
}

async function main() {
  const apiURL = new URL("/api/pages", payloadURL);

  apiURL.searchParams.set("where[slug][equals]", slug);
  apiURL.searchParams.set("limit", "1");
  apiURL.searchParams.set("depth", "1");
  apiURL.searchParams.set("draft", "false");

  const response = await fetch(apiURL);

  if (!response.ok) {
    throw new Error(
      `Payload API returned ${response.status}: ${await response.text()}`,
    );
  }

  const result = await response.json();
  const page = result.docs?.[0];

  if (!page) {
    throw new Error(`No published page found for slug "${slug}".`);
  }

  const outputDir = path.join(projectRoot, "dist");
  const imagesDir = path.join(outputDir, "images");

  const renderedBlocks = await Promise.all(
  (page.layout ?? []).map(async (block: any, index: number) => {
    switch (block.blockType) {
      case "simpleContent": {
        const contentHTML = block.content
          ? convertLexicalToHTML({ data: block.content })
          : "";

        return {
          component: "SimpleContent",
          props: {
            contentHTML,
          },
        };
      }

      case "imageTextBackground": {
        const image =
          typeof block.image === "object" && block.image !== null
            ? block.image
            : null;

        const imageSrc = await downloadImage(
          image,
          index,
          imagesDir,
        );

        const textHTML = block.text
          ? convertLexicalToHTML({ data: block.text })
          : "";

        return {
          component: "ImageTextBackground",
          props: {
            imageSrc,
            imageAlt: image?.alt ?? block.heading ?? "",
            imagePosition: block.imagePosition ?? "left",
            bgColor: block.bgColor ?? "black",
            heading: block.heading ?? "",
            textHTML,
            buttons: (block.buttons ?? []).map((button: any) => ({
              text: button.text,
              link: button.link,
              outline: button.outline ?? false,
              btnColor: button.btnColor ?? "blue",
            })),
          },
        };
      }

      default:
        console.warn(
          `Skipping unsupported block: ${block.blockType}`,
        );
        return null;
    }
  }),
);

const blocks = renderedBlocks.filter(
  (block): block is NonNullable<typeof block> => block !== null,
);

const componentPaths: Record<string, string> = {
  SimpleContent: "../components/SimpleContent.astro",
  ImageTextBackground: "../components/ImageTextBackground.astro",
};

const usedComponents = [...new Set(blocks.map((block) => block.component))];

const imports = usedComponents
  .map(
    (component) =>
      `import ${component} from ${JSON.stringify(componentPaths[component])};`,
  )
  .join("\n");

const markup = blocks
  .map((block) => {
    const props = Object.entries(block.props)
      .map(([key, value]) => {
        return `${key}={${JSON.stringify(value)}}`;
      })
      .join("\n      ");

    return `<${block.component}
      ${props}
    />`;
  })
  .join("\n\n  ");

const astroTemplate = `---
${imports}
---

<main>
  ${markup}
</main>
`;

await mkdir(outputDir, { recursive: true });

await writeFile(
  path.join(outputDir, "index.astro"),
  astroTemplate,
  "utf8",
);

console.log(`Generated: ${path.join(outputDir, "index.astro")}`);
console.log(`Source page: ${page.slug}`);
console.log(`Layout blocks: ${blocks.length}`);
}

main().catch((error) => {
  console.error("Failed to generate Astro page:", error);
  process.exitCode = 1;
});