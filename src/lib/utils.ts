import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface TreeNode {
  name: string;
  children: TreeNode[];
  path: string;
  count: number;
  isFolder: boolean;
}

export function buildFolderTree(pages: Array<{ url: string }>, domain: string): TreeNode {
  const decodedDomain = decodeURIComponent(domain);
  const rootName = decodedDomain.replace(/^(https?:\/\/)?(www\.)?/, '');
  const root: TreeNode = { name: rootName, children: [], path: '/', count: 0, isFolder: true };
  const pathCounts: { [key: string]: number } = {};

  pages.forEach(page => {
    if (!page.url) return; // Skip pages without a URL

    const path = new URL(page.url).pathname;
    const parts = path.split('/').filter(Boolean);
    let currentNode = root;
    let currentPath = '';

    parts.forEach((part, index) => {
      currentPath += '/' + part;
      if (!pathCounts[currentPath]) {
        pathCounts[currentPath] = 0;
      }
      pathCounts[currentPath]++;

      if (index < parts.length - 1 || parts.length === 0) { // Only create folder nodes
        let child = currentNode.children.find(c => c.name === part);
        if (!child) {
          child = { name: part, children: [], path: currentPath, count: 0, isFolder: true };
          currentNode.children.push(child);
        }
        currentNode = child;
      }
    });
  });

  // Update counts for each node
  function updateCounts(node: TreeNode): number {
    node.count = pathCounts[node.path] || 0;
    node.children.forEach(child => {
      node.count += updateCounts(child);
    });
    return node.count;
  }

  updateCounts(root);

  return root;
}



