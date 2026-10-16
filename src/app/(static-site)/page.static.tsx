import styles from "./page.module.css";
import { getPayload } from "payload";
import config from "@payload-config";
import Link from "next/link";

export default async function Home() {
  const payload = await getPayload({ config });
  const pages = (await payload.find({ collection: "pages" })).docs;

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        {pages.map((page) => (
          <div key={page.id}>
            <h1>
              <Link href={`/${page.slug}`}>{page.title}</Link>
            </h1>
          </div>
        ))}
      </main>
    </div>
  );
}
