import React, { useState, useEffect } from "react";
import { Box, Card, CardContent, Typography } from "@mui/material";
import { DataGrid, GridColDef, GridPaginationModel } from "@mui/x-data-grid";

interface ScreenerDataRow {
  pricing_date: string;
  issuer_name: string;
  ticker_symbol: string;
  gics_sector: string;
  us_international: string;
  deal_type: string;
  deal_value: number;
  t1m_returns: number;
  t1_return: number;
  t1m_returns_index_returns: number;
  t1d_returns_index_returns: number;
  opportunity_value_ex: number;
}

interface ScreenerDataTableProps {
  sectorwiseData: { [key: string]: (string | number)[] };
}

const ScreenerDataTable: React.FC<ScreenerDataTableProps> = ({
  sectorwiseData,
}) => {
  const [rows, setRows] = useState<ScreenerDataRow[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 100,
  });
  const [totalRows, setTotalRows] = useState<number>(0);

  useEffect(() => {
    if (sectorwiseData) {
      fetchDataFromApi(sectorwiseData);
    }
  }, [sectorwiseData, paginationModel]);

  const fetchDataFromApi = async (
    data: ScreenerDataTableProps["sectorwiseData"]
  ) => {
    setLoading(true);
    setError(null);
    let allResults: ScreenerDataRow[] = [];
    let page = 1;
    const pageSize = paginationModel.pageSize;

    const payload = {
      year_range: data.year_range,
      dealType: data.dealType,
      region: data.region,
      sector: data.sector,
      deal_value: data.deal_value,
      t1_return: data.t1_return,
      t1m_returns: data.t1m_returns,
      pageSize,
    };

    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      if (!apiUrl) {
        throw new Error("API URL is not defined in environment variables");
      }

      while (true) {
        const response = await fetch(`${apiUrl}/api/super-screener/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...payload,
            page, // Page number
          }),
        });

        if (response.ok) {
          const result = await response.json();
          const newData = result.data || [];

          // Add the current page data to allResults
          allResults = [...allResults, ...newData];

          // Check if we've fetched all pages based on the total count
          const totalItems = result.pagination?.total_items || 0;
          const totalPages = Math.ceil(totalItems / pageSize);

          if (page >= totalPages) {
            break; // No more pages left
          }

          // Increment page and continue fetching
          page++;
        } else {
          throw new Error("Failed to fetch data");
        }
      }
      console.log(allResults, "finding the rows");

      setRows(allResults.map((item, index) => ({ ...item, id: index + 1 })));
      setTotalRows(allResults.length);
    } catch (err: any) {
      setError(err.message || "An error occurred while fetching data");
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalDealValue = (result: ScreenerDataRow[]) => {
    let totaldealvalue = 0;

    result.forEach((row) => {
      const cleanedDealValue = row.deal_value
        .toString()
        .replace(/[^0-9.-]+/g, ""); // Removes any non-numeric characters (except decimal and minus)

      const dealValue = parseFloat(cleanedDealValue);

      if (!isNaN(dealValue)) {
        totaldealvalue += dealValue;
      } else {
        console.error(`Invalid deal value: ${row.deal_value}`);
      }
    });

    return totaldealvalue;
  };

  const calculateAverageDealValue = (
    result: ScreenerDataRow[],
    columnName: keyof ScreenerDataRow
  ) => {
    let totalDealValue = 0;
    let validCount = 0;

    result.forEach((row) => {
      const cleanedDealValue = row[columnName]
        .toString()
        .replace(/[^0-9.-]+/g, "");
      const dealValue = parseFloat(cleanedDealValue);

      if (!isNaN(dealValue)) {
        totalDealValue += dealValue;
        validCount++;
      } else {
        console.error(
          `Invalid deal value in column ${columnName}: ${row[columnName]}`
        );
      }
    });

    return validCount > 0 ? totalDealValue / validCount : 0;
  };

  const totaldealvalue = calculateTotalDealValue(rows);
  const avgDealReturn = calculateAverageDealValue(rows, "t1_return");
  const avgT1mReturnsIndex = calculateAverageDealValue(
    rows,
    "t1m_returns_index_returns"
  );
  const avgT1dReturnsIndex = calculateAverageDealValue(
    rows,
    "t1d_returns_index_returns"
  );
  const TotalOpportunityValue = calculateAverageDealValue(
    rows,
    "opportunity_value_ex"
  );
  const Avg_t1m_Return = calculateAverageDealValue(rows, "t1m_returns");

  const columns: GridColDef[] = [
    { field: "pricing_date", headerName: "Pricing Date", width: 100 },
    { field: "issuer_name", headerName: "Issuer Name", width: 200 },
    { field: "ticker_symbol", headerName: "Ticker", width: 100 },
    { field: "gics_sector", headerName: "Sector", width: 180 },
    { field: "us_international", headerName: "Region", width: 100 },
    { field: "deal_type", headerName: "Deal Type", width: 80 },
    { field: "deal_value", headerName: "Deal Value", width: 120 },
    { field: "t1_return", headerName: "T + 1D Return", width: 100 },
    {
      field: "t1d_returns_index_returns",
      headerName: "T + 1D Index Returns",
      width: 100,
    },
    { field: "t1m_returns", headerName: "T + 1M Returns", width: 100 },
    {
      field: "t1m_returns_index_returns",
      headerName: "T + 1M Index Returns",
      width: 100,
    },
    {
      field: "opportunity_value_ex",
      headerName: "Opportunity Value Excess",
      width: 140,
    },
  ];

  return (
    <div>
      <Typography
        align="center"
        style={{ fontWeight: "bold", color: "#fd0303", marginBottom: "15px" }}
      >
        Total No of Deals:
        <span style={{ color: "#004b33" }}>{totalRows}</span>
      </Typography>

      <Box sx={{ height: 600, width: "100%", marginTop: 3 }}>
        <DataGrid
          rows={rows}
          columns={columns}
          paginationMode="server"
          rowCount={totalRows}
          loading={loading}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[10, 25, 50, 100]}
          rowHeight={35}

          sx={{
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: "transparent",
              fontWeight: "bold",
              color: "#002060",
            },
            "& .MuiDataGrid-columnHeaderTitle": {
              fontWeight: "bold",
              fontSize: "12px", // Decrease header font size
            },
            "& .MuiDataGrid-cell": {
              color: "#000000",
              fontSize: "12px", // Decrease font size for cell values
              padding: "4px", // Optional: Reduce padding for compact look
            },
            "& .MuiDataGrid-row:nth-of-type(odd)": {
              backgroundColor: "#F5F5F5",
            },
          }}
        />
      </Box>

      <Box
        sx={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: 2,
          marginTop: 3,
        }}
      >
        <Card
          sx={{
            width: "100%",
            boxShadow: 3,
            borderRadius: 2,
            backgroundColor: "#ffffff",
          }}
        >
          <CardContent>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 2,
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: "bold",
                  color: "#002060",
                }}
              >
                Summary
              </Typography>
            </Box>

            {/* First Row */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 2,
                padding: "10px",
                backgroundColor: "#f0f8ff",
                borderRadius: "8px",
                boxShadow: 1,
              }}
            >
              <Typography variant="body2">
                <strong>Total Deal Value:</strong> $
                {totaldealvalue.toLocaleString()}
              </Typography>
              <Typography variant="body2">
                <strong>Average T+1D Return:</strong> {avgDealReturn.toFixed(2)}
                %
              </Typography>
              <Typography variant="body2">
                <strong>Average T+1D Index Returns:</strong>{" "}
                {avgT1dReturnsIndex.toFixed(2)}%
              </Typography>
            </Box>

            {/* Second Row */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "10px",
                backgroundColor: "#f0f8ff",
                borderRadius: "8px",
                boxShadow: 1,
              }}
            >
              <Typography variant="body2">
                <strong>Average T+1M Returns:</strong>{" "}
                {Avg_t1m_Return.toFixed(2)}%
              </Typography>
              <Typography variant="body2">
                <strong>Average T+1M Index Returns:</strong>{" "}
                {avgT1mReturnsIndex.toFixed(2)}%
              </Typography>
              <Typography variant="body2">
                <strong>Average Opportunity Value:</strong> $
                {TotalOpportunityValue.toLocaleString()}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </div>
  );
};

export default ScreenerDataTable;
