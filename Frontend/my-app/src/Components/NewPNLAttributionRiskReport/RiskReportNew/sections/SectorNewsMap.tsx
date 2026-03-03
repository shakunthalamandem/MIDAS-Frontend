import React from "react";
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import GenericDataRenderer from "./GenericDataRenderer";

interface Props {
  data: any;
}

const SKIP_META = [
  "badge",
  "overall",
  "section_number",
  "label",
  "key",
];

const NAME_KEYS = ["sector", "name", "title", "sector_name", "industry", "group"];

const SectorNewsMap: React.FC<Props> = ({ data }) => {
  if (!data) return null;

  if (typeof data === "string") {
    return (
      <Box sx={{ p: 2 }}>
        <Typography sx={{ fontSize: 15, color: "#334155", lineHeight: 1.7 }}>
          {data}
        </Typography>
      </Box>
    );
  }

  let sections: any[] =
    Array.isArray(data)
      ? data
      : data.sectors ||
        data.items ||
        data.rows ||
        Object.entries(data)
          .filter(([k]) => !SKIP_META.includes(k))
          .map(([k, v]) => ({
            title: k.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
            content: v,
          }));

  if (!sections || sections.length === 0) {
    return <GenericDataRenderer data={data} accentColor="#6366f1" />;
  }

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
        gap: 3,
      }}
    >
      {sections.map((section: any, index: number) => {
        let title = section.title;

        if (!title) {
          for (const key of NAME_KEYS) {
            if (section[key]) {
              title = section[key];
              break;
            }
          }
        }

        const content =
          section.summary ||
          section.description ||
          section.overview ||
          section.content ||
          section;

        return (
          <Accordion
            key={index}
            disableGutters
            elevation={0}
            sx={{
              borderRadius: 3,
              overflow: "hidden",
              backgroundColor: "#f9fafb",
              transition: "all 0.25s ease",
              "&:before": { display: "none" },
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
              },
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon sx={{ color: "#64748b" }} />}
              sx={{
                background: "linear-gradient(90deg, #eef2ff 0%, #f8fafc 100%)",
                px: 2.5,
                py: 1.5,
              }}
            >
              <Typography
                sx={{
                  fontWeight: 600,
                  fontSize: 17,
                  color: "#1e209f",
                }}
              >
                {title}
              </Typography>
            </AccordionSummary>

            <AccordionDetails
              sx={{
                px: 3,
                py: 2.5,
                backgroundColor: "#ffffff",
              }}
            >
              {typeof content === "string" ? (
                <Typography
                  sx={{
                    fontSize: 14,
                    color: "#334155",
                    lineHeight: 1.7,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {content}
                </Typography>
              ) : typeof content === "object" ? (
                Object.entries(content)
                  .filter(([k]) => !SKIP_META.includes(k))
                  .map(([key, val]) => (
                    <Box key={key} sx={{ mb: 2 }}>
                      <Typography
                        sx={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: "#4f46e5",
                          mb: 0.5,
                        }}
                      >
                        {key
                          .replace(/_/g, " ")
                          .replace(/\b\w/g, (c) => c.toUpperCase())}
                      </Typography>

                      <Typography
                        sx={{
                          fontSize: 14,
                          color: "#334155",
                          lineHeight: 1.6,
                        }}
                      >
                        {typeof val === "string"
                          ? val
                          : JSON.stringify(val)}
                      </Typography>
                    </Box>
                  ))
              ) : null}
            </AccordionDetails>
          </Accordion>
        );
      })}
    </Box>
  );
};

export default SectorNewsMap;