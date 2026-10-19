import { withPayload } from "@payloadcms/next/withPayload";

const isStaticMode = process.env.BUILD_MODE === "static";

/** @type {import('next').NextConfig} */
const nextConfig = {
  ...(isStaticMode && {
    // BASE PATH for cpanel host test
    basePath: "/ssg-test",
    output: "export",
    distDir: "dist",
  }),

  pageExtensions: ["static.tsx", "static.ts", "static.jsx", "static.js"],
};

if (!isStaticMode) {
  nextConfig.pageExtensions.push("tsx", "ts", "jsx", "js");
}

function withStaticPayload(nextConfig) {
  return isStaticMode ? nextConfig : withPayload(nextConfig);
}

export default withStaticPayload(nextConfig);