import React from "react";
import { Grid } from "@mui/material";

import GENAITextBlock from "./GENAITextBlock";
import GENAICardBlock from "./GENAICardBlock";
import GENAIChartBlock from "./GENAIChartBlock";
import GENAILinkBlock from "./GENAILinkBlock";
import GENAITableBlock from "./GENAITableBlock";

type BlockType = "text" | "table" | "card" | "link" | "chart";

interface BaseBlock {
  type: BlockType;
  total_columns?: number;
  row?: number;
  column?: number;
}

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

type Block = TextBlock | TableBlock | CardBlock | LinkBlock | ChartBlock;

const GENAIRenderer: React.FC<{ blocks: Block[] }> = ({ blocks }) => (
  <Grid container spacing={2}>
    {blocks.map((block, idx) => {
      let content: React.ReactNode;

      switch (block.type) {
        case "text":
          content = <GENAITextBlock content={block.content} />;
          break;
        case "table":
          content = <GENAITableBlock headers={block.headers} rows={block.rows} />;
          break;
        case "card":
          content = (
            <GENAICardBlock
              title={block.title}
              subtitle={block.subtitle}
              description={block.description}
              icon={block.icon}
            />
          );
          break;
        case "link":
          content = <GENAILinkBlock text={block.text} url={block.url} />;
          break;
        case "chart":
          content = (
            <GENAIChartBlock
              chartType={block.chartType}
              data={block.data}
              title={block.title}
            />
          );
          break;
        default:
          content = <div>Unsupported type: {(block as any).type}</div>;
      }

      return (
        <Grid
          item
          xs={12}
          sm={12}
          md={6}
          lg={block.total_columns === 4 ? 12 : 6}
          key={idx}
        >
          {content}
        </Grid>
      );
    })}
  </Grid>
);

export default GENAIRenderer;
