import React from "react";
import { Grid } from "@mui/material";

import GENAITextBlock from "./GENAITextBlock";
import GENAICardBlock from "./GENAICardBlock";
import GENAIChartBlock from "./GENAIChartBlock";
import GENAILinkBlock from "./GENAILinkBlock";
import GENAITableBlock from "./GENAITableBlock";
import SuggestedQuestions from "./SuggestedQuestions";

// Block types
type BlockType =
  | "text"
  | "table"
  | "card"
  | "link"
  | "chart"
  | "suggested_questions";

interface BaseBlock {
  type: BlockType;
  total_columns?: number;
  row?: number;
  column?: number;
}

// Block interfaces
interface TextBlock extends BaseBlock {
  type: "text";
  content: string;
}
interface TableBlock extends BaseBlock {
  type: "table";
  headers: string[];
  rows: string[][];
}
interface CardBlock extends BaseBlock {
  type: "card";
  title: string;
  subtitle: string;
  description: string;
  icon?: string;
}
interface LinkBlock extends BaseBlock {
  type: "link";
  text: string;
  url: string;
}
interface ChartBlock extends BaseBlock {
  type: "chart";
  chartType: string;
  title: string;
  data: any;
}
interface SuggestedQuestionsBlock extends BaseBlock {
  type: "suggested_questions";
  questions: string[];
}

type Block =
  | TextBlock
  | TableBlock
  | CardBlock
  | LinkBlock
  | ChartBlock
  | SuggestedQuestionsBlock;

// Renderer map
const BLOCK_RENDERERS: Record<
  BlockType,
  (block: any) => JSX.Element
> = {
  text: (block: TextBlock) => (
    <GENAITextBlock content={block.content} />
  ),
  table: (block: TableBlock) => (
    <GENAITableBlock
      headers={block.headers}
      rows={block.rows}
    />
  ),
  card: (block: CardBlock) => (
    <GENAICardBlock
      title={block.title}
      subtitle={block.subtitle}
      description={block.description}
      icon={block.icon}
    />
  ),
  link: (block: LinkBlock) => (
    <GENAILinkBlock text={block.text} url={block.url} />
  ),
  chart: (block: ChartBlock) => (
    <GENAIChartBlock
      chartType={block.chartType}
      title={block.title}
      data={block.data}
    />
  ),
  suggested_questions: (block: SuggestedQuestionsBlock) => (
    <SuggestedQuestions questions={block.questions} />
  ),
};

const GENAIRenderer: React.FC<{ blocks: Block[] }> = ({ blocks }) => (
  <Grid container spacing={2}>
    {blocks.map((block, idx) => {
      const Renderer = BLOCK_RENDERERS[block.type];
      const gridColumns = block.total_columns === 4 ? 12 : 6;

      return (
        <Grid
          item
          xs={12}
          sm={12}
          md={gridColumns}
          lg={gridColumns}
          key={idx}
        >
          {Renderer ? Renderer(block) : <div>Unsupported block type: {block.type}</div>}
        </Grid>
      );
    })}
  </Grid>
);

export default GENAIRenderer;
