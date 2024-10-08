import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function buildFolderTree(pages: Array<{ path: string }>) {
  const tree: Record<string, any> = { "/": {} }
  pages.forEach(page => {
    const parts = page.path.split('/').filter(Boolean)
    let current = tree["/"]
    parts.forEach((part, index) => {
      if (index === parts.length - 1) return // Skip the last part (file name)
      if (!current[part]) {
        current[part] = {}
      }
      current = current[part]
    })
  })
  return tree
}
