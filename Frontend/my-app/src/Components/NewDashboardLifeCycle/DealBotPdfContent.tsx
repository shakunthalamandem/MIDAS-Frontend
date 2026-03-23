import React from "react";
import { Box, Divider, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import QuizRoundedIcon from "@mui/icons-material/QuizRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded";
import GENAIRenderer from "../GhcAi/AIPages/GENAIRenderer";
import { Block } from "../GhcAi/Utils/ComponentsUtils";

type DealBotPdfContentProps = {
  question: string;
  blocks: Block[];
  exportedAt: string;
  basicDealDetails: {
    ticker?: string;
    pricing_date?: string;
    deal_type?: string;
    unique_deal_id?: string;
    deal_id?: string;
  };
};

const DealBotPdfContent = React.forwardRef<HTMLDivElement, DealBotPdfContentProps>(
  ({ question, blocks, exportedAt }, ref) => {
    return (
      <Box
        ref={ref}
        sx={{
          position: "fixed",
          left: -3600,
          top: 0,
          width: 1040,
          bgcolor: "#f3f6fb",
          pointerEvents: "none",
          zIndex: -1,
          p: 2.75,
          
        }}
      >
        <Stack spacing={0}>
          <Box
            className="dealbot-pdf-section"
            data-pdf-key="dealbot-conversation"
            sx={{ width: "100%" }}
          >
            <Box
              sx={{
                borderRadius: 4,
                border: "1px solid rgba(0, 32, 96, 0.08)",
                bgcolor: "#ffffff",
                boxShadow: "0 12px 28px rgba(15, 23, 42, 0.08)",
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  px: 3,
                  py: 2,
                  background:
                    "linear-gradient(90deg, rgba(0,32,96,0.08) 0%, rgba(49,114,196,0.08) 100%)",
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1}>
                  <DescriptionRoundedIcon sx={{ color: "#002060", fontSize: 22 }} />
                  <Typography
                    sx={{
                      fontSize: 16,
                      fontWeight: 800,
                      color: "#002060",
                    }}
                  >
                    Question and Response
                  </Typography>
                </Stack>
              </Box>

              <Stack spacing={2.5} sx={{ px: 3, py: 3 }}>
                <Box
                  sx={{
                    borderRadius: 3,
                    border: `1px solid ${alpha("#002060", 0.09)}`,
                    bgcolor: alpha("#0d47a1", 0.035),
                    px: 2.2,
                    py: 1.8,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 12,
                      fontWeight: 800,
                      letterSpacing: 0.4,
                      textTransform: "uppercase",
                      color: "#31549a",
                      mb: 0.8,
                    }}
                  >
                    User Question
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: 15.7,
                      lineHeight: 1.75,
                      color: "#16233b",
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                    }}
                  >
                    {question}
                  </Typography>
                </Box>

                <Divider />

                <Box
                  sx={{
                    px: 0.5,
                    py: 0.25,
                  }}
                >
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    sx={{ mb: 1.75, px: 1.25 }}
                  >
                    <QuizRoundedIcon sx={{ color: "#002060", fontSize: 20 }} />
                    <Typography
                      sx={{
                        fontSize: 12,
                        fontWeight: 800,
                        letterSpacing: 0.4,
                        textTransform: "uppercase",
                        color: "#31549a",
                      }}
                    >
                      Deal Bot Response
                    </Typography>
                  </Stack>

                  <Box
                    sx={{
                      px: 1.25,
                      py: 0.25,
                      "& > .MuiCardContent-root": {
                        p: 0,
                      },
                      "& .MuiCardContent-root": {
                        p: 0,
                      },
                      "& .MuiGrid-container": {
                        mb: 1.9,
                        alignItems: "stretch",
                      },
                      "& .MuiGrid-item": {
                        display: "flex",
                      },
                      "& .MuiTypography-root, & p, & li, & td, & th, & span": {
                        color: "#17263f",
                      },
                      "& .MuiTypography-root": {
                        lineHeight: 1.7,
                      },
                      "& .MuiPaper-root, & .MuiCard-root": {
                        borderRadius: 3,
                        borderColor: alpha("#002060", 0.08),
                        boxShadow: "0 8px 20px rgba(2, 32, 96, 0.08)",
                        overflow: "visible",
                      },
                      "& .MuiCard-root": {
                        width: "100%",
                      },
                      "& .MuiCardContent-root > :last-child": {
                        mb: 0,
                      },
                      "& .MuiCardContent-root p, & .MuiCardContent-root li": {
                        fontSize: 13.7,
                        lineHeight: 1.75,
                      },
                      "& ul, & ol": {
                        pl: 3,
                        my: 1,
                      },
                      "& li + li": {
                        mt: 0.6,
                      },
                      "& pre, & code": {
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                      },
                      "& img, & svg, & canvas": {
                        maxWidth: "100%",
                        height: "auto",
                      },
                      "& .MuiTable-root, & table": {
                        width: "100%",
                        tableLayout: "fixed",
                        borderCollapse: "collapse",
                      },
                      "& .MuiTableCell-root, & td, & th": {
                        px: 1.7,
                        py: 1.4,
                        fontSize: 13.7,
                        lineHeight: 1.75,
                        verticalAlign: "top",
                        whiteSpace: "normal",
                        wordBreak: "break-word",
                        overflowWrap: "anywhere",
                      },
                      "& .MuiTableHead-root .MuiTableCell-root, & thead th": {
                        fontSize: 13.7,
                        fontWeight: 800,
                        color: "#223968",
                        backgroundColor: alpha("#2f67b5", 0.1),
                      },
                      "& .MuiTableBody-root .MuiTableRow-root:nth-of-type(even)": {
                        backgroundColor: alpha("#2f67b5", 0.025),
                      },
                      "& .MuiTableRow-root": {
                        breakInside: "avoid",
                        pageBreakInside: "avoid",
                      },
                      "& .MuiTableContainer-root": {
                        overflow: "visible",
                      },
                    }}
                  >
                    <GENAIRenderer blocks={blocks} renderAll disableMotion />
                  </Box>
                </Box>

                <Divider />

                <Stack direction="row" spacing={1} alignItems="center">
                  <ScheduleRoundedIcon sx={{ fontSize: 18, color: "#59719b" }} />
                  <Typography
                    sx={{
                      fontSize: 12.5,
                      fontWeight: 700,
                      color: "#59719b",
                    }}
                  >
                    Export generated on {exportedAt}
                  </Typography>
                </Stack>
              </Stack>
            </Box>
          </Box>
        </Stack>
      </Box>
    );
  }
);

DealBotPdfContent.displayName = "DealBotPdfContent";

export default DealBotPdfContent;
