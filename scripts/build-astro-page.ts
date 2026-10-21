import { convertLexicalToHTML } from "@payloadcms/richtext-lexical/html";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

const payloadURL = process.env.PAYLOAD_URL ?? "http://localhost:3000";
const slug = process.env.PAGE_SLUG ?? "home";

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

  const contentHTML = page.content
    ? convertLexicalToHTML({ data: page.content })
    : "";

  const outputDir = path.join(projectRoot, "dist");
  const imagesDir = path.join(outputDir, "images");

  let metaImageSrc: string | null = null;

  if (page.metaImage?.url) {
    const imageURL = new URL(page.metaImage.url, payloadURL);

    // Preserve the file extension, falling back to .img.
    const extension =
      path.extname(page.metaImage.filename ?? "") ||
      path.extname(imageURL.pathname) ||
      ".img";

    const imageId = page.metaImage.id ?? "meta";
    const imageFilename = path.basename(
      page.metaImage.filename ?? `meta-image${extension}`,
    );
    const imagePath = path.join(imagesDir, imageFilename);

    const imageResponse = await fetch(imageURL);

    if (!imageResponse.ok) {
      throw new Error(
        `Failed to download meta image: ${imageResponse.status} ${imageURL}`,
      );
    }

    await mkdir(imagesDir, { recursive: true });
    await writeFile(
      imagePath,
      Buffer.from(await imageResponse.arrayBuffer()),
    );

    metaImageSrc = `/images/${imageFilename}`;

    console.log(`Downloaded image: ${imagePath}`);
  }

  const astroTemplate = `---
import PageContent from "../components/PageContent.astro";
---

<PageContent
  title={${JSON.stringify(page.title)}}
  slug={${JSON.stringify(page.slug)}}
  contentHTML={${JSON.stringify(contentHTML)}}
  metaTitle={${JSON.stringify(page.metaTitle ?? null)}}
  metaImage={${JSON.stringify(metaImageSrc)}}
  metaDescription={${JSON.stringify(page.metaDescription ?? null)}}
/>
`;

  await mkdir(outputDir, { recursive: true });
  await writeFile(path.join(outputDir, "index.astro"), astroTemplate, "utf8");

  console.log(`Generated: ${path.join(outputDir, "index.astro")}`);
  console.log(`Source page: ${page.slug}`);
}

main().catch((error) => {
  console.error("Failed to generate Astro page:", error);
  process.exitCode = 1;
});