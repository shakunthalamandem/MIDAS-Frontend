import React from "react";
import {
  Autocomplete,
  Box,
  TextField,
  InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

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
      renderOption={(props, option: any) => (
        <li {...props} style={{ padding: "10px 12px" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontWeight: 600, fontSize: "14px" }}>
              {option.ticker}({option.launch_date || "N/A"})
            </span>
            <span style={{ fontSize: "13px", color: "#333" }}>
              Discount: {option.final_discount ?? "N/A"}%
            </span>
          </div>
        </li>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder="Search ABB Deals"
          variant="outlined"
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "10px",
              backgroundColor: "#fff",
              paddingY: 0.2,
            },
          }}
        />
      )}
    />
  </Box>
);

export default SearchHeader;
