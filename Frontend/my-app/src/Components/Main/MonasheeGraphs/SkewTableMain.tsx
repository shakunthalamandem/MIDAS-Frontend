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
import RegionBasedTable from './SkewTables/RegionBasedTable';

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
        return <YearlyBasedTable />;
      case "leadBank":
        return <LeadBankTable />;
      default:
        return null;
    }
  };

  return (
  
    <>
    <SectorBasedTable   />
    <YearlyBasedTable   />
    <LeadBankTable />

    </>
  )
}

export default SkewTableMain;
