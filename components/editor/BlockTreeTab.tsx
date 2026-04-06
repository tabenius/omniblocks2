"use client";

import React from "react";
import { useEditor } from "@craftjs/core";

type DropPosition = "before" | "inside" | "after";

type DropTarget = {
  parentId: string;
  index: number;
  targetId: string;
  position: DropPosition;
};

type CraftNodeLike = {
  data: {
    name?: string;
    displayName?: string;
    parent?: string | null;
    isCanvas?: boolean;
    nodes?: string[];
    linkedNodes?: Record<string, string>;
  };
};

function getDisplayName(node: CraftNodeLike | undefined, id: string): string {
  if (!node) return id;
  return node.data.displayName || node.data.name || id;
}

function getLinkedChildren(node: CraftNodeLike | undefined): string[] {
  if (!node?.data?.linkedNodes) return [];
  return Object.values(node.data.linkedNodes).filter(
    (value): value is string => typeof value === "string" && value.trim().length > 0,
  );
}

function getRegularChildren(node: CraftNodeLike | undefined): string[] {
  if (!Array.isArray(node?.data?.nodes)) return [];
  return node.data.nodes.filter(
    (value): value is string => typeof value === "string" && value.trim().length > 0,
  );
}

function getAllChildren(node: CraftNodeLike | undefined): string[] {
  return [...getLinkedChildren(node), ...getRegularChildren(node)];
}

function resolveDropPosition(
  event: React.DragEvent<HTMLDivElement>,
  isCanvas: boolean,
): DropPosition {
  const rect = event.currentTarget.getBoundingClientRect();
  const offsetY = event.clientY - rect.top;
  const topCut = rect.height * 0.28;
  const bottomCut = rect.height * 0.72;
  if (offsetY < topCut) return "before";
  if (offsetY > bottomCut) return "after";
  if (isCanvas) return "inside";
  return offsetY < rect.height / 2 ? "before" : "after";
}

export const BlockTreeTab = () => {
  const { nodes, selectedId, actions, query } = useEditor((state) => ({
    nodes: state.nodes as Record<string, CraftNodeLike>,
    selectedId: state.events.selected.values().next().value as string | undefined,
  }));

  const [draggingId, setDraggingId] = React.useState<string | null>(null);
  const [dropTarget, setDropTarget] = React.useState<DropTarget | null>(null);

  const rootChildren = React.useMemo(
    () => getAllChildren(nodes.ROOT),
    [nodes],
  );

  const canDelete = React.useCallback(
    (id: string): boolean => {
      try {
        return query.node(id).isDeletable();
      } catch {
        return false;
      }
    },
    [query],
  );

  const canDrag = React.useCallback(
    (id: string): boolean => {
      try {
        return query.node(id).isDraggable();
      } catch {
        return false;
      }
    },
    [query],
  );

  const resolveDropTarget = React.useCallback(
    (dragId: string, targetId: string, position: DropPosition): DropTarget | null => {
      if (dragId === targetId) return null;
      const dragNode = nodes[dragId];
      const targetNode = nodes[targetId];
      if (!dragNode || !targetNode) return null;

      if (position === "inside" && targetNode.data.isCanvas) {
        return {
          parentId: targetId,
          index: getRegularChildren(targetNode).length,
          targetId,
          position,
        };
      }

      const parentId = targetNode.data.parent;
      if (!parentId) return null;
      const parentNode = nodes[parentId];
      if (!parentNode) return null;

      const siblings = getRegularChildren(parentNode);
      const targetIndex = siblings.indexOf(targetId);
      if (targetIndex === -1) return null;

      let index = position === "before" ? targetIndex : targetIndex + 1;
      if (dragNode.data.parent === parentId) {
        const dragIndex = siblings.indexOf(dragId);
        if (dragIndex !== -1 && dragIndex < index) {
          index -= 1;
        }
      }

      return { parentId, index, targetId, position };
    },
    [nodes],
  );

  const isValidDrop = React.useCallback(
    (dragId: string, candidate: DropTarget | null): candidate is DropTarget => {
      if (!candidate) return false;
      try {
        return query.node(candidate.parentId).isDroppable(dragId);
      } catch {
        return false;
      }
    },
    [query],
  );

  const clearDragState = React.useCallback(() => {
    setDraggingId(null);
    setDropTarget(null);
  }, []);

  const onDropForTarget = React.useCallback(
    (event: React.DragEvent<HTMLDivElement>, targetId: string) => {
      if (!draggingId) return;
      const targetNode = nodes[targetId];
      if (!targetNode) return;

      const position = resolveDropPosition(event, Boolean(targetNode.data.isCanvas));
      const candidate = resolveDropTarget(draggingId, targetId, position);
      if (!isValidDrop(draggingId, candidate)) return;

      event.preventDefault();
      try {
        actions.move(draggingId, candidate.parentId, candidate.index);
        actions.selectNode(draggingId);
      } catch {
        // noop: Craft guards invalid moves internally; keep tree responsive.
      } finally {
        clearDragState();
      }
    },
    [
      actions,
      clearDragState,
      draggingId,
      isValidDrop,
      nodes,
      resolveDropTarget,
    ],
  );

  const TreeRow = ({ id, depth }: { id: string; depth: number }) => {
    const node = nodes[id];
    if (!node) return null;
    const name = getDisplayName(node, id);
    const children = getAllChildren(node);
    const isCanvas = Boolean(node.data.isCanvas);
    const draggable = canDrag(id);
    const deletable = canDelete(id);
    const isSelected = selectedId === id;
    const isDropHere = dropTarget?.targetId === id;

    return (
      <div key={id} className="space-y-1">
        <div
          draggable={draggable}
          onDragStart={(event) => {
            if (!draggable) return;
            event.dataTransfer.effectAllowed = "move";
            event.dataTransfer.setData("text/plain", id);
            setDraggingId(id);
            setDropTarget(null);
          }}
          onDragEnd={clearDragState}
          onDragOver={(event) => {
            if (!draggingId) return;
            const position = resolveDropPosition(event, isCanvas);
            const candidate = resolveDropTarget(draggingId, id, position);
            if (!isValidDrop(draggingId, candidate)) return;
            event.preventDefault();
            event.dataTransfer.dropEffect = "move";
            setDropTarget(candidate);
          }}
          onDrop={(event) => {
            void onDropForTarget(event, id);
          }}
          onClick={() => actions.selectNode(id)}
          className="rounded border px-2 py-1 text-xs cursor-pointer select-none"
          style={{
            marginLeft: `${depth * 12}px`,
            borderColor: isSelected || isDropHere ? "var(--color-primary)" : "var(--color-border)",
            background:
              isSelected || (isDropHere && dropTarget?.position === "inside")
                ? "var(--color-secondary)"
                : "var(--color-surface)",
            borderTopWidth: isDropHere && dropTarget?.position === "before" ? 3 : 1,
            borderBottomWidth: isDropHere && dropTarget?.position === "after" ? 3 : 1,
          }}
          title={draggable ? "Drag to reorder" : "Cannot move this block"}
        >
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-[var(--color-muted-foreground)]">
              {isCanvas ? "▣" : "•"}
            </span>
            <span className="flex-1 truncate text-[var(--color-foreground)]">{name}</span>
            {deletable ? (
              <button
                type="button"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  actions.delete(id);
                }}
                className="rounded border border-[var(--color-border)] px-1.5 py-0.5 text-[10px] text-[var(--color-muted-foreground)] hover:text-[var(--color-danger)]"
                title={`Delete ${name}`}
                aria-label={`Delete ${name}`}
              >
                Del
              </button>
            ) : null}
          </div>
        </div>
        {children.map((childId) => (
          <TreeRow key={childId} id={childId} depth={depth + 1} />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-2">
      <div className="text-[11px] text-[var(--color-muted-foreground)]">
        Select, drag to reorder, or delete blocks.
      </div>
      <div className="space-y-1">
        {rootChildren.length === 0 ? (
          <div className="text-xs text-[var(--color-muted-foreground)]">Canvas is empty.</div>
        ) : (
          rootChildren.map((id) => <TreeRow key={id} id={id} depth={0} />)
        )}
      </div>
    </div>
  );
};

