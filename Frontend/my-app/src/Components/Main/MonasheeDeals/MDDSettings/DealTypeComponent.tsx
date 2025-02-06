import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Radio,
  RadioGroup,
  FormControlLabel,
  Typography,
} from "@mui/material";

// Format values to represent millions, billions, etc.
const formatValue = (value: number): string => {
    const absValue = Math.abs(value);
    const sign = value < 0 ? "-" : "";
  
    if (absValue >= 1_000_000_000)
      return `${sign}$${(absValue / 1_000_000_000).toFixed(1)}B`;
    if (absValue >= 1_000_000)
      return `${sign}$${(absValue / 1_000_000).toFixed(1)}M`;
    if (absValue >= 1_000) return `${sign}$${(absValue / 1_000).toFixed(1)}K`;
  
    return `${sign}$${absValue.toFixed(2)}`;
  };
  
const data = {
    "2012": {
        "FO": {
            "Summary": {
                "Number of deals": 379,
                "Weighted Allocation as % of Deal Size": 0.050534894436018954,
                "Weighted Allocation as % of IOI": 22.370352134111283,
                "Deal volume": 158720232317.0,
                "Model Actual Return": 1462463.9110916967,
                "Model Return 1% Allocation": 70858876.67253518,
                "Net of Hedge": 0,
                "Allocation Return": 1734863.0777244517,
                "AM Return": 841019.9732313468,
                "Model AM Return": 35429438.33626759,
                "Total Return": 2575883.0509558
            },
            "-5% to 0%": {
                "Number of deals": 76,
                "Weighted Allocation as % of Deal Size": 0.06757699087640452,
                "Weighted Allocation as % of IOI": 33.38124327954816,
                "Deal volume": 26185707991.0,
                "Model Actual Return": -341488.16040000005,
                "Model Return 1% Allocation": -4798145.1636813665,
                "Net of Hedge": 0,
                "Allocation Return": -356405.81536908966,
                "AM Return": -297051.34463511,
                "Model AM Return": -2399072.5818406832,
                "Total Return": -653457.1600041996
            },
            "-73% to -5%": {
                "Number of deals": 76,
                "Weighted Allocation as % of Deal Size": 0.0927771710588311,
                "Weighted Allocation as % of IOI": 21.08793395462965,
                "Deal volume": 16067000028.0,
                "Model Actual Return": -1982594.046530303,
                "Model Return 1% Allocation": -21391469.125604115,
                "Net of Hedge": 0,
                "Allocation Return": -981107.7886929164,
                "AM Return": -1559568.6713070837,
                "Model AM Return": -10695734.562802058,
                "Total Return": -2540676.4599999995
            },
            "0% to 4%": {
                "Number of deals": 75,
                "Weighted Allocation as % of Deal Size": 0.06632879181442021,
                "Weighted Allocation as % of IOI": 23.522716750689813,
                "Deal volume": 29437309901.0,
                "Model Actual Return": 464757.66,
                "Model Return 1% Allocation": 7310051.816415865,
                "Net of Hedge": 0,
                "Allocation Return": 577755.5673704153,
                "AM Return": 17048.46267958432,
                "Model AM Return": 3655025.9082079325,
                "Total Return": 594804.0300499995
            },
            "10% to 102%": {
                "Number of deals": 76,
                "Weighted Allocation as % of Deal Size": 0.04580654564408765,
                "Weighted Allocation as % of IOI": 21.346905391905743,
                "Deal volume": 26069505203.0,
                "Model Actual Return": 2175212.70812,
                "Model Return 1% Allocation": 41788241.69768382,
                "Net of Hedge": 0,
                "Allocation Return": 1455319.2052560898,
                "AM Return": 1228362.2547239093,
                "Model AM Return": 20894120.84884191,
                "Total Return": 2683681.4599799993
            },
            "4% to 10%": {
                "Number of deals": 76,
                "Weighted Allocation as % of Deal Size": 0.026476280646007603,
                "Weighted Allocation as % of IOI": 16.82907979882123,
                "Deal volume": 60960709194.0,
                "Model Actual Return": 1146575.7499019997,
                "Model Return 1% Allocation": 47950197.44772098,
                "Net of Hedge": 0,
                "Allocation Return": 1039301.9091599527,
                "AM Return": 1452229.2717700466,
                "Model AM Return": 23975098.72386049,
                "Total Return": 2491531.18093
            }
        },
        "IPO": {
            "Summary": {
                "Number of deals": 121,
                "Weighted Allocation as % of Deal Size": 0.04260418082490193,
                "Weighted Allocation as % of IOI": 9.38390972410956,
                "Deal volume": 42094118823.0,
                "Model Actual Return": 703495.1463499998,
                "Model Return 1% Allocation": 3638028.5195957907,
                "Net of Hedge": 0,
                "Allocation Return": 777372.716856524,
                "AM Return": 518539.80705937615,
                "Model AM Return": 3638028.5195957907,
                "Total Return": 1295912.5239159002
            },
            "-30% to -4%": {
                "Number of deals": 25,
                "Weighted Allocation as % of Deal Size": 0.030593524419076604,
                "Weighted Allocation as % of IOI": 19.2973165890969,
                "Deal volume": 21738423821.0,
                "Model Actual Return": -943829.99735,
                "Model Return 1% Allocation": -19975736.12165147,
                "Net of Hedge": 0,
                "Allocation Return": -572600.1586809584,
                "AM Return": -472789.69727704127,
                "Model AM Return": -19975736.12165147,
                "Total Return": -1045389.8559580001
            },
            "-4% to 4%": {
                "Number of deals": 24,
                "Weighted Allocation as % of Deal Size": 0.09522733731596289,
                "Weighted Allocation as % of IOI": 17.43143424975157,
                "Deal volume": 5526301741.0,
                "Model Actual Return": 23020.099999999853,
                "Model Return 1% Allocation": 157031.7413920003,
                "Net of Hedge": 0,
                "Allocation Return": -5636.1900762604455,
                "AM Return": -348648.50999373966,
                "Model AM Return": 157031.7413920003,
                "Total Return": -354284.70006999996
            },
            "19% to 34%": {
                "Number of deals": 24,
                "Weighted Allocation as % of Deal Size": 0.07098259670952912,
                "Weighted Allocation as % of IOI": 9.061380378657487,
                "Deal volume": 3708417446.0,
                "Model Actual Return": 675299.6912,
                "Model Return 1% Allocation": 4813297.940459788,
                "Net of Hedge": 0,
                "Allocation Return": 552473.6094416772,
                "AM Return": 934653.2105022229,
                "Model AM Return": 4813297.940459788,
                "Total Return": 1487126.8199439002
            },
            "34% to 115%": {
                "Number of deals": 24,
                "Weighted Allocation as % of Deal Size": 0.024370997675233787,
                "Weighted Allocation as % of IOI": 2.537853383918737,
                "Deal volume": 5318001410.0,
                "Model Actual Return": 716902.5,
                "Model Return 1% Allocation": 15169573.249570442,
                "Net of Hedge": 0,
                "Allocation Return": 592079.2056682262,
                "AM Return": 178127.24433177357,
                "Model AM Return": 15169573.249570442,
                "Total Return": 770206.4499999998
            },
            "4% to 19%": {
                "Number of deals": 24,
                "Weighted Allocation as % of Deal Size": 0.036056914161074954,
                "Weighted Allocation as % of IOI": 4.515218555185133,
                "Deal volume": 5802974405.0,
                "Model Actual Return": 232102.85249999998,
                "Model Return 1% Allocation": 3473861.7098250305,
                "Net of Hedge": 0,
                "Allocation Return": 211056.25050383943,
                "AM Return": 227197.55949616065,
                "Model AM Return": 3473861.7098250305,
                "Total Return": 438253.81
            }
        }
    },
};

const DealTypeComponent: React.FC = () => {
  const [selectedType, setSelectedType] = useState<"IPO" | "FO">("IPO");

  const year = "2012";
  const tableData = data[year][selectedType];
  const isSummary  = "Summary";
  const isLastRow = true;

  return (
    <Paper sx={{ padding: 2 }}>
      <Typography variant="h6" align="center">{`Financial Data for ${year}`}</Typography>
      <RadioGroup
        row
        value={selectedType}
        onChange={(e) => setSelectedType(e.target.value as "IPO" | "FO")}
        sx={{ justifyContent: "center", marginBottom: 2 }}
      >
        <FormControlLabel value="IPO" control={<Radio />} label="IPO" />
        <FormControlLabel value="FO" control={<Radio />} label="FO" />
      </RadioGroup>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              {/* <TableCell>Category</TableCell>
              <TableCell align="right">Number of Deals</TableCell>
              <TableCell align="right">Allocation % of Deal Size</TableCell>
              <TableCell align="right">Allocation % of IOI</TableCell>
              <TableCell align="right">Deal Volume</TableCell>
              <TableCell align="right">Model Actual Return</TableCell>
              <TableCell align="right">Model Return 1% Allocation</TableCell>
              <TableCell align="right">Total Return</TableCell> */}
                <TableCell sx={{ fontSize: "0.725rem", fontWeight: "bold", border: "1px solid #ddd", padding: "4px 8px", width: "40px" }}>Quintile</TableCell>
                <TableCell sx={{ fontSize: "0.725rem", fontWeight: "bold", border: "1px solid #ddd", padding: "4px 8px", width: "130px" }}>T+1M Absolute Returns</TableCell>
                <TableCell sx={{ fontSize: "0.725rem", fontWeight: "bold", border: "1px solid #ddd", padding: "4px 8px", width: "90px" }}>No of Deals</TableCell>
                <TableCell sx={{ fontSize: "0.725rem", fontWeight: "bold", border: "1px solid #ddd", padding: "4px 8px", width: "90px" }}>Deal Volume ($)</TableCell>
                <TableCell sx={{ fontSize: "0.725rem", fontWeight: "bold", border: "1px solid #ddd", padding: "4px 8px", width: "90px" }}>Allocation as % of Deal Size (Weighted)</TableCell>
                <TableCell sx={{ fontSize: "0.725rem", fontWeight: "bold", border: "1px solid #ddd", padding: "4px 8px", width: "90px" }}>Allocation as % of IOI (Weighted)</TableCell>
                <TableCell sx={{ fontSize: "0.725rem", fontWeight: "bold", border: "1px solid #ddd", padding: "4px 8px", width: "90px", borderLeft: "2px solid #666666 !important", borderTop: "2px solid #666666 !important" }}>Monashee Actual Allocation PnL (Gross $)</TableCell>
                <TableCell sx={{ fontSize: "0.725rem", fontWeight: "bold", border: "1px solid #ddd", padding: "4px 8px", width: "90px", borderTop: "2px solid #666666 !important" }}>Model PnL With Actual Allocation (Gross $)</TableCell>
                {/* <TableCell sx={{ fontSize: "0.725rem", fontWeight: "bold", border: "1px solid #ddd", padding: "4px 8px", width: "90px", borderRight: "2px solid #666666 !important", borderTop: "2px solid #666666 !important" }}>{selectedCategory === "IPO" ? "Model PnL with model Allocation (0.5%) (Gross $)" : "Model PnL with model Allocation (1%) (Gross $)"}</TableCell> */}
                <TableCell sx={{ fontSize: "0.725rem", fontWeight: "bold", border: "1px solid #ddd", padding: "4px 8px", width: "90px", borderRight: "2px solid #666666 !important", borderTop: "2px solid #666666 !important" }}>Model PnL with model Allocation (0.5%) (Gross $)</TableCell>
                <TableCell sx={{ fontSize: "0.725rem", fontWeight: "bold", border: "1px solid #ddd", padding: "4px 8px", width: "90px", borderTop: "2px solid #666666" }}>Monashee Actual AM PnL (Gross $)</TableCell>
                <TableCell sx={{ fontSize: "0.725rem", fontWeight: "bold", border: "1px solid #ddd", padding: "4px 8px", width: "90px", borderTop: "2px solid #666666" }}>Model PnL with model AM allocation (Gross $)</TableCell>
                <TableCell sx={{ fontSize: "0.725rem", fontWeight: "bold", border: "1px solid #ddd", padding: "4px 8px", width: "90px", borderTop: "2px solid #666666", borderLeft: "2px solid #666666 !important" }}>Monashee Actual Total PnL (Gross $)</TableCell>
                <TableCell sx={{ fontSize: "0.725rem", fontWeight: "bold", border: "1px solid #ddd", padding: "4px 8px", width: "90px", borderTop: "2px solid #666666", borderRight: "2px solid #666666 !important" }}>Model Actual Total PnL (Gross $)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.entries(tableData).map(([category, values]) => (
              <TableRow key={category}>
                {/* <TableCell>{category}</TableCell>
                <TableCell align="right">{values["Number of deals"]}</TableCell>
                <TableCell align="right">{values["Weighted Allocation as % of Deal Size"]}</TableCell>
                <TableCell align="right">{values["Weighted Allocation as % of IOI"]}</TableCell>
                <TableCell align="right">{values["Deal volume"].toLocaleString()}</TableCell>
                <TableCell align="right">{values["Model Actual Return"].toLocaleString()}</TableCell>
                <TableCell align="right">{values["Model Return 1% Allocation"].toLocaleString()}</TableCell>
                <TableCell align="right">{values["Total Return"].toLocaleString()}</TableCell> */}
                {/* <TableCell component="th" scope="row" sx={{ fontSize: "0.8rem", border: "1px solid #ddd", padding: "4px 8px", fontWeight: isSummary ? "bold" : "normal" }}>{selectedFilter.label === "Deal Type" ? `${range}` : "Sector"}</TableCell> */}
                <TableCell component="th" scope="row" sx={{ fontSize: "0.8rem", border: "1px solid #ddd", padding: "4px 8px", fontWeight: isSummary ? "bold" : "normal" }}>{category}</TableCell>
                <TableCell align="left" sx={{ fontSize: "0.8rem" }}>{values["Number of deals"] || 0}</TableCell>
                <TableCell align="left" sx={{ fontSize: "0.8rem" }}>{formatValue(values["Deal volume"] || 0)}</TableCell>
                <TableCell align="left" sx={{ fontSize: "0.8rem" }}>{(values["Weighted Allocation as % of Deal Size"]?.toFixed(2) || "0.00") + "%"}</TableCell>
                <TableCell align="left" sx={{ fontSize: "0.8rem" }}>{(values["Weighted Allocation as % of IOI"]?.toFixed(2) || "0.00") + "%"}</TableCell>
                <TableCell align="left" sx={{ fontSize: "0.8rem", borderLeft: "2px solid #666666 !important", borderBottom: isLastRow ? "2px solid #666666 !important" : "none" }}>{formatValue(values["Allocation Return"] || 0)}</TableCell>
                <TableCell align="left" sx={{ fontSize: "0.8rem", borderBottom: isLastRow ? "2px solid #666666 !important" : "none" }}>{formatValue(values["Model Actual Return"] || 0)}</TableCell>
                <TableCell align="left" sx={{ fontSize: "0.8rem", borderRight: "2px solid #666666 !important", borderBottom: isLastRow ? "2px solid #666666 !important" : "none" }}>{formatValue(values["Model Return 1% Allocation"] || 0)}</TableCell>
                <TableCell align="left" sx={{ fontSize: "0.8rem", borderColor: "#ddd", borderBottom: isLastRow ? "2px solid #666666 !important" : "none" }}>{formatValue(values["AM Return"] || 0)}</TableCell>
                <TableCell align="left" sx={{ fontSize: "0.8rem", borderColor: "#ddd", borderBottom: isLastRow ? "2px solid #666666 !important" : "none" }}>{formatValue(values["Model AM Return"] || 0)}</TableCell>
                <TableCell align="left" sx={{ fontSize: "0.8rem", borderLeft: "2px solid #666666 !important", borderBottom: isLastRow ? "2px solid #666666 !important" : "none" }}>{formatValue(values["Total Return"] || 0)}</TableCell>
                <TableCell align="left" sx={{ fontSize: "0.8rem", borderRight: "2px solid #666666 !important", borderBottom: isLastRow ? "2px solid #666666 !important" : "none" }}>{formatValue(values["Model Return 1% Allocation"] + values["Model AM Return"] || 0)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default DealTypeComponent;
