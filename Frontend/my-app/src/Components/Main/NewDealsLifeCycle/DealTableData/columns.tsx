import { GridColDef } from "@mui/x-data-grid";
import { Link } from "react-router-dom";
import { formatHeader, formatDateCell, renderDealStatsCell, renderCheckCell } from "./Renderers";


export const getColumns = (
  selectedOp: string,
  selectedId: string | number | null
): GridColDef[] => {
  // ✅ Dynamic date column
  // const dateColumn: GridColDef =
  //   selectedOp === "September to Date"
  //     ? {
  //         field: "pricing_date",
  //         headerName: "Pricing Date",
  //         renderHeader: () => formatHeader("Pricing Date"),
  //         flex: 1.5,
  //         headerAlign: "left",
  //         align: "left",
  //         renderCell: formatDateCell,
  //       }
  //     : {
  //         field: "expected_listing_date",
  //         headerName: "Expected Listing Date",
  //         renderHeader: () => formatHeader("Expected Listing Date"),
  //         flex: 1.5,
  //         headerAlign: "left",
  //         align: "left",
  //         renderCell: formatDateCell,
  //       };

  // ✅ Dynamic price/issue price column
  
  const priceOrIssueColumn: GridColDef =
    selectedOp === "September to Date"
      ? {
          field: "issue_price",
          headerName: "Issue Price",
          renderHeader: () => formatHeader("Issue Price"),
          flex: 1,
          headerAlign: "left",
          minWidth: 120,
          align: "left",
          renderCell: (params) => {
            const val = params.value;
            return val ? `$${Number(val).toFixed(2)}` : "TBD";
          },
        }
      : {
          field: "price_range",
          headerName: "Price Range",
          renderHeader: () => formatHeader("Price Range"),
          flex: 1,
          headerAlign: "left",
          minWidth: 120,
          align: "left",
          renderCell: (params) => {
            const { deal_type, issue_price, pricing_range_min, pricing_range_max } = params.row;

            // Case 1: FO → show issue_price
            if (deal_type === "FO") {
              const price = Number(issue_price);
              return !isNaN(price) ? `$${price.toFixed(0)}` : "TBD";
            }

            // Case 2: IPO (or others) → show range
            if (!pricing_range_min || !pricing_range_max) return "TBD";

            const min = Number(pricing_range_min);
            const max = Number(pricing_range_max);
            return !isNaN(min) && !isNaN(max)
              ? `$${min.toFixed(0)} - $${max.toFixed(0)}`
              : "TBD";
          },
        };
// utils/formatters.ts
const formatDealSize = (value: any): string => {
  if (value == null || isNaN(value)) return "TBD";

  const millions = Number(value) / 1_000_000;

  if (millions < 0) {
    // return `($${Math.abs(millions).toFixed()}M)`; // finance style
    return `-$${Math.abs(millions).toFixed()}M`;    // minus sign style ✅
  }

  return `$${millions.toFixed()}M`;
};


  return [
    {
      field: "ticker",
      headerName: "Ticker",
      renderHeader: () => formatHeader("Ticker"),
      flex: 1,
      headerAlign: "left",
      align: "left",
          minWidth: 120,
      renderCell: (params) => (
        <span
          style={{
            color: "#96000A",
            textDecoration: selectedId === params.row.id ? "underline" : "none",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          {params.value}
        </span>
      ),
    },
    { field: "region", headerName: "Region", renderHeader: () => formatHeader("Region"), flex: 0.75, 
          minWidth: 120,headerAlign: "left", align: "left" },
    { field: "sector", headerName: "Sector", renderHeader: () => formatHeader("Sector"), flex: 1.25, headerAlign: "left", align: "left" },
    { field: "issuer_name", headerName: "Issuer Name", renderHeader: () => formatHeader("Issuer Name"), flex: 2, headerAlign: "left", align: "left" },

{
  field: "deal_size",
  headerName: "Deal Size",
  renderHeader: () => formatHeader("Deal Size ($M)"),
  flex: 1,
          minWidth: 120,
  headerAlign: "left",
  align: "left",
  renderCell: (params) => formatDealSize(params.value),
  sortComparator: (v1, v2) => Number(v1) - Number(v2),
},
    // dateColumn,
    {field: "trade_date", headerName: "First Trade Date", renderHeader: () => formatHeader("First Trade Date"), 
          minWidth: 120,flex: 1.5, headerAlign: "left", align: "left", renderCell: formatDateCell},
    {field: "pricing_date", headerName: "Pricing Date", renderHeader: () => formatHeader("Pricing Date"), 
          minWidth: 120,flex: 1.12, headerAlign: "left", align: "left", renderCell: formatDateCell},

    {
      field: "deal_type",
      headerName: "Deal Type",
      renderHeader: () => formatHeader("Deal Type"),
      flex: 0.70,
      headerAlign: "left",
          minWidth: 120,
      align: "left",
    },
        {
      field: "fo_type",
      headerName: "FO Type",
      renderHeader: () => formatHeader("FO Type"),
      flex: 0.80,
          minWidth: 120,
      headerAlign: "left",
      align: "left",
    },

    priceOrIssueColumn,

    {
      field: "writeup_available",
      headerName: "Writeup Available",
      renderHeader: () => formatHeader("Writeup Available"),
      flex: 1,
      headerAlign: "left",
          minWidth: 120,
      align: "left",
      renderCell: (params) => {
        // Determine the link based on the deal_type dynamically
        const dealType = params.row.deal_type?.toLowerCase();
        const ticker = params.row.ticker;

        const link =
          dealType === "ipo"
            ? `/equity/ipo_dashboard/${ticker}`
            : dealType === "fo"
            ? `/equity/fo_dashboard/${ticker}`
            : "#"; // fallback or no link

        return params.value?.toString().toLowerCase() === "yes" ? (
          <Link
            to={link}
            style={{
              color: "#002060",
              fontWeight: "bold",
              textDecoration: "none",
            }}
          >
            <span style={{ color: "green" }}>✔</span>{" "}
            <span style={{ textDecoration: "underline" }}>Report</span>
          </Link>
        ) : (
          <span style={{ color: "red" }}>✘</span>
        );
      },
    },

    {
      field: "deal_status",
      headerName: "Deal Status",
      renderHeader: () => formatHeader("Deal Status"),
      flex: 1,
          minWidth: 120,
      headerAlign: "left",
      align: "left",
      renderCell: renderDealStatsCell,
    },
    {
      field: "t1d_pred",
      headerName: "AI-ML Prediction",
          minWidth: 120,
      renderHeader: () => formatHeader("AI-ML Prediction"),
      flex: 1,
      headerAlign: "left",
      align: "left",
      renderCell: renderCheckCell,
    },
    // {
    //   field: "track_here",
    //   headerName: "Track",
    //   renderHeader: () => formatHeader("Track"),
    //   flex: 1,
    //   headerAlign: "left",
    //   align: "left",
    //   renderCell: (params) => {
    //     const ticker = params.row.ticker;
    //     const pricingDate = params.row.pricing_date;
    //     const handleTrackHereClick = () => {
    //       if (ticker) {
    //         const cleanPricingDate =
    //           pricingDate === '""' || !pricingDate ? '""' : pricingDate;
    //         const url = `/deals/dashboard/Tracking?ticker=${ticker}&pricing_date=${cleanPricingDate}`;
    //         window.open(url, "_blank");
    //       }
    //     };
    //     return (
    //       <span
    //         onClick={handleTrackHereClick}
    //         style={{
    //           cursor: "pointer",
    //           color: "#0066cc",
    //           textDecoration: "underline",
    //         }}
    //       >
    //         Track
    //       </span>
    //     );
    //   },
    // },
  ];
};
