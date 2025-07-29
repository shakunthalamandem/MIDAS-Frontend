import React from "react";
import { Grid, Box } from "@mui/material";

import GENAITextBlock from "./GENAITextBlock";
import GENAICardBlock from "./GENAICardBlock";
import GENAIChartBlock from "./GENAIChartBlock";
import GENAILinkBlock from "./GENAILinkBlock";
import GENAITableBlock from "./GENAITableBlock";
import GENAIImageCard from "./GENAIImageCard";
import GENAIVideoCard from "./GENAIVideoCard";

import {
  Block,
  BlockType,
  TextBlock,
  TableBlock,
  CardBlock,
  LinkBlock,
  ChartBlock,
  ImageBlock,
  VideoBlock,
} from "../Utils/ComponentsUtils";

const BLOCK_RENDERERS: Record<BlockType, (block: any) => JSX.Element> = {
  text: (block: TextBlock) => <GENAITextBlock content={block.content} />,
  table: (block: TableBlock) => (
    <GENAITableBlock headers={block.headers} rows={block.rows} />
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
  image: (block: ImageBlock) => (
    <GENAIImageCard
      title={block.title}
      description={block.description}
      url={block.url}
      alt={block.alt}
    />
  ),
  video: (block: VideoBlock) => (
    <GENAIVideoCard
      title={block.title}
      description={block.description}
      url={block.url}
      thumbnail={block.thumbnail}
    />
  ),
};

const GENAIRenderer: React.FC<{ blocks: Block[] }> = ({ blocks }) => {
  // Group blocks by row
  const groupedByRow: Record<number, Block[]> = {};
  blocks.forEach((block) => {
    const row = block.row ?? 0;
    if (!groupedByRow[row]) groupedByRow[row] = [];
    groupedByRow[row].push(block);
  });

  const sortedRows = Object.entries(groupedByRow).sort(
    ([a], [b]) => Number(a) - Number(b)
  );

  return (
    <>
      {sortedRows.map(([rowKey, rowBlocks]) => {
        const sortedBlocks = rowBlocks.sort(
          (a, b) => (a.column ?? 0) - (b.column ?? 0)
        );

        return (
          <Grid
            container
            spacing={3}
            key={`row-${rowKey}`}
            sx={{ mb: 2, alignItems: "stretch" }}
          >
            {sortedBlocks.map((block, idx) => {
              const Renderer = BLOCK_RENDERERS[block.type];
              if (!Renderer) return null;

              const totalCols = block.total_columns || 1;
              const gridSize =
                totalCols >= 1 && totalCols <= 12
                  ? Math.floor(12 / totalCols)
                  : 12;

              return (
                <Grid
                  item
                  xs={12}
                  sm={12}
                  md={gridSize}
                  lg={gridSize}
                  key={idx}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Box sx={{ flexGrow: 1 }}>{Renderer(block)}</Box>
                </Grid>
              );
            })}
          </Grid>
        );
      })}
    </>
  );
};

export default GENAIRenderer;
