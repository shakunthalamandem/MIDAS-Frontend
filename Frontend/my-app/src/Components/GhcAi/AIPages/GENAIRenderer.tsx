import React, { useEffect, useState } from "react";
import { Grid, CardContent } from "@mui/material";
import { motion } from "framer-motion";

import GENAITextBlock from "./GENAITextBlock";
import GENAICardBlock from "./GENAICardBlock";
import GENAIChartBlock from "./GENAIChartBlock";
import GENAICalendar from "./GENAICalendar";
import GENAITree from "./GENAITree";
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
  CalendarBlock,
  TreeBlock,
} from "../Utils/ComponentsUtils";

const BLOCK_RENDERERS: Record<BlockType, (block: Block) => JSX.Element> = {
  text: (block) => {
    const { content } = block as TextBlock;
    return <GENAITextBlock content={content} />;
  },

  table: (block) => {
    const { headers, rows } = block as TableBlock;
    return <GENAITableBlock headers={headers} rows={rows} />;
  },

  card: (block) => {
    const { title, subtitle, description, icon } = block as CardBlock;
    return (
      <GENAICardBlock
        title={title}
        subtitle={subtitle}
        description={description}
        icon={icon}
      />
    );
  },

  link: (block) => {
    const { text, url } = block as LinkBlock;
    return <GENAILinkBlock text={text} url={url} />;
  },
 calendar: (block) => {
    const { title, data } = block as CalendarBlock;
    return <GENAICalendar title={title} data={data} />;
  },

  tree: (block) => {
    const { title, data } = block as TreeBlock;
    return <GENAITree title={title} data={data} />;
  },
  chart: (block) => {
    const chartBlock = block as ChartBlock;
  
    return (
      <GENAIChartBlock
        chartType={chartBlock.chartType}
        title={chartBlock.title}
        data={chartBlock.data}
      />
    );
  },

  image: (block) => {
    const { title, description, url, alt } = block as ImageBlock;
    return (
      <GENAIImageCard
        title={title}
        description={description}
        url={url}
        alt={alt}
      />
    );
  },

  video: (block) => {
    const { title, description, url, thumbnail } = block as VideoBlock;
    return (
      <GENAIVideoCard
        title={title}
        description={description}
        url={url}
        thumbnail={thumbnail}
      />
    );
  },
};

const GENAIRenderer: React.FC<{ blocks: Block[] }> = ({ blocks }) => {
  const [visibleBlocks, setVisibleBlocks] = useState<Block[]>([]);

  useEffect(() => {
    let idx = 0;
    const interval = setInterval(() => {
      if (idx >= blocks.length) {
        clearInterval(interval);
        return;
      }
      setVisibleBlocks((prev) => [...prev, blocks[idx]]);
      idx++;
    }, 1000);

    return () => clearInterval(interval);
  }, [blocks]);

  const sortedVisibleBlocks = [...visibleBlocks].sort((a, b) => {
    const rowA = a.row ?? 0;
    const rowB = b.row ?? 0;
    if (rowA !== rowB) return rowA - rowB;

    const colA = a.column ?? 0;
    const colB = b.column ?? 0;
    return colA - colB;
  });

  const groupedByRow: Record<number, Block[]> = {};
  sortedVisibleBlocks.forEach((block) => {
    const row = block.row ?? 0;
    if (!groupedByRow[row]) groupedByRow[row] = [];
    groupedByRow[row].push(block);
  });

  const sortedRows = Object.entries(groupedByRow).sort(
    ([a], [b]) => Number(a) - Number(b)
  );

  return (
    <CardContent sx={{ paddingBottom: "0 !important" }}>
      {sortedRows.map(([rowKey, rowBlocks]) => (
        <Grid
          container
          spacing={2}
          key={`row-${rowKey}`}
          sx={{ mb: 1, alignItems: "stretch" }}
        >
          {rowBlocks.map((block, idx) => {
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
                sx={{ display: "flex", flexDirection: "column" }}
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: idx * 0.05,
                    duration: 0.4,
                    ease: "easeOut",
                  }}
                  style={{ flexGrow: 1, display: "flex" }}
                >
                  {Renderer(block)}
                </motion.div>
              </Grid>
            );
          })}
        </Grid>
      ))}
    </CardContent>
  );
};

export default GENAIRenderer;
