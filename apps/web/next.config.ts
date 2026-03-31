import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const nextConfig: NextConfig = {
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  output: "standalone",
  transpilePackages: ["@quantum-ops/shared-types"],
};

const withMDX = createMDX({
  options: {
    remarkPlugins: ["remark-math", "remark-gfm"],
    rehypePlugins: [
      [
        "rehype-katex",
        {
          strict: false,
          throwOnError: false,
        },
      ],
    ],
  },
});

export default withMDX(nextConfig);
