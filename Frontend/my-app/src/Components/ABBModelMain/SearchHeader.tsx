import React from "react";
import { Autocomplete, Box, TextField } from "@mui/material";
import { inputLabelSx } from "./formConstants";

interface SearchHeaderProps {
  options: any[];
  loading: boolean;
  value: any | null;
  onInputChange: (value: string) => void;
  onSelect: (value: any | null) => void;
}

const SearchHeader: React.FC<SearchHeaderProps> = ({
  options,
  loading,
  value,
  onInputChange,
  onSelect,
}) => (
  <Box sx={{ width: { xs: "100%", md: 350 } }}>
    <Autocomplete
      options={options}
      loading={loading}
      value={value}
      getOptionLabel={(opt: any) =>
        `${opt.ticker || ""} (${opt.deal_id || "TBA"})`
      }
      popupIcon={<></>}
      onInputChange={(event, inputValue) => onInputChange(inputValue)}
      onChange={(event, option) => onSelect(option)}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Search Ticker or Deal"
          variant="standard"
          InputLabelProps={{
            shrink: true,
            sx: inputLabelSx,
          }}
        />
      )}
    />
  </Box>
);

export default SearchHeader;
