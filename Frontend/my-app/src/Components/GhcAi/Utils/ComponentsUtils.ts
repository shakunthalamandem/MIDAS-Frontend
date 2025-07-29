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

// Block Types
export interface TextBlock extends BaseBlock {
  type: "text";
  content: string;
}

export interface TableBlock extends BaseBlock {
  type: "table";
  headers: string[];
  rows: string[][];
}

export interface CardBlock extends BaseBlock {
  type: "card";
  title: string;
  subtitle: string;
  description: string;
  icon?: string;
}

export interface LinkBlock extends BaseBlock {
  type: "link";
  text: string;
  url: string;
}

export interface ChartBlock extends BaseBlock {
  type: "chart";
  chartType: string;
  title: string;
  data: any;
}

export interface ImageBlock extends BaseBlock {
  type: "image";
  title: string;
  description: string;
  url: string;
  alt: string;
}

export interface VideoBlock extends BaseBlock {
  type: "video";
  title: string;
  description: string;
  url: string;
  thumbnail: string;
}

// Union
export type Block =
  | TextBlock
  | TableBlock
  | CardBlock
  | LinkBlock
  | ChartBlock
  | ImageBlock
  | VideoBlock;
