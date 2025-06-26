import React, { useState } from "react";
import {
  Box,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Typography,
  Fade,
  Container,
} from "@mui/material";
import YearlyBasedTable from "./SkewTables/YearlyBasedTable";
import SectorBasedTable from "./SkewTables/SectorBasedTable";
import LeadBankTable from "./SkewTables/LeadBankBasedTable";
import RegionBasedTable from "./SkewTables/RegionBasedTable";

const SkewTableMain: React.FC = () => {
  const [selectedView, setSelectedView] = useState<string>("sector");

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedView(event.target.value);
  };

  const renderTable = () => {
    switch (selectedView) {
      case "sector":
        return <SectorBasedTable />;
      case "yearly":
        return <YearlyBasedTable />;
      case "region":
        return <RegionBasedTable />;
      case "leadBank":
        return <LeadBankTable />;
      default:
        return null;
    }
  };

  return (
    <Box sx={{ py: 4 }}>
      <Container maxWidth="lg">
        <Box
          sx={{
            background: "linear-gradient(to right,rgb(185, 169, 224),rgb(235, 191, 161))",
            
            borderRadius: 2,
            boxShadow: 3,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            mb: 4,
          }}
        >
          <FormControl component="fieldset" sx={{ width: "100%" }}>
            <RadioGroup
              row
              value={selectedView}
              onChange={handleChange}
              aria-label="skew-table-view"
              name="skew-table-view"
              sx={{
                display: "flex",
                justifyContent: "space-around",
                flexWrap: "wrap",
              }}
            >
              {[
                { value: "sector", label: "Yearly Based" },
                { value: "yearly", label: "Sector Based" },
                { value: "region", label: "Region Based" },
                { value: "leadBank", label: "Lead Bank Based" },
              ].map((option) => (
                <FormControlLabel
                  key={option.value}
                  value={option.value}
                  control={
                    <Radio
                      sx={{
                        color: "#005f4c",
                        "&.Mui-checked": {
                          color: "#002060",
                        },
                      }}
                    />
                  }
                  label={
                    <Typography
                      sx={{
                        color: "#002060",
                        fontWeight: "bold",
                        fontSize: "1rem",
                      }}
                    >
                      {option.label}
                    </Typography>
                  }
                />
              ))}
            </RadioGroup>
          </FormControl>
        </Box>

        <Fade in timeout={500}>
          <Box>{renderTable()}</Box>
        </Fade>
      </Container>
    </Box>
  );
};

export default SkewTableMain;
