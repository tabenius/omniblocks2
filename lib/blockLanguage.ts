import type { SerializedNode, SerializedNodes } from "@craftjs/core";

type TokenMeta = {
  typeName: string;
  displayName: string;
  positionalProp?: string;
  isCanvas: boolean;
};

type AstNode = {
  name: string;
  props: Record<string, unknown>;
  children: AstNode[];
};

type PositionedToken = {
  value: string;
  start: number;
  end: number;
};

const ROOT_ID = "ROOT";
const INDENT_SIZE = 2;
const NUMBER_RE = /^-?\d+(?:\.\d+)?$/;

const TOKEN_MAP: Record<string, TokenMeta> = {
  Container: { typeName: "Container", displayName: "Container", isCanvas: true },
  Hero: { typeName: "Hero", displayName: "Hero", isCanvas: true },
  Paragraph: {
    typeName: "Paragraph",
    displayName: "Paragraph",
    positionalProp: "text",
    isCanvas: false,
  },
  AlterParagraph: {
    typeName: "AlterParagraph",
    displayName: "AlterParagraph",
    positionalProp: "text",
    isCanvas: false,
  },
  Image: {
    typeName: "ImageBlock",
    displayName: "Image",
    positionalProp: "src",
    isCanvas: false,
  },
  Audio: {
    typeName: "Audio",
    displayName: "Audio",
    positionalProp: "src",
    isCanvas: false,
  },
  Video: {
    typeName: "Video",
    displayName: "Video",
    positionalProp: "src",
    isCanvas: false,
  },
  Event: {
    typeName: "Event",
    displayName: "Event",
    positionalProp: "title",
    isCanvas: false,
  },
  Diagram: {
    typeName: "Diagram",
    displayName: "Diagram",
    positionalProp: "source",
    isCanvas: false,
  },
  Author: {
    typeName: "Author",
    displayName: "Author",
    positionalProp: "name",
    isCanvas: false,
  },
  LinkExtended: {
    typeName: "LinkExtended",
    displayName: "LinkExtended",
    positionalProp: "href",
    isCanvas: false,
  },
  Text: { typeName: "TextBlock", displayName: "Text", isCanvas: true },
  PrimaryBox: { typeName: "PrimaryBox", displayName: "PrimaryBox", isCanvas: true },
  LayoutBlock: { typeName: "LayoutBlock", displayName: "LayoutBlock", isCanvas: false },
  Masonry: { typeName: "Masonry", displayName: "Masonry", isCanvas: true },
  Asset: { typeName: "Asset", displayName: "Asset", isCanvas: true },
  Quote: { typeName: "Quote", displayName: "Quote", isCanvas: true },
  Template: { typeName: "Template", displayName: "Template", isCanvas: false },
};

function createNode(config: {
  typeName: string;
  displayName: string;
  parent: string | null;
  isCanvas: boolean;
  props?: Record<string, unknown>;
  nodes?: string[];
  linkedNodes?: Record<string, string>;
}): SerializedNode {
  return {
    type: { resolvedName: config.typeName },
    displayName: config.displayName,
    isCanvas: config.isCanvas,
    parent: config.parent,
    props: config.props ?? {},
    nodes: config.nodes ?? [],
    linkedNodes: config.linkedNodes ?? {},
    hidden: false,
    custom: {},
  };
}

function parseScalar(raw: string): unknown {
  const lower = raw.toLowerCase();
  if (lower === "true") return true;
  if (lower === "false") return false;
  if (NUMBER_RE.test(raw)) return Number(raw);
  return raw;
}

function unquote(raw: string): string {
  if (raw.length < 2) return raw;
  if (!raw.startsWith('"') || !raw.endsWith('"')) return raw;
  return raw
    .slice(1, -1)
    .replaceAll('\\"', '"')
    .replaceAll("\\\\", "\\");
}

function tokenizeWithPosition(input: string): PositionedToken[] {
  const tokens: PositionedToken[] = [];
  let i = 0;

  while (i < input.length) {
    while (i < input.length && /\s/.test(input[i])) i += 1;
    if (i >= input.length) break;

    const start = i;
    let inQuotes = false;
    while (i < input.length) {
      const ch = input[i];
      if (ch === '"') {
        const escaped = i > start && input[i - 1] === "\\";
        if (!escaped) inQuotes = !inQuotes;
        i += 1;
        continue;
      }
      if (!inQuotes && /\s/.test(ch)) break;
      i += 1;
    }
    tokens.push({ value: input.slice(start, i), start, end: i });
  }

  return tokens;
}

function resolveMeta(rawName: string): { meta: TokenMeta; headingLevel?: number } {
  const heading = rawName.match(/^H([1-6])$/i);
  if (heading) {
    return {
      meta: {
        typeName: "Heading",
        displayName: "Heading",
        positionalProp: "text",
        isCanvas: false,
      },
      headingLevel: Number(heading[1]),
    };
  }
  const found = TOKEN_MAP[rawName];
  if (found) return { meta: found };
  throw new Error(`Unknown block '${rawName}'`);
}

function parseLineContent(content: string): {
  name: string;
  props: Record<string, unknown>;
} {
  const firstSpace = content.search(/\s/);
  const name = firstSpace === -1 ? content : content.slice(0, firstSpace);
  const rest = firstSpace === -1 ? "" : content.slice(firstSpace);
  const { meta, headingLevel } = resolveMeta(name);

  const props: Record<string, unknown> = {};
  if (typeof headingLevel === "number") props.level = headingLevel;

  const tokens = tokenizeWithPosition(rest);
  const positional: string[] = [];

  for (const token of tokens) {
    const eq = token.value.indexOf("=");
    if (eq > 0) {
      const key = token.value.slice(0, eq);
      const rawValue = token.value.slice(eq + 1);
      const clean = rawValue.startsWith('"') ? unquote(rawValue) : rawValue;
      props[key] = parseScalar(clean);
      continue;
    }
    positional.push(token.value);
  }

  if (meta.positionalProp && positional.length > 0) {
    props[meta.positionalProp] = unquote(positional.join(" "));
  }
  return { name, props };
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function highlightToken(token: string): string {
  const eq = token.indexOf("=");
  if (eq > 0) {
    const key = escapeHtml(token.slice(0, eq));
    const value = escapeHtml(token.slice(eq + 1));
    return `<span class="bl-param">${key}</span>=<span class="bl-value">${value}</span>`;
  }
  return `<span class="bl-value">${escapeHtml(token)}</span>`;
}

function makeAst(source: string): AstNode[] {
  const lines = source.split(/\r?\n/);
  const root: AstNode = { name: ROOT_ID, props: {}, children: [] };
  const stack: Array<{ depth: number; node: AstNode }> = [{ depth: -1, node: root }];

  for (let i = 0; i < lines.length; i += 1) {
    const lineNumber = i + 1;
    const raw = lines[i];
    if (raw.trim() === "") continue;

    const leading = raw.match(/^\s*/)?.[0] ?? "";
    if (leading.length % INDENT_SIZE !== 0) {
      throw new Error(`Line ${lineNumber}: indentation must be multiples of ${INDENT_SIZE} spaces`);
    }

    const depth = leading.length / INDENT_SIZE;
    const parsed = parseLineContent(raw.trim());
    const node: AstNode = {
      name: parsed.name,
      props: parsed.props,
      children: [],
    };

    while (stack.length > 0 && stack[stack.length - 1].depth >= depth) {
      stack.pop();
    }
    const parent = stack[stack.length - 1];
    if (!parent || depth > parent.depth + 1) {
      throw new Error(`Line ${lineNumber}: invalid indentation depth`);
    }
    parent.node.children.push(node);
    stack.push({ depth, node });
  }

  return root.children;
}

function buildSerializedNodes(astNodes: AstNode[]): SerializedNodes {
  const nodes: SerializedNodes = {
    [ROOT_ID]: createNode({
      typeName: "Container",
      displayName: "Container",
      parent: null,
      isCanvas: true,
      props: {
        padding: "24px",
        background: "var(--color-background)",
      },
      nodes: [],
      linkedNodes: {},
    }),
  };

  let nextId = 1;
  const newId = () => `n${nextId++}`;

  const attach = (astNode: AstNode, parentId: string): string => {
    const { meta, headingLevel } = resolveMeta(astNode.name);
    const id = newId();
    const props = { ...astNode.props };
    if (typeof headingLevel === "number") props.level = headingLevel;

    const childNodeIds: string[] = [];
    const linkedNodes: Record<string, string> = {};

    if (meta.typeName === "LayoutBlock") {
      const columnsRaw = props.columns;
      const columns =
        typeof columnsRaw === "number" && Number.isFinite(columnsRaw)
          ? Math.max(1, Math.trunc(columnsRaw))
          : 2;
      for (let i = 0; i < astNode.children.length; i += 1) {
        const childId = attach(astNode.children[i], id);
        if (i < columns) linkedNodes[`column-${i}`] = childId;
        else childNodeIds.push(childId);
      }
    } else {
      for (const child of astNode.children) {
        childNodeIds.push(attach(child, id));
      }
    }

    const isCanvas =
      meta.isCanvas ||
      childNodeIds.length > 0 ||
      Object.keys(linkedNodes).length > 0;

    nodes[id] = createNode({
      typeName: meta.typeName,
      displayName: meta.displayName,
      parent: parentId,
      isCanvas,
      props,
      nodes: childNodeIds,
      linkedNodes,
    });

    return id;
  };

  nodes[ROOT_ID].nodes = astNodes.map((node) => attach(node, ROOT_ID));
  return nodes;
}

export function parseBlockLanguage(source: string): SerializedNodes {
  const ast = makeAst(source);
  return buildSerializedNodes(ast);
}

export function highlightBlockLanguage(source: string): string {
  const lines = source.split(/\r?\n/);
  return lines
    .map((raw) => {
      if (raw.trim() === "") return "";
      const leading = raw.match(/^\s*/)?.[0] ?? "";
      const content = raw.trim();
      const firstSpace = content.search(/\s/);
      const name = firstSpace === -1 ? content : content.slice(0, firstSpace);
      const rest = firstSpace === -1 ? "" : content.slice(firstSpace);

      const tokens = tokenizeWithPosition(rest);
      let out = `<span class="bl-name">${escapeHtml(name)}</span>`;
      let cursor = 0;
      for (const token of tokens) {
        out += escapeHtml(rest.slice(cursor, token.start));
        out += highlightToken(token.value);
        cursor = token.end;
      }
      out += escapeHtml(rest.slice(cursor));
      return `${escapeHtml(leading)}${out}`;
    })
    .join("\n");
}
