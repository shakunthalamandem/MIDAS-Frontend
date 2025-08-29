import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  InputAdornment,
  RadioGroup,
  FormControlLabel,
  Radio,
  IconButton,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";

interface DealIoiValuesTableProps {
  data: any;
  onSaveSuccess?: (updatedData: any) => void; // Optional callback for parent update
}


const DealIoiValuesTable: React.FC<DealIoiValuesTableProps> = ({
  data,
  onSaveSuccess,
}) => {
  const [formData, setFormData] = useState({
    ioi_as_percentage_of_deal_size_status: "",
    potential_am_quantity: "0",
  });
  const [editable, setEditable] = useState(false);
  const [loading, setLoading] = useState(false);
  
const apiUrl = process.env.REACT_APP_API_URL;
const token = localStorage.getItem("access_token");

  // Map API response to formData shape
  const mapApiResponseToFormData = (apiData: any) => {
    return {
      ioi_as_percentage_of_deal_size_status:
        apiData.ioi_as_percentage_of_deal_size_status !== undefined
          ? String(apiData.ioi_as_percentage_of_deal_size_status)
          : "",
      potential_am_quantity:
        apiData.potential_am_quantity !== undefined
          ? String(apiData.potential_am_quantity)
          : "0",
    };
  };

  useEffect(() => {
    if (data) {
      setFormData(mapApiResponseToFormData(data));
      setEditable(false);
    }
  }, [data]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "ioi_as_percentage_of_deal_size_status") {
      // Allow empty or numeric input only
      if (value === "" || /^[0-9]*\.?[0-9]*$/.test(value)) {
        setFormData((prev) => ({ ...prev, [name]: value }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async () => {
    if (!data) return;
    setLoading(true);

    try {
      const payload: any = {
        ticker: data.ticker,
        pricing_date: data.pricing_date,
        deal_type: data.deal_type,
      };

      if (
        formData.ioi_as_percentage_of_deal_size_status !==
          String(data.ioi_as_percentage_of_deal_size_status) &&
        formData.ioi_as_percentage_of_deal_size_status !== ""
      ) {
        payload.ioi_as_percentage_of_deal_size_status = parseFloat(
          formData.ioi_as_percentage_of_deal_size_status
        );
      }

      if (
        formData.potential_am_quantity !== String(data.potential_am_quantity) &&
        formData.potential_am_quantity !== ""
      ) {
        payload.potential_am_quantity = parseFloat(formData.potential_am_quantity);
      }

      let response;

      if (data.id) {
        // PATCH update existing record
        payload.id = data.id;
        response = await fetch(`${apiUrl}/api/unified_deal_ratings/`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify(payload),
        });
      } else {
        // POST create new record
        response = await fetch(`${apiUrl}/api/unified_deal_ratings/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify(payload),
        });
      }

      if (response.ok) {
        const result = await response.json();

        // Update form data with response data
        const updatedData = mapApiResponseToFormData(result.data || result); // assuming result.data contains new object or result itself

        setFormData(updatedData);
        setEditable(false);

        if (onSaveSuccess) {
          onSaveSuccess(result.data || result);
        }

        alert("Saved successfully!");
      } else {
        const errorData = await response.json();
        alert(`Failed to save data: ${errorData.detail || response.statusText}`);
      }
    } catch (error) {
      console.error("Error saving data:", error);
      alert("Error saving data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Grid item xs={12}>
      <Card
        sx={{
          background: "linear-gradient(135deg, #e0eeecff, #e0eeecff)",
          borderRadius: "20px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
          position: "relative",
        }}
      >
        <CardContent>
          <Grid container alignItems="center" justifyContent="space-between" mb={2}>
            <Grid item>
              <Typography variant="body1" color="#002060" fontWeight="bold">
                IOI values
              </Typography>
            </Grid>

            <Grid item>
              {loading ? (
                <CircularProgress size={24} />
              ) : editable ? (
                <>
                  <Tooltip title="Cancel">
                    <IconButton
                      aria-label="cancel"
                      onClick={() => {
                        setFormData(mapApiResponseToFormData(data));
                        setEditable(false);
                      }}
                      size="small"
                      sx={{ mr: 1 }}
                    >
                      <CancelIcon />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Save">
                    <IconButton aria-label="save" onClick={handleSave} size="small">
                      <SaveIcon />
                    </IconButton>
                  </Tooltip>
                </>
              ) : (
                <Tooltip title="Edit">
                  <IconButton
                    aria-label="edit"
                    onClick={() => setEditable(true)}
                    size="small"
                  >
                    <EditIcon />
                  </IconButton>
                </Tooltip>
              )}
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="#002060" gutterBottom fontWeight={500}>
                IOI value
              </Typography>
              {editable ? (
                <TextField
                  name="ioi_as_percentage_of_deal_size_status"
                  value={formData.ioi_as_percentage_of_deal_size_status || ""}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                  variant="standard"
                  InputProps={{
                    endAdornment: <InputAdornment position="end">% of deal size</InputAdornment>,
                  }}
                />
              ) : (
                <Typography variant="body1" sx={{ color: "#B1062E", fontWeight: 500 }}>
                  {formData.ioi_as_percentage_of_deal_size_status || "—"}{" "}
                  {formData.ioi_as_percentage_of_deal_size_status ? "% of deal size" : ""}
                </Typography>
              )}
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="#002060" gutterBottom fontWeight={500}>
                Potential AM Quantity
              </Typography>
              <RadioGroup
                row
                name="potential_am_quantity"
                value={formData.potential_am_quantity || "0"}
                onChange={handleChange}
              >
                {[
                  { label: "None", value: "0" },
                  { label: "0.5 * allocations", value: "0.5" },
                  { label: "1 * allocations", value: "1" },
                  { label: "2 * allocations", value: "2" },
                  { label: "5 * allocations", value: "5" },
                ].map((option) => (
                  <FormControlLabel
                    key={option.value}
                    value={option.value}
                    control={
                      <Radio
                        disabled={!editable}
                        sx={{
                          color: "#B1062E",
                          "&.Mui-checked": { color: "#B1062E" },
                        }}
                      />
                    }
                    label={option.label}
                  />
                ))}
              </RadioGroup>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Grid>
  );
};

export default DealIoiValuesTable;
