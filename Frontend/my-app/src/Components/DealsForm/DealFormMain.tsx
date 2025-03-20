import { Container, Typography, Box } from "@mui/material";

import NewDealFormMain from "../NewDealForm/NewDealFormMain";

const DealFormMain: React.FC = () => {
  return (
    <>
      <Box sx={{ width: "100%", backgroundColor: "#fff" }}>
        <Typography
          variant="body2"
          sx={{
            fontWeight: 500,
            color: "#FFFFFF",
            fontSize: { xs: "1rem", sm: "1.2rem" },
            backgroundColor: "#002060",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "4vh",
            padding: "8px 16px",
            borderRadius: "8px",
            textAlign: "center",
            marginBottom: "20px",
            boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
            animation: "fadeIn 1.5s ease-in-out",
            "@keyframes fadeIn": {
              "0%": { opacity: 0 },
              "100%": { opacity: 1 },
            },
          }}
        >
          Welcome to the Deal Form! Seamlessly input and track all deal
          parameters, from company details to allocation and pricing information
        </Typography>

        <Container sx={{ mb: 5 }}>
          <Typography
            variant="h5"
            color="#002060"
            sx={{ textAlign: "center", mt: 2 }}
          >
            Deal Information Form
          </Typography>
          <Box
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            textAlign="center"
            sx={{ width: "100%", overflow: "hidden", position: "relative" }}
          >
            <Typography
              variant="body2"
              sx={{
                "& .marquee": {
                  display: "inline-block",
                  whiteSpace: "nowrap",
                  animation: "marquee 40s linear infinite",
                  color: "#666666",
                  fontWeight: "bold",
                  fontStyle: "italic",
                  paddingLeft: "10px",
                  paddingR: "50px",
                  paddingRight: "10px",
                },
                "@keyframes marquee": {
                  "0%": { transform: "translateX(100%)" },
                  "100%": { transform: "translateX(-100%)" },
                },
                "& .marquee:hover": {
                  animationPlayState: "paused",
                },
              }}
            >
              <span className="marquee">
                Bloomberg data pulled automatically by ticker{" "}
              </span>
            </Typography>
          </Box>

          <NewDealFormMain />
        </Container>
      </Box>
    </>
  );
};

export default DealFormMain;
