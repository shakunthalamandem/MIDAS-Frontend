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
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

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
  deal_writeup_rating?: {
    score?: number;
    revenue?: number;
    growth?: number;
    net_income?: number;
  };
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
    setFormData({
      ...data,
      deal_writeup_rating: data.deal_writeup_rating || {},
    });
    if (data?.ticker && data?.deal_type) fetchDealWriteUpInfo(data);
  }, [data, fetchDealWriteUpInfo]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSliderChange = (value: number) => {
    setFormData(prev => ({
      ...prev,
      deal_writeup_rating: { ...prev.deal_writeup_rating, score: value },
    }));
  };

const handleSave = async () => {
  const payload = {
    average_sector_return: formData.average_sector_return,
    deal_type: formData.deal_type,
    deal_writeup_rating: undefined, // other ratings read-only
    differentiated_summary: formData.differentiated_summary,
    id: formData.id,
    monashee_score: formData.monashee_score,
    pricing_date: formData.pricing_date,
    ticker: formData.ticker,
    valuation: formData.valuation,
  };

  try {
    const success = await saveDealWriteUpInfo(data, payload);

    if (success) {
      alert("Saved successfully!");   // ✅ show success alert
      setEditable(false);             // ✅ disable edit mode
      await fetchDealWriteUpInfo(data); // ✅ refetch fresh data
    } else {
      alert("Failed to save data");   // optional failure alert
    }
  } catch (error) {
    console.error("Error saving deal write-up:", error);
    alert("Error saving data");
  }
};

  const handleReadMore = (field: "valuation" | "differentiated_summary") => {
    if (formData?.ticker) {
      window.open(`/equity/ipo_dashboard/${formData.ticker}`, "_blank", "noopener,noreferrer");
    }
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
          {/* Header */}
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" color="#002060" fontWeight="bold">
              Deal Write-Up Info
            </Typography>
            <IconButton onClick={() => (editable ? handleSave() : setEditable(true))}>
              {editable ? <SaveIcon sx={{ color: "#002060" }} /> : <EditIcon sx={{ color: "#002060" }} />}
            </IconButton>
          </Box>

          {/* Top Fields */}
          <Grid container spacing={2} mt={2}>
            <Grid item xs={12} sm={6}>
              <FieldRenderer
                label="Sector Avg 1D Return % - Last 10 Deals"
                name="average_sector_return"
                value={formData.average_sector_return}
                editable={false}
                adornment="%"
                onChange={() => {}}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FieldRenderer
                label="Monashee Score"
                name="monashee_score"
                value={formData.monashee_score || ""}
                editable={editable}
                canEdit
                onChange={handleChange}
              />
            </Grid>
          </Grid>



          {/* Valuation & Differentiated Summary */}
          {(["valuation", "differentiated_summary"] as const).map((field) => (
            <Grid item xs={12} mt={2} key={field}>
              <Typography variant="subtitle1" color="#002060" fontWeight="bold" gutterBottom>
                {field === "valuation" ? "Valuation" : "Differentiated Summary"}
              </Typography>
              <Box sx={{ position: "relative" }}>
                <Typography
                  variant="body2"
                  sx={{
                    color: "#000",
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    mr: 1,
                  }}
                >
                  {!formData[field] ? "Not Available" : formData[field]}
                </Typography>
                {formData[field] && (
                  <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 0.5 }}>
                    <Button
                      onClick={() => handleReadMore(field)}
                      sx={{
                        color: "#006030",
                        fontStyle: "italic",
                        fontSize: "0.8rem",
                        textTransform: "none",
                        p: 0,
                      }}
                    >
                      Read More
                    </Button>
                  </Box>
                )}
              </Box>
            </Grid>
          ))}
          {/* Revenue / Growth / Net Income */}
<Grid container spacing={2} mt={2}>
  {(["revenue", "growth", "net_income"] as Array<keyof NonNullable<DealWriteUpData["deal_writeup_rating"]>>).map((field) => (
   <Grid item xs={12} sm={4} key={field}>
  <FieldRenderer
    label={
      field === "revenue"
        ? "Revenue ($M)"
        : field === "growth"
        ? "Growth (%)"
        : field === "net_income"
        ? "Net Income (%)"
        : String(field).charAt(0).toUpperCase() + String(field).slice(1)
    }
    name={field}
    value={
      formData.deal_writeup_rating?.[field] === null ||
      formData.deal_writeup_rating?.[field] === undefined
        ? "Not Available"
        : Math.round(Number(formData.deal_writeup_rating?.[field])).toString()
    }
    editable={false}
    adornment={
      (formData.deal_writeup_rating?.[field] !== null &&
        formData.deal_writeup_rating?.[field] !== undefined &&
        (field === "growth" || field === "net_income"))
        ? "%"
        : undefined
    }
    onChange={() => {}}
  />
</Grid>


  ))}
</Grid>
<Box position="relative" mt={1}>
  <InfoOutlinedIcon
    fontSize="small"
    color="action"
    sx={{
      position: "absolute",
      top: 4,
      left: 0,
    }}
  />
  <Typography
    variant="body2"
    color="textSecondary"
    sx={{ pl: 3 }} // padding-left to make space for the icon
  >
    To update these numbers, please make changes in the Deal Write-Up section.
  </Typography>
</Box>




          {/* Deal Write-Up Rating Slider */}
          <Grid item xs={12} mt={2}>
            <Card sx={{ background: "#e0eeec", borderRadius: "20px", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
              <CardContent>
                <Typography variant="body1" color="#002060" fontWeight="bold" gutterBottom>
                  Deal Write-Up Rating
                </Typography>
                <BlueSlider
                  value={formData.deal_writeup_rating?.score || 0}
                  onChange={(_, value) => handleSliderChange(value as number)}
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
