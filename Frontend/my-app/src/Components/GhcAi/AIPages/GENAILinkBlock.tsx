import React from "react";
import { Paper, Link } from "@mui/material";
import { getRandomBgColor } from "../Utils/colorUtils";

const GENAILinkBlock: React.FC<{ text: string; url: string }> = ({ text, url }) => (
  <Paper elevation={2} sx={{ p: 2, m: 2, bgcolor: getRandomBgColor() }}>
    <Link href={url} target="_blank" rel="noopener noreferrer">{text}</Link>
  </Paper>
);

export default GENAILinkBlock;
