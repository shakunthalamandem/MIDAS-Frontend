import React, { useEffect, useState, ChangeEvent } from "react";
import {
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Box,
  IconButton,
  Grid,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import { useNavigate } from "react-router-dom";
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
  const [loadingValuation, setLoadingValuation] = useState(false);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [editable, setEditable] = useState(false);

  const apiUrl = process.env.REACT_APP_API_URL || "";
  const token = localStorage.getItem("access_token");
  const navigate = useNavigate();

  const { fetchDealWriteUpInfo, saveDealWriteUpInfo } = useDealWriteUpInfo({
    apiUrl,
    token,
    setFormData,
    setLoadingValuation,
    setLoadingSummary,
  });

  useEffect(() => {
    setFormData(data);
    if (data?.ticker && data?.deal_type) {
      setLoadingValuation(true);
      setLoadingSummary(true);
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
              label="Last 10 deals Avg Sector Return(%)"
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

        <Grid item xs={12}>
          <Typography
            variant="subtitle1"
            color="#002060"
            fontWeight="bold"
            gutterBottom
          >
            Valuation (AI)
          </Typography>
          {loadingValuation ? (
            <Box display="flex" alignItems="center" gap={1}>
              <CircularProgress size={20} />
              <Typography variant="body2" color="textSecondary">
                Generating data...
              </Typography>
            </Box>
          ) : (
            <>
              <Typography
                variant="body2"
                sx={{
                  color: "#727272ff",
                  display: "-webkit-box",
                  WebkitLineClamp: 2, // ✅ Limit to 2 lines
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {!formData.valuation || formData.valuation.length === 0
                  ? "Not Available"
                  : formData.valuation}
              </Typography>

              {formData.valuation && formData.valuation.length > 0 && (
                <Button
                  variant="text"
                  onClick={handleReadMore}
                  sx={{ mt: 1, color: "#006005ff",fontWeight:'bold'  }}
                >
                  Read More
                </Button>
              )}
            </>
          )}
        </Grid>

        {/* </Box> */}

        {/* Differentiated Summary */}

        <Grid item xs={12}>
          <Typography
            variant="subtitle1"
            color="#002060"
            fontWeight="bold"
            gutterBottom
          >
            Differentiated Summary (AI)
          </Typography>
          {loadingSummary ? (
            <Box display="flex" alignItems="center" gap={1}>
              <CircularProgress size={20} />
              <Typography variant="body2" color="textSecondary">
                Generating data...
              </Typography>
            </Box>
          ) : (
            <>
              <Typography
                variant="body2"
                sx={{
                  color: "#727272ff",
                  display: "-webkit-box",
                  WebkitLineClamp: 2, // ✅ Limit to 2 lines
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
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
                    variant="text"
                    onClick={handleReadMore}
                    sx={{ mt: 1, color: "#006005ff",fontWeight:'bold' }}
                  >
                    Read More
                  </Button>
                )}
            </>
          )}
        </Grid>

        {/* </Box> */}

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
                Deal Write-Up Rating{" "}
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
