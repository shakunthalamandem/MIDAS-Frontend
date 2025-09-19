import React, { useState } from "react";
import { TextField, CircularProgress, Autocomplete, Button, Box } from "@mui/material";
import { searchTickers } from "./Services/api";

interface CompetitorSearchProps {
  onSelect: (ticker: string) => void;
}

const CompetitorSearch: React.FC<CompetitorSearchProps> = ({ onSelect }) => {
  const [options, setOptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<any>(null);

  const handleSearch = async (query: string) => {
    if (!query) {
      setOptions([]);
      return;
    }
    setLoading(true);
    try {
      const data = await searchTickers(query);
      setOptions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: "flex", gap: 1 }}>
      <Autocomplete
        options={options}
        getOptionLabel={(option: any) =>
          `${option.ticker} | ${option.company} | ${option.exchange || ""}`
        }
        loading={loading}
        onInputChange={(_, value) => handleSearch(value)}
        onChange={(_, newValue) => setSelected(newValue)}
        renderInput={(params) => (
          <TextField
            {...params}
            size="small"
            label="Add Competitor"
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {loading ? <CircularProgress size={20} /> : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
        sx={{ minWidth: 250 }}
      />
      <Button
        variant="contained"
        sx={{ backgroundColor: "#002060", color: "white" }}
        disabled={!selected}
        onClick={() => selected && onSelect(selected.ticker)}
      >
        Add
      </Button>
    </Box>
  );
};

export default CompetitorSearch;
