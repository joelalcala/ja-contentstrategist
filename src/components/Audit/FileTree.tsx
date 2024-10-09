import React from 'react';
import { ChevronDown, ChevronRight, Folder, Home } from 'lucide-react';

interface TreeNode {
  name: string;
  children: TreeNode[];
  path: string;
  count: number;
  isFolder: boolean;
}

interface FileTreeProps {
  tree: TreeNode;
  selectedPath: string;
  setSelectedPath: (path: string) => void;
}

export function FileTree({ tree, selectedPath, setSelectedPath }: FileTreeProps) {
  const [expanded, setExpanded] = React.useState<{ [key: string]: boolean }>({});

  const toggleExpand = (path: string) => {
    setExpanded(prev => ({ ...prev, [path]: !prev[path] }));
  };

  const renderNode = (node: TreeNode) => {
    const isExpanded = expanded[node.path];
    const isSelected = selectedPath === node.path;

    return (
      <div key={node.path}>
        <div
          className={`flex items-center py-1 px-2 cursor-pointer hover:bg-gray-100 ${
            isSelected ? 'bg-blue-100' : ''
          }`}
          onClick={() => {
            setSelectedPath(node.path);
            if (node.children.length > 0) {
              toggleExpand(node.path);
            }
          }}
        >
          {node.children.length > 0 ? (
            isExpanded ? (
              <ChevronDown className="w-4 h-4 mr-1" />
            ) : (
              <ChevronRight className="w-4 h-4 mr-1" />
            )
          ) : null}
          {node.path === '/' ? (
            <Home className="w-4 h-4 mr-1" />
          ) : (
            <Folder className="w-4 h-4 mr-1" />
          )}
          <span className="flex-grow">{node.name}</span>
          <span className="text-sm text-gray-500">({node.count})</span>
        </div>
        {isExpanded && node.children.length > 0 && (
          <div className="ml-4">
            {node.children.map(child => renderNode(child))}
          </div>
        )}
      </div>
    );
  };

  return <div className="text-sm">{renderNode(tree)}</div>;
}