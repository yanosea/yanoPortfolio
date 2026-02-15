/**
 * Tree Command
 */

// types
import type { Command } from "@/types/terminal.ts";

// utils
import { CSS_CLASSES } from "@/assets/scripts/core/constants.ts";
import { TREE_CHARS } from "../core/config.ts";
import { parseFlags } from "../core/options.ts";
import { getAllPages } from "../core/utils.ts";

/**
 * Tree command options
 */
interface TreeOptions {
  /** Maximum depth to traverse (null for unlimited) */
  maxDepth: number | null;
  /** Show only directories */
  directoriesOnly: boolean;
  /** Show hidden files */
  showAll: boolean;
}

/**
 * Tree node representation
 */
interface TreeNode {
  /** Node name */
  name: string;
  /** Full path */
  path: string;
  /** Whether node is a directory */
  isDirectory: boolean;
  /** Whether node has a navigable link */
  hasLink: boolean;
  /** Child nodes */
  children: TreeNode[];
}

/**
 * Default tree options
 */
const DEFAULT_OPTIONS: TreeOptions = {
  maxDepth: null,
  directoriesOnly: false,
  showAll: false,
};

/**
 * Tree flag handlers
 */
const FLAG_HANDLERS: Record<
  string,
  (opts: TreeOptions, value?: string) => void
> = {
  d: (opts) => {
    opts.directoriesOnly = true;
  },
  a: (opts) => {
    opts.showAll = true;
  },
  L: (opts, value) => {
    if (value) {
      const depth = parseInt(value, 10);
      if (!isNaN(depth) && depth > 0) opts.maxDepth = depth;
    }
  },
};

/**
 * Build tree structure from page paths
 * @param pages - Array of page info
 * @returns Root tree node
 */
function buildTreeStructure(pages: { name: string; path: string }[]): TreeNode {
  const root: TreeNode = {
    name: ".",
    path: "/",
    isDirectory: true,
    hasLink: false,
    children: [],
  };

  pages.forEach((page) => {
    const pathParts = page.path.split("/").filter((p) => p);

    if (pathParts.length === 0) {
      root.children.push({
        name: page.name,
        path: page.path,
        isDirectory: false,
        hasLink: false,
        children: [],
      });
    } else if (pathParts.length === 1) {
      const existingDir = root.children.find((n) =>
        n.name === page.name && n.isDirectory
      );
      if (existingDir) {
        existingDir.hasLink = true;
      } else {
        const existingFile = root.children.find((n) =>
          n.name === page.name && !n.isDirectory
        );
        if (!existingFile) {
          root.children.push({
            name: page.name,
            path: page.path,
            isDirectory: false,
            hasLink: false,
            children: [],
          });
        }
      }
    } else {
      let currentNode = root;
      for (let i = 0; i < pathParts.length - 1; i++) {
        const dirName = pathParts[i];
        const dirPath = "/" + pathParts.slice(0, i + 1).join("/");
        let dirNode = currentNode.children.find((n) =>
          n.name === dirName && n.isDirectory
        );
        if (!dirNode) {
          dirNode = {
            name: dirName,
            path: dirPath,
            isDirectory: true,
            hasLink: false,
            children: [],
          };
          const fileIndex = currentNode.children.findIndex((n) =>
            n.name === dirName && !n.isDirectory
          );
          if (fileIndex !== -1) {
            dirNode.hasLink = true;
            currentNode.children.splice(fileIndex, 1);
          }
          currentNode.children.push(dirNode);
        }
        currentNode = dirNode;
      }
      currentNode.children.push({
        name: pathParts[pathParts.length - 1],
        path: page.path,
        isDirectory: false,
        hasLink: false,
        children: [],
      });
    }
  });

  return root;
}

/**
 * Count directories and files in tree
 * @param node - Tree node to count
 * @returns Count of directories and files
 */
function countNodes(node: TreeNode): { directories: number; files: number } {
  let directories = 0;
  let files = 0;

  node.children.forEach((child) => {
    if (child.isDirectory) {
      directories++;
      const childCounts = countNodes(child);
      directories += childCounts.directories;
      files += childCounts.files;
    } else {
      files++;
    }
  });

  return { directories, files };
}

/**
 * Render tree node to string
 * @param node - Tree node to render
 * @param prefix - Prefix for indentation
 * @param isLast - Whether this is the last child
 * @param currentDepth - Current depth in tree
 * @param options - Tree display options
 * @returns Array of rendered lines
 */
function renderTree(
  node: TreeNode,
  prefix: string = "",
  isLast: boolean = true,
  currentDepth: number = 0,
  options: TreeOptions,
): string[] {
  const lines: string[] = [];

  if (options.maxDepth !== null && currentDepth > options.maxDepth) {
    return lines;
  }

  if (node.name === ".") {
    lines.push(".");
    const childrenToRender = options.directoriesOnly
      ? node.children.filter((child) => child.isDirectory)
      : node.children;

    childrenToRender.forEach((child, index) => {
      const isLastChild = index === childrenToRender.length - 1;
      lines.push(...renderTree(child, "", isLastChild, 1, options));
    });
  } else {
    if (options.directoriesOnly && !node.isDirectory) return lines;

    const branch = isLast ? TREE_CHARS.LAST_BRANCH : TREE_CHARS.BRANCH;
    let nodeName: string;
    if (node.isDirectory) {
      nodeName = node.hasLink
        ? `<a href="${node.path}" class="${CSS_CLASSES.LINK}">${node.name}/</a>`
        : `<span class="${CSS_CLASSES.INFO}">${node.name}/</span>`;
    } else {
      nodeName =
        `<a href="${node.path}" class="${CSS_CLASSES.LINK}">${node.name}</a>`;
    }

    lines.push(`${prefix}${branch} ${nodeName}`);

    if (node.children.length > 0) {
      const childrenToRender = options.directoriesOnly
        ? node.children.filter((child) => child.isDirectory)
        : node.children;

      if (childrenToRender.length > 0) {
        const childPrefix = prefix +
          (isLast ? TREE_CHARS.SPACE : TREE_CHARS.VERTICAL) + "   ";
        childrenToRender.forEach((child, index) => {
          const isLastChild = index === childrenToRender.length - 1;
          lines.push(
            ...renderTree(
              child,
              childPrefix,
              isLastChild,
              currentDepth + 1,
              options,
            ),
          );
        });
      }
    }
  }

  return lines;
}

export const tree: Command = {
  name: "tree",
  description: "Display site structure as tree",
  execute: async (args: string[] = []) => {
    const { options } = parseFlags(
      args,
      { ...DEFAULT_OPTIONS },
      FLAG_HANDLERS,
      ["L"],
    );
    const pages = await getAllPages();
    const treeRoot = buildTreeStructure(pages);
    const treeLines = renderTree(treeRoot, "", true, 0, options);

    const counts = countNodes(treeRoot);
    const dirLabel = counts.directories === 1 ? "directory" : "directories";
    const fileLabel = counts.files === 1 ? "file" : "files";

    treeLines.push("");
    treeLines.push(
      `<span class="${CSS_CLASSES.SUCCESS}">${counts.directories} ${dirLabel}, ${counts.files} ${fileLabel}</span>`,
    );

    return `<pre>${treeLines.join("\n")}</pre>`;
  },
};
