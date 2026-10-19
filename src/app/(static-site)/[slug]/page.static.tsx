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
    limit: 1,
  });
  const page = result.docs[0];

  if (!page) notFound();

  return (
    <div>
      <main className="bg-black text-white justify-center">
        {!isStaticMode && <RefreshRouteOnSave />}
        <h1 className="font-normal text-xs">{page.title}</h1>
        <p>Slug: {page.slug}</p>
        {page.content && <RichText data={page.content} />}
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