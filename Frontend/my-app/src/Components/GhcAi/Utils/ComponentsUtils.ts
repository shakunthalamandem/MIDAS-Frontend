export type BlockType =
  | "text"
  | "table"
  | "card"
  | "link"
  | "chart"
  | "image"
  | "video";

export interface BaseBlock {
  type: BlockType;
  total_columns?: number;
  row?: number;
  column?: number;
}

// Text block
export interface TextBlock extends BaseBlock {
  type: "text";
  content: string;
}

// Table block
export interface TableBlock extends BaseBlock {
  type: "table";
  headers: string[];
  rows: string[][];
}

// Card block
export interface CardBlock extends BaseBlock {
  type: "card";
  title: string;
  subtitle: string;
  description: string;
  icon?: string;
}

// Link block
export interface LinkBlock extends BaseBlock {
  type: "link";
  text: string;
  url: string;
}

// Chart block
export interface ChartBlock extends BaseBlock {
  type: "chart";
  chartType: string; // e.g. 'bar', 'line', 'calendar', 'tree', etc.
  title: string;
  data: any;
}

// Image block
export interface ImageBlock extends BaseBlock {
  type: "image";
  title: string;
  description: string;
  url: string;
  alt: string;
}

// Video block
export interface VideoBlock extends BaseBlock {
  type: "video";
  title: string;
  description: string;
  url: string;
  thumbnail: string;
}

// Union of all blocks
export type Block =
  | TextBlock
  | TableBlock
  | CardBlock
  | LinkBlock
  | ChartBlock
  | ImageBlock
  | VideoBlock;
