import React, { useState } from "react";
import {
  Checkbox,
  FormControlLabel,
  TextField,
  Button,
  Box,
} from "@mui/material";
import PredictionResults from "./PredictionResults";

interface PredictionModel {
  prediction: string;
  Accuracy: number;
  model: string;
  range: string;
}

interface T1DPriceCategoryProps {
  result?: Record<string, PredictionModel>;
  onRepredict?: (price: number) => void;
}

const T1DPriceCategory = ({ result, onRepredict }: T1DPriceCategoryProps): JSX.Element => {
  const [isChecked, setIsChecked] = useState<boolean>(false);
  const [price, setPrice] = useState<string>("");

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setIsChecked(event.target.checked);
  };

  const handlePriceChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setPrice(event.target.value);
  };

  const handleRepredict = (): void => {
    const numericPrice = parseFloat(price);
    if (!isNaN(numericPrice)) {
      onRepredict?.(numericPrice);
    }
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="center" sx={{ mt: 2, width: "100%" }}>
      <FormControlLabel
        control={
          <Checkbox
            checked={isChecked}
            onChange={handleCheckboxChange}
            sx={{
              color: "#002060",
              "&.Mui-checked": {
                color: "#002060",
              },
            }}
          />
        }
        label="Do you have the T + 1Day Open Category Price for the deal?"
      />

      {isChecked && (
        <Box sx={{ mt: 2, display: "flex", alignItems: "center" }}>
          <TextField
            label="Enter Price"
            variant="outlined"
            value={price}
            onChange={handlePriceChange}
            size="small"
            sx={{ mr: 2 }}
          />
          <Button
            variant="outlined"
            onClick={handleRepredict}
            sx={{ backgroundColor: "#002060", color: "#fff" }}
          >
            Repredict
          </Button>
        </Box>
      )}

      {result && <PredictionResults result={result} />}
    </Box>
  );
};

export default T1DPriceCategory;
