import React, { useEffect, useState, ChangeEvent } from "react";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  IconButton,
  Grid,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import { useDealWriteUpInfo } from "./DealWriteUpMain/useDealWriteUpInfo";
import FieldRenderer from "./DealWriteUpMain/FieldRenderer";
import BlueSlider from "./BlueSlider";
import { motion } from "framer-motion";

export interface DealWriteUpData {
  id?: number | string;
  ticker: string;
  pricing_date?: string;
  deal_type?: string;
  valuation?: string;
  differentiated_summary?: string;
  average_sector_return?: string | number;
  monashee_score?: string | number;
  deal_writeup_rating?: number;
}

interface Props {
  data: DealWriteUpData;
}

const DealWriteUpInfo: React.FC<Props> = ({ data }) => {
  const [formData, setFormData] = useState<DealWriteUpData>(data);
  const [editable, setEditable] = useState(false);

  const apiUrl = process.env.REACT_APP_API_URL || "";
  const token = localStorage.getItem("access_token");

  const { fetchDealWriteUpInfo, saveDealWriteUpInfo } = useDealWriteUpInfo({
    apiUrl,
    token,
    setFormData,
  });

  useEffect(() => {
    setFormData(data);
    if (data?.ticker && data?.deal_type) {
      fetchDealWriteUpInfo(data);
    }
  }, [data, fetchDealWriteUpInfo]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    const success = await saveDealWriteUpInfo(data, formData);
    if (success) setEditable(false);
  };

  const handleReadMore = () => {
    if (formData?.ticker) {
      window.open(
        `/ipo-dashboard/${formData.ticker}`,
        "_blank",
        "noopener,noreferrer"
      );
    }
  };

  const handleSliderChange = (name: keyof DealWriteUpData, value: number) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Card
        sx={{
          background: "linear-gradient(135deg, #e0ebff, #d4e2fc)",
          borderRadius: "20px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
          p: 2,
        }}
      >
        <CardContent>
          {/* Header with Edit/Save */}
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" color="#002060" fontWeight="bold">
              Deal Write-Up Info
            </Typography>
            <IconButton
              onClick={() => (editable ? handleSave() : setEditable(true))}
            >
              {editable ? (
                <SaveIcon sx={{ color: "#002060" }} />
              ) : (
                <EditIcon sx={{ color: "#002060" }} />
              )}
            </IconButton>
          </Box>

          {/* Top Fields */}
          <Grid container spacing={2} mt={2}>
            <Grid item xs={12} sm={6}>
              <FieldRenderer
                label="Sector Avg 1D Return % - Last 10 Deals"
                name="average_sector_return"
                value={formData.average_sector_return}
                editable={editable}
                adornment="%"
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FieldRenderer
                label="Monashee Score"
                name="monashee_score"
                value={formData.monashee_score}
                editable={editable}
                canEdit
                onChange={handleChange}
              />
            </Grid>
          </Grid>

          {/* Valuation */}
{/* Valuation */}
<Grid item xs={12} mt={2}>
  <Typography
    variant="subtitle1"
    color="#002060"
    fontWeight="bold"
    gutterBottom
  >
    Valuation
  </Typography>
  <Box
    sx={{
      display: "flex",
      alignItems: "flex-end", // align button with text baseline
      justifyContent: "space-between",
      overflow: "hidden",
    }}
  >
    <Typography
      variant="body2"
      sx={{
        color: "#727272ff",
        display: "-webkit-box",
        WebkitLineClamp: 3,   // 🔹 Show max 3 lines
        WebkitBoxOrient: "vertical",
        overflow: "hidden",
        textOverflow: "ellipsis",
        mr: 1,
        flex: 1,
      }}
    >
      {!formData.valuation || formData.valuation.length === 0
        ? "Not Available"
        : formData.valuation}
    </Typography>

    {formData.valuation && formData.valuation.length > 0 && (
      <Button
        onClick={handleReadMore}
        sx={{
          color: "#002060",
          fontStyle: "italic",
          fontSize: "0.8rem",
          textTransform: "none",
          minWidth: "auto",
          p: 0,
          ml: 1,
          alignSelf: "flex-end", // 🔹 Stick to last line
        }}
      >
        Read More
      </Button>
    )}
  </Box>
</Grid>

{/* Differentiated Summary */}
<Grid item xs={12} mt={2}>
  <Typography
    variant="subtitle1"
    color="#002060"
    fontWeight="bold"
    gutterBottom
  >
    Differentiated Summary
  </Typography>
  <Box
    sx={{
      display: "flex",
      alignItems: "flex-end", // align button with last line
      justifyContent: "space-between",
      overflow: "hidden",
    }}
  >
    <Typography
      variant="body2"
      sx={{
        color: "#727272ff",
        display: "-webkit-box",
        WebkitLineClamp: 3,   // 🔹 Limit to 3 lines
        WebkitBoxOrient: "vertical",
        overflow: "hidden",
        textOverflow: "ellipsis",
        mr: 1,
        flex: 1,
      }}
    >
      {!formData.differentiated_summary ||
      formData.differentiated_summary.length === 0
        ? "Not Available"
        : formData.differentiated_summary}
    </Typography>

    {formData.differentiated_summary &&
      formData.differentiated_summary.length > 0 && (
        <Button
          onClick={handleReadMore}
          sx={{
            color: "#002060",
            fontStyle: "italic",
            fontSize: "0.8rem",
            textTransform: "none",
            minWidth: "auto",
            p: 0,
            ml: 1,
            alignSelf: "flex-end", // 🔹 Stick to last line
          }}
        >
          Read More
        </Button>
      )}
  </Box>
</Grid>


          {/* Deal Write-Up Rating */}
          <Grid item xs={12}>
            <Card
              sx={{
                background: "linear-gradient(135deg, #e0eeecff, #e0eeecff)",
                borderRadius: "20px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                mt: 2,
              }}
            >
              <CardContent>
                <Typography
                  variant="body1"
                  color="#002060"
                  fontWeight="bold"
                  gutterBottom
                >
                  Deal Write-Up Rating
                </Typography>
                <BlueSlider
                  value={formData.deal_writeup_rating || 0}
                  onChange={(_, value) =>
                    handleSliderChange("deal_writeup_rating", value as number)
                  }
                  valueLabelDisplay="on"
                  step={1}
                  min={0}
                  max={100}
                  disabled={!editable}
                />
              </CardContent>
            </Card>
          </Grid>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default DealWriteUpInfo;
