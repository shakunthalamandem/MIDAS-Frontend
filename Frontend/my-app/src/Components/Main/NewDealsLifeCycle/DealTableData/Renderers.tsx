import { GridRenderCellParams } from "@mui/x-data-grid";
import { Box } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";

import AddCircleRoundedIcon from "@mui/icons-material/AddCircleRounded";
import RemoveCircleRoundedIcon from "@mui/icons-material/RemoveCircleRounded";
import PauseCircleFilledRoundedIcon from "@mui/icons-material/PauseCircleFilledRounded"; // for Neutral

// ✅ Format header with line breaks
export const formatHeader = (label: string) => {
  const words = label.split(" ");
  return words.length === 1 ? (
    label
  ) : (
    <span style={{ textAlign: "center", display: "block" }}>
      {words[0]} <br /> {words.slice(1).join(" ")}
    </span>
  );
};





// ✅ Date formatter (shows "To Be Announced" if empty/invalid)
export const formatDateCell = (params: GridRenderCellParams<any>) => {
  if (!params.value) return "To Be Announced";
  const date = new Date(params.value);
  if (isNaN(date.getTime())) return "To Be Announced";

  const day = date.getDate();
  const month = date.toLocaleString("en-US", { month: "short" });
  const year = date.getFullYear();

  const getDaySuffix = (d: number) => {
    if (d > 3 && d < 21) return "th";
    switch (d % 10) {
      case 1: return "st";
      case 2: return "nd";
      case 3: return "rd";
      default: return "th";
    }
  };

  return `${day}${getDaySuffix(day)} ${month} ${year}`;
};

// ✅ Deal Status Renderer (✔ with circle or ✘ if missing)
export const renderDealStatsCell = (params: GridRenderCellParams<any>) => {
  const status = params.value;

  if (!status) {
    // ❌ No data → red ✘
    return (
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
        <span style={{ color: "red", fontWeight: "bold", fontSize: 12 }}>✘</span>
      </Box>
    );
  }

  let color = "";
  let letter = "";

  if (status === "Announced") {
    color = "#002060"; letter = "A";
  } else if (status === "Price Range") {
    color = "orange"; letter = "P";
  } else if (status === "Issued") {
    color = "green"; letter = "I";
  } else {
    // ❌ Unknown status → red ✘
    return (
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
        <span style={{ color: "red", fontWeight: "bold", fontSize: 12 }}>✘</span>
      </Box>
    );
  }

  // ✅ Valid status → green ✔ + colored circle with letter
  return (
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1, height: "100%" }}>
      <span style={{ color: "green", fontWeight: "bold", fontSize: 12 }}>✔</span>
      <Box
        sx={{
          width: 20,
          height: 20,
          borderRadius: "50%",
          backgroundColor: color,
          color: "white",
          fontSize: 12,
          fontWeight: "bold",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {letter}
      </Box>
    </Box>
  );
};






export const renderCheckCell = (params: GridRenderCellParams<any>) => {
  const val = params.value?.toString().toLowerCase();

  let hasPrediction = false;
  let valueIcon: JSX.Element | null = null;

  if (val) {
    if (val.includes("positive")) {
      hasPrediction = true;
      valueIcon = <AddCircleRoundedIcon style={{ color: "green", fontSize: 18 }} />;
    } else if (val.includes("negative") || val.includes("low return")) {
      hasPrediction = true;
      valueIcon = <RemoveCircleRoundedIcon style={{ color: "red", fontSize: 18 }} />;
    } else if (val.includes("neutral") || val.includes("netural return")) {
      hasPrediction = true;
      valueIcon = (
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "18px",
            height: "18px",
            borderRadius: "50%",
            backgroundColor: "orange",
            color: "white",
            fontSize: "11px",
            fontWeight: "bold",
          }}
        >
          N
        </span>
      );
    }
  }

  return (
    <span
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "4px",
        fontWeight: "bold",
        fontSize: "14px",
      }}
    >
      {hasPrediction ? (
        <span style={{ color: "green" }}>✔</span>
      ) : (
        <span style={{ color: "red" }}>✘</span>
      )}
            {valueIcon}

    </span>
  );
};
