import React, { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Typography,
  Alert,
} from "@mui/material";
import axios from "axios";
import { Delete } from "@mui/icons-material";
import UnifiedDealSelector from "./UnifiedDealSelector";

const DeleteUnifiedDealData: React.FC = () => {
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  const handleDelete = async () => {
    if (!selected.length) {
      setError("Please select at least one deal to delete.");
      return;
    }

    setError(null);
    setLoading(true);
    setSuccess(false);

    try {
      // Loop through each selected deal and send delete request
      for (const val of selected) {
        const [ticker, deal_id] = val.split("|"); // e.g. "FANG-US|2024-09-30"
        const payload: any = { ticker };
        if (deal_id) payload.deal_id = deal_id;

        await axios.post(
          `${apiUrl}/api/deal_unified_data_delete/`,
          payload,
          {
            headers: { Authorization: token ? `Bearer ${token}` : "" },
          }
        );
      }

      setSuccess(true);
      setSelected([]);
    } catch (err) {
      console.error(err);
      setError("Failed to delete one or more deals. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 5 }}>
      <Card
        sx={{
          p: 3,
          borderRadius: 4,
          boxShadow: 6,
          background: "linear-gradient(135deg, #fff5f5 0%, #ffecec 100%)",
        }}
      >
        <CardContent>
          <Typography
            variant="h5"
            gutterBottom
            sx={{
              fontWeight: "bold",
              color: "#b71c1c",
              textAlign: "center",
              mb: 2,
            }}
          >
            Delete Unified Deal Data
          </Typography>

          {/* Deal selector */}
          <UnifiedDealSelector selected={selected} setSelected={setSelected} />

          {/* Error message */}
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          {/* Success message */}
          {success && (
            <Alert severity="success" sx={{ mt: 2 }}>
              Selected deals deleted successfully!
            </Alert>
          )}

          <Box mt={3} display="flex" justifyContent="center">
            <Button
              variant="contained"
              startIcon={
                loading ? <CircularProgress size={20} /> : <Delete />
              }
              onClick={handleDelete}
              disabled={loading || !selected.length}
              sx={{
                px: 3,
                py: 1,
                fontWeight: "bold",
                borderRadius: 3,
                background:
                  "linear-gradient(135deg, #d32f2f 0%, #b71c1c 100%)",
                color: "#fff",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #ef5350 0%, #e53935 100%)",
                                    color: "#fff",

                },
              }}
            >
              {loading ? "Deleting..." : "Delete Selected"}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default DeleteUnifiedDealData;
