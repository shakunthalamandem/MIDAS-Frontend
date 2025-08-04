export type BlockType =
  | "text"
  | "table"
  | "card"
  | "link"
  | "chart"
  | "image"
  | "video"
  | "calendar"
  | "tree"
  | "suggested_questions";

export interface SuggestedQuestionsBlock extends BaseBlock {
  type: "suggested_questions";
  questions: string[];
}


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

// General Chart block fallback (for unknown or other chartTypes)
export interface ChartBlock extends BaseBlock {
  type: "chart";
  chartType: string;
  title: string;
  data: any;
}

export interface CalendarBlock extends BaseBlock {
  type: "calendar";
  title: string;
  data: {
    date: string;
    label: string;
  }[];
}

export interface TreeBlock extends BaseBlock {
  type: "tree";
  title: string;
  data: {
    name: string;
    children?: TreeBlock["data"][];
  };
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

export type Block =
  | TextBlock
  | TableBlock
  | CardBlock
  | LinkBlock
  | ImageBlock
  | VideoBlock
  | CalendarBlock
  | TreeBlock
  | ChartBlock
  | SuggestedQuestionsBlock;

