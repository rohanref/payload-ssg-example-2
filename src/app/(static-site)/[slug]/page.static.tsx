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

  return (
    <div>
      {!isStaticMode && <RefreshRouteOnSave />}

      <main className="flex flex-col">
        {page.layout?.map((block) => {
          switch (block.blockType) {
            case "simpleContent":
              return (
                <section key={block.id} className="mx-auto w-full max-w-5xl px-6 py-12">
                  <RichText data={block.content} />
                </section>
              );

            case "imageTextBackground": {
              const image =
                typeof block.image === "object" && block.image !== null
                  ? block.image
                  : null;

              const backgroundClasses = {
                black: "bg-black",
                lightBlue: "bg-sky-100 text-gray-900",
                darkBlue: "bg-blue-950",
              };

              const sectionBackground =
                backgroundClasses[block.bgColor ?? "black"] ?? "bg-black";

              return (
                <section
                  key={block.id}
                  className={`p-5`}
                >
                  <div
                    className={`p-5 rounded-lg flex flex-col ${
                      block.imagePosition === "right"
                        ? "md:flex-row-reverse"
                        : "md:flex-row"
                    }
                    ${sectionBackground} ${
                      block.bgColor === "lightBlue" ? "" : "text-white"
                    }
                    `}
                  >
                    {/* Image */}
                    <div className="md:w-1/2">
                      {image?.url && (
                        <img
                          src={image.url}
                          alt={image.alt || block.heading}
                          className="h-auto w-full rounded-lg"
                          style={{
                            left: block.imagePosition === "right" ? "auto" : 0,
                            right: block.imagePosition === "right" ? 0 : "auto",
                          }}
                        />
                      )}
                    </div>

                    {/* Text content */}
                    <div className="flex items-center px-6 py-12 md:w-1/2 md:px-12 lg:px-16">
                      <div className="w-full">
                        <h2 className="mb-6 text-3xl font-bold md:text-4xl">
                          {block.heading}
                        </h2>

                        <div className="max-w-2xl">
                          <RichText data={block.text} />
                        </div>

                        {block.buttons && block.buttons.length > 0 && (
                          <div className="mt-8 flex flex-wrap gap-4">
                            {block.buttons.map((button, index) => {
                              const isWhite = button.btnColor === "white";

                              const colorClasses = isWhite
                                ? button.outline
                                  ? "border-white text-white hover:bg-white hover:text-black"
                                  : "border-white bg-white text-black hover:bg-gray-200"
                                : button.outline
                                  ? "border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white"
                                  : "border-blue-600 bg-blue-600 text-white hover:bg-blue-700";

                              return (
                                <a
                                  key={button.id ?? index}
                                  href={button.link}
                                  className={`inline-flex items-center justify-center rounded-md border-2 px-6 py-3 font-semibold transition-colors ${colorClasses}`}
                                >
                                  {button.text}
                                </a>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </section>
              );
            }

            default:
              return null;
          }
        })}
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

  return params.length > 0 || !isStaticMode
    ? params
    : [{ slug: "__empty__" }];
}