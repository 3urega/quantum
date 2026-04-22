import type { MDXComponents } from "mdx/types";
import { LearnChapterNav } from "@/components/learn/LearnChapterNav";

/** Global MDX component overrides (App Router requires this file). */
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    LearnChapterNav,
  };
}
