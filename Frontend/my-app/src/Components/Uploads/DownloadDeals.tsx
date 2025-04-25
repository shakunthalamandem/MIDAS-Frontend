import React from "react";
import axios from "axios";
import { Button, Typography, Container, Card, CardContent, Snackbar, Alert, Divider } from "@mui/material";

const App: React.FC = () => {
  const [error, setError] = React.useState<string>("");
  const [openSnackbar, setOpenSnackbar] = React.useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState<string>("");

  const downloadExcelFile = async () => {
    const apiUrl = process.env.REACT_APP_API_URL;
    const token = localStorage.getItem("access_token");

    if (!token) {
      alert("Access token not found. Please log in.");
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/api/download_deals/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("Error response:", error);
        setError("Download failed.");
        setOpenSnackbar(true);
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "deals_launched_yesterday.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      setSnackbarMessage("Excel file downloaded successfully!");
      setOpenSnackbar(true);
    } catch (err) {
      console.error("Download error:", err);
      setError("An error occurred while downloading.");
      setOpenSnackbar(true);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ }}>
      <Typography variant="h5" gutterBottom align="center" color="primary">
                  Download Deals Data
                </Typography>
      <Card sx={{ p: 3, boxShadow: 3 }}>
             
        <CardContent>
          <Typography variant="body1" color="textSecondary" align="center" gutterBottom>
            Click the button below to download the latest new deals data from New Deal Form in Excel format.
          </Typography>

          <Button
            variant="contained"
            color="primary"
            onClick={downloadExcelFile}
            sx={{ width: "100%", height: "50px", fontSize: "16px" }}
          >
            Download Excel
          </Button>
        </CardContent>
      </Card>

      {/* <Divider sx={{ my: 2 }} /> Divider between components */}

      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={() => setOpenSnackbar(false)}>
        <Alert onClose={() => setOpenSnackbar(false)} severity={error ? "error" : "success"} sx={{ width: "100%" }}>
          {error || snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default App;
