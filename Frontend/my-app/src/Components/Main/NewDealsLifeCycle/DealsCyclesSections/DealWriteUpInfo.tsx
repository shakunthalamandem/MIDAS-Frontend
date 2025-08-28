import React, { useState, ChangeEvent, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Box,
  IconButton,
  Grid,
  InputAdornment,
  Button,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import { motion } from 'framer-motion';
import BlueSlider from './BlueSlider';

interface DealWriteUpData {
  id?: number | string;
  ticker: string;
  pricing_date: string; // YYYY-MM-DD
  deal_type: string;
  average_sector_return?: number | null;
  monashee_score?: number | null;
  valuation?: string;
  differentiated_summary?: string;
  deal_writeup_rating?: number;
}

interface DealWriteUpInfoProps {
  data: DealWriteUpData;
}

const DealWriteUpInfo: React.FC<DealWriteUpInfoProps> = ({ data }) => {
  const [formData, setFormData] = useState<DealWriteUpData>(data);
  const [editable, setEditable] = useState(false);
  const [valuationExpanded, setValuationExpanded] = useState(false);
  const [differentiatedSummaryExpanded, setDifferentiatedSummaryExpanded] = useState(false);

  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem('access_token');

  const mapApiResponseToDealWriteUpData = (apiData: any): Partial<DealWriteUpData> => {
    return {
      ticker: apiData.ticker,
      pricing_date: apiData.pricing_date,
      deal_type: apiData.deal_type,
      average_sector_return: apiData.average_sector_return,
      monashee_score: apiData.monashee_score,
      valuation: apiData.valuation,
      differentiated_summary: apiData.differentiated_summary,
      deal_writeup_rating: apiData.deal_writeup_rating,
    };
  };

const fetchDealWriteUpInfo = async () => {
  try {
    const payload = {
      ticker: data.ticker,
      pricing_date: data.pricing_date,
      deal_type: data.deal_type,
    };

    console.log("🔹 Sending unified_deal_ratings payload:", payload);

    const response = await fetch(`${apiUrl}/api/unified_deal_ratings/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      const result = await response.json();
      console.log("✅ unified_deal_ratings response:", result);

      const apiData = result.data;

      // ✅ Update form data
      setFormData((prev) => ({
        ...prev,
        ...mapApiResponseToDealWriteUpData(apiData),
      }));

      // ✅ Build payload for ipo_valuation_ai_summary
      const valuationPayload = {
        ticker: apiData.ticker,
        company_name: apiData.company_name || "", // fallback if missing
        valuation_summary: apiData.valuation || "",
        differentiate_summary: apiData.differentiated_summary || "",
      };

      console.log("🔹 Sending ipo_valuation_ai_summary payload:", valuationPayload);

      // 🔥 Call second API
      fetchValuationSummary(valuationPayload);
    } else {
      console.error("❌ Failed to fetch unified_deal_ratings:", await response.text());
    }
  } catch (error) {
    console.error("❌ Error fetching unified_deal_ratings:", error);
  }
};


const fetchValuationSummary = async (payload: {
  ticker: string;
  company_name: string;
  valuation_summary: string;
  differentiate_summary: string;
}) => {
  try {
    const response = await fetch(`${apiUrl}/api/ipo_valuation_ai_summary/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      const result = await response.json();
      console.log("✅ ipo_valuation_ai_summary response:", result);

      setFormData((prev) => ({
        ...prev,
        valuation: result.valuation_summary,
        differentiated_summary: result.differentiate_summary,
      }));
    } else {
      console.error("❌ Failed to fetch ipo_valuation_ai_summary:", await response.text());
    }
  } catch (error) {
    console.error("❌ Error fetching ipo_valuation_ai_summary:", error);
  }
};



  // 🔹 Save edits
  const handleSave = async () => {
    try {
      const payload: Partial<DealWriteUpData> = {
        id: data.id,
        ticker: data.ticker,
        pricing_date: data.pricing_date,
        deal_type: data.deal_type,
      };

      Object.keys(formData).forEach((key) => {
        const k = key as keyof DealWriteUpData;
        if (formData[k] !== data[k] && formData[k] !== undefined) {
          payload[k] = formData[k] as any;
        }
      });

      const response = await fetch(`${apiUrl}/api/unified_deal_ratings/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert('Saved successfully!');
        setEditable(false);
      } else {
        alert('Failed to save data');
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    setFormData(data);
    if (data?.ticker && data?.deal_type) {
      fetchDealWriteUpInfo();
    }
  }, [data]);

  // 🔹 Render helpers (same as your code, no changes)
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSliderChange = (name: keyof DealWriteUpData, value: number) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };




const renderField = (
  label: string,
  name: keyof DealWriteUpData,
  adornment?: string,
  multiline = false,
  canEdit: boolean = false
) => {
  const rawValue = formData[name];
  const isValueAvailable =
    rawValue !== null && rawValue !== undefined && rawValue !== "";
  const displayValue = isValueAvailable ? rawValue : "Not Available";

  return (
    <>
      <Typography variant="body2" color="#002060" gutterBottom fontWeight={500}>
        {label}
      </Typography>
      {editable && canEdit ? (
        <TextField
          name={name}
          value={isValueAvailable ? rawValue : ""}
          onChange={handleChange}
          fullWidth
          size="small"
          variant="standard"
          multiline={multiline}
          minRows={multiline ? 3 : 1}
          InputProps={{
            endAdornment:
              adornment && isValueAvailable ? (
                <InputAdornment position="end">{adornment}</InputAdornment>
              ) : undefined,
            sx: { color: "#002060" },
          }}
        />
      ) : (
        <Typography
          variant="body2"
          sx={{
            color: isValueAvailable ? "#b1062e" : "#999",
            whiteSpace: "pre-line",
            fontStyle: isValueAvailable ? "normal" : "italic",
          }}
        >
          {displayValue}
          {isValueAvailable && adornment ? ` ${adornment}` : ""}
        </Typography>
      )}
    </>
  );
};

const renderValuationField = () => {
  const rawValuation = formData.valuation;
  const isAvailable =
    rawValuation !== null && rawValuation !== undefined && rawValuation !== "";
  const valuation = isAvailable ? rawValuation : "Not Available";
  const truncatedValuation = isAvailable
    ? valuation.slice(0, 150)
    : "Not Available";
  const isTruncated = isAvailable && valuation.length > 150;

  return (
    <>
      <Typography variant="body2" color="#002060" gutterBottom fontWeight={500}>
        Valuation
      </Typography>
      {editable ? (
        <TextField
          name="valuation"
          value={isAvailable ? rawValuation : ""}
          onChange={handleChange}
          fullWidth
          size="small"
          variant="standard"
          multiline
          minRows={3}
          sx={{ color: "#002060" }}
        />
      ) : (
        <>
          <Typography
            variant="body2"
            sx={{
              color: isAvailable ? "#b1062e" : "#999",
              whiteSpace: "pre-line",
              fontStyle: isAvailable ? "normal" : "italic",
            }}
          >
            {valuationExpanded || !isTruncated
              ? valuation
              : `${truncatedValuation}...`}
          </Typography>
          {isTruncated && (
            <Button
              onClick={() => setValuationExpanded(!valuationExpanded)}
              sx={{ color: "#136000ff", textTransform: "none" }}
            >
              {valuationExpanded ? "Show Less" : "Read More"}
            </Button>
          )}
        </>
      )}
    </>
  );
};

const renderDifferentiatedSummaryField = () => {
  const rawSummary = formData.differentiated_summary;
  const isAvailable =
    rawSummary !== null && rawSummary !== undefined && rawSummary !== "";
  const summary = isAvailable ? rawSummary : "Not Available";
  const truncatedSummary = isAvailable
    ? summary.slice(0, 150)
    : "Not Available";
  const isTruncated = isAvailable && summary.length > 150;

  return (
    <>
      <Typography variant="body2" color="#002060" gutterBottom fontWeight={500}>
        Differentiated Summary
      </Typography>
      {editable ? (
        <TextField
          name="differentiated_summary"
          value={isAvailable ? rawSummary : ""}
          onChange={handleChange}
          fullWidth
          size="small"
          variant="standard"
          multiline
          minRows={3}
          sx={{ color: "#002060" }}
        />
      ) : (
        <>
          <Typography
            variant="body2"
            sx={{
              color: isAvailable ? "#b1062e" : "#999",
              whiteSpace: "pre-line",
              fontStyle: isAvailable ? "normal" : "italic",
            }}
          >
            {differentiatedSummaryExpanded || !isTruncated
              ? summary
              : `${truncatedSummary}...`}
          </Typography>
          {isTruncated && (
            <Button
              onClick={() =>
                setDifferentiatedSummaryExpanded(!differentiatedSummaryExpanded)
              }
              sx={{ color: "#136000ff", textTransform: "none" }}
            >
              {differentiatedSummaryExpanded ? "Show Less" : "Read More"}
            </Button>
          )}
        </>
      )}
    </>
  );
};

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Card
        sx={{
          background: 'linear-gradient(135deg, #e0ebff, #d4e2fc)',
          borderRadius: '20px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          p: 2,
        }}
      >
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" color="#002060" fontWeight="bold">
              Deal Write-Up Info
            </Typography>
            <IconButton
              onClick={() => (editable ? handleSave() : setEditable(true))}
            >
              {editable ? (
                <SaveIcon sx={{ color: '#002060' }} />
              ) : (
                <EditIcon sx={{ color: '#002060' }} />
              )}
            </IconButton>
          </Box>

          <Grid container spacing={2} mt={2}>
            <Grid item xs={12} sm={6}>
              {renderField(
                'Last 10 days Avg Sector Return(%)',
                'average_sector_return',
                '%'
              )}
            </Grid>
            <Grid item xs={12} sm={6}>
              {renderField('Monashee Score', 'monashee_score', undefined, false, true)}
            </Grid>
            <Grid item xs={12}>
              {renderValuationField()}
            </Grid>
            <Grid item xs={12}>
              {renderDifferentiatedSummaryField()}
            </Grid>
    
          </Grid>

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
 Deal Write-Up Rating                  </Typography>
                  <BlueSlider
                value={formData.deal_writeup_rating || 0}
                onChange={(_, value) =>
                  handleSliderChange('deal_writeup_rating', value as number)
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
