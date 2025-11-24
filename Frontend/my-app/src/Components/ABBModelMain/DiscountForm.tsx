import React from "react";
import {
  Autocomplete,
  Box,
  Button,
  Grid,
  MenuItem,
  TextField,
} from "@mui/material";
import {
  discountFields,
  DiscountFormValues,
  yesNoOptions,
} from "./DiscountDataModel/ABBDiscountConfig";
import BlockDealFields from "./BlockDealFields";
import {
  baseTextFieldProps,
  gridItemProps,
  inputLabelSx,
  selectMenuProps,
} from "./formConstants";

interface DiscountFormProps {
  formValues: DiscountFormValues;
  formErrors: Record<string, string>;
  companyOptions: any[];
  searchLoading: boolean;
  dealCaptainOptions: string[];
  sectorOptions: string[];
  onSearchInput: (query: string) => void;
  onCompanySelect: (value: any | null) => void;
  onFieldChange: (key: keyof DiscountFormValues) => (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (event: React.FormEvent) => void;
  onReset: () => void;
}

const resolveTicker = (option: any): string =>
  typeof option === "string"
    ? option
    : option?.ticker || option?.symbol || option?.ticker_symbol || "";

const resolveCompany = (option: any): string =>
  typeof option === "string"
    ? ""
    : option?.company || option?.company_name || option?.companyName || "";

const formatOptionLabel = (option: any): string => {
  const ticker = resolveTicker(option);
  const company = resolveCompany(option);
  if (!ticker) return company;
  return company ? `${ticker} - ${company}` : ticker;
};

const DiscountForm: React.FC<DiscountFormProps> = ({
  formValues,
  formErrors,
  companyOptions,
  searchLoading,
  dealCaptainOptions,
  sectorOptions,
  onSearchInput,
  onCompanySelect,
  onFieldChange,
  onSubmit,
  onReset,
}) => (
  <Box component="form" onSubmit={onSubmit} noValidate>
    <Grid container spacing={3}>
      <Grid item {...gridItemProps}>
        <Autocomplete
          options={companyOptions}
          loading={searchLoading}
          value={formValues.ticker ? { ticker: formValues.ticker } : null}
          inputValue={formValues.ticker}
          getOptionLabel={(opt: any) => formatOptionLabel(opt)}
          onInputChange={(event, value) => {
            onSearchInput(value);
            onFieldChange("ticker")({ target: { value } } as any);
          }}
          onChange={(event, value) => onCompanySelect(value)}
          renderOption={(props, option: any) => {
            const ticker = resolveTicker(option);
            const company = resolveCompany(option);
            return (
              <li {...props} style={{ padding: "10px 12px" }}>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 0.2,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 1,
                    }}
                  >
                    {ticker && (
                      <span
                        style={{
                          fontWeight: 700,
                          fontSize: "14px",
                          color: "#f57c00",
                        }}
                      >
                        {ticker}
                      </span>
                    )}
                    {company && (
                      <span
                        style={{
                          fontSize: "13px",
                          color: "#6b7280",
                        }}
                      >
                        {company}
                      </span>
                    )}
                  </Box>
                </Box>
              </li>
            );
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Ticker"
              variant="standard"
              fullWidth
              InputLabelProps={{
                shrink: true,
                sx: inputLabelSx,
              }}
              required
              error={Boolean(formErrors.ticker)}
              helperText={formErrors.ticker || ""}
            />
          )}
        />
      </Grid>

      <Grid item {...gridItemProps}>
        <TextField
          type="date"
          label="Launch Date"
          value={formValues.tradeDate}
          onChange={onFieldChange("tradeDate")}
          {...baseTextFieldProps}
          required
          error={Boolean(formErrors.tradeDate)}
          helperText={formErrors.tradeDate || ""}
        />
      </Grid>

      {discountFields.map((field) => (
        <Grid item {...gridItemProps} key={field.key}>
          <TextField
            select
            label={field.label}
            value={formValues[field.key]}
            onChange={onFieldChange(field.key)}
            {...baseTextFieldProps}
            required
          >
            {yesNoOptions.map((opt) => (
              <MenuItem key={opt} value={opt}>
                {opt}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
      ))}

      <Grid item {...gridItemProps}>
        <TextField
          select
          label="Deal Captain"
          value={formValues.dealCaptain}
          onChange={onFieldChange("dealCaptain")}
          {...baseTextFieldProps}
          SelectProps={{ MenuProps: selectMenuProps }}
          required
          error={Boolean(formErrors.dealCaptain)}
          helperText={formErrors.dealCaptain || ""}
        >
          <MenuItem value="">Select Deal Captain</MenuItem>
          {dealCaptainOptions.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </TextField>
      </Grid>

      <Grid item {...gridItemProps}>
        <TextField
          select
          label="Sector"
          value={formValues.gicsSector}
          onChange={onFieldChange("gicsSector")}
          {...baseTextFieldProps}
          SelectProps={{ MenuProps: selectMenuProps }}
          required
          error={Boolean(formErrors.gicsSector)}
          helperText={formErrors.gicsSector || ""}
        >
          <MenuItem value="">Select Sector</MenuItem>
          {sectorOptions.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </TextField>
      </Grid>

      <BlockDealFields
        values={formValues}
        errors={formErrors}
        onChange={onFieldChange}
      />

      <Grid item xs={12}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          <Button
            variant="outlined"
            type="button"
            onClick={onReset}
            sx={{
              borderRadius: "18px",
              px: 3.5,
              color: "#0b2b57",
              borderColor: "rgba(11,43,87,0.4)",
              fontWeight: 600,
            }}
          >
            Reset
          </Button>

          <Button
            variant="contained"
            type="submit"
            sx={{
              borderRadius: "18px",
              px: 3.5,
              background: "#0b2b57",
              fontWeight: 600,
              color: "#fff",
            }}
          >
            Get Estimate Discount
          </Button>
        </Box>
      </Grid>
    </Grid>
  </Box>
);

export default DiscountForm;
