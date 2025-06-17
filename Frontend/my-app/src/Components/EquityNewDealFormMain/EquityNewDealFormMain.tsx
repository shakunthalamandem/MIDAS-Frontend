import React, { useState } from "react";
import axios from "axios";
import {
  Box,
  Button,
  TextField,
  Autocomplete,
  Typography,
} from "@mui/material";
import DealFormSectionMainTable from "./DealFormSections/DealFormSectionMainTable";

const formatDateSimple = (dateString: string) => {
  const date = new Date(dateString);
  const day = date.getDate();
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const daySuffix =
    day === 1 || day === 21 || day === 31
      ? "st"
      : day === 2 || day === 22
        ? "nd"
        : day === 3 || day === 23
          ? "rd"
          : "th";
  return `${day}${daySuffix} ${monthNames[date.getMonth()]} ${date.getFullYear()}`;
};

interface TickerOption {
  ticker: string;
  pricing_date: string;
}

const EquityNewDealFormMain = () => {
  const [selectedOption, setSelectedOption] = useState<any>(null);
  const [options, setOptions] = useState<TickerOption[]>([]);
  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  const handleSearchClick = async () => {
    const response = await axios.get(`${apiUrl}/api/new_deal_ticker_list/`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.data;
    setOptions(data as TickerOption[]);
  };

  const handleCreateClick = () => {
    setSelectedOption({ create: true });
  };

  return (
    <Box display="flex" flexDirection="column">
      <Box display="flex" justifyContent="flex-end" gap={2} mb={2}>
        <Button variant="contained" onClick={handleCreateClick}>
          Create
        </Button>

        <Autocomplete
          options={options}
          getOptionLabel={(option) =>
            `${option.ticker}\n${formatDateSimple(option.pricing_date)}`
          }
          onChange={(event, value) => setSelectedOption(value)}
          onOpen={handleSearchClick}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Search Ticker"
              variant="outlined"
              size="small"
              multiline
              InputProps={{
                ...params.InputProps,
                style: { whiteSpace: "pre-line" }, // enable line breaks
              }}
            />
          )}
          sx={{ width: 300 }}
        />
      </Box>

      <DealFormSectionMainTable selectedOption={selectedOption} />
    </Box>
  );
};

export default EquityNewDealFormMain;
