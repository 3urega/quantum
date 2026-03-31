import type { MDXComponents } from "mdx/types";

/** Global MDX component overrides (App Router requires this file). */
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
  };
}
