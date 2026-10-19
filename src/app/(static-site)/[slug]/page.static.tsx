import { RichText } from "@payloadcms/richtext-lexical/react";
import config from "@payload-config";
import { notFound } from "next/navigation";
import { getPayload } from "payload";
import { RefreshRouteOnSave } from "../RefreshRouteOnSave";

const isStaticMode = process.env.BUILD_MODE === "static";

export const dynamicParams = false;

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (isStaticMode && slug === "__empty__") notFound();

  const payload = await getPayload({ config });
  const result = await payload.find({
    collection: "pages",
    where: { slug: { equals: slug } },
    draft: !isStaticMode,
    depth: 1,
    limit: 1,
  });

  const page = result.docs[0];

  if (!page) notFound();

  const metaImage =
    typeof page.metaImage === "object" && page.metaImage !== null
      ? page.metaImage
      : null;

  return (
    <div>
      <main className="flex flex-col items-center bg-black text-white">
        {!isStaticMode && <RefreshRouteOnSave />}

        <h1 className="text-3xl font-bold">{page.title}</h1>
        <p className="text-xs">Slug: {page.slug}</p>

        {page.content && <RichText data={page.content} />}

        <section className="mt-10 w-full max-w-2xl space-y-4 border-t border-gray-700 pt-6">
          <h2 className="text-2xl font-bold">SEO Preview</h2>

          <div>
            <h3 className="text-sm font-semibold text-gray-400">
              Meta Title
            </h3>
            <p>{page.metaTitle || "Not set"}</p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-400">
              Meta Description
            </h3>
            <p className="whitespace-pre-wrap">
              {page.metaDescription || "Not set"}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-400">
              Meta Image
            </h3>

            {metaImage ? (
              <div className="space-y-2">
                {metaImage.url && (
                  <img
                    src={metaImage.url}
                    alt={metaImage.alt || page.metaTitle || page.title}
                    className="h-auto max-w-full rounded-lg"
                  />
                )}
                <p className="break-all text-xs text-gray-400">
                  {metaImage.filename || metaImage.url || "Uploaded image"}
                </p>
              </div>
            ) : (
              <p>Not set</p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const payload = await getPayload({ config });
  const pages = await payload.find({
    collection: "pages",
    draft: !isStaticMode,
  });

  const params = pages.docs.flatMap((page) =>
    typeof page.slug === "string" && page.slug.length > 0
      ? [{ slug: page.slug }]
      : [],
  );

  return params.length > 0 || !isStaticMode ? params : [{ slug: "__empty__" }];
}