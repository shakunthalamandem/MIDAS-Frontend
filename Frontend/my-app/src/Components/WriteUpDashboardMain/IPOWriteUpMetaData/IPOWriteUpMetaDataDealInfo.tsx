import { useEffect, useState } from "react"
import {
  Box,
  Grid,
  IconButton,
  TextField,
  Typography
} from "@mui/material"
import EditIcon from "@mui/icons-material/Edit"
import SaveIcon from "@mui/icons-material/Save"
import CancelIcon from "@mui/icons-material/Cancel"
import { BasicDealDetails } from "../types/DealInformation"
import IPOWriteUpMetaDataSectionCard from "./IPOWriteUpMetaDataSectionCard"

interface IPOWriteUpMetaDataDealInfoProps {
  basicDealDetails: BasicDealDetails
  metadata?: Record<string, any>
}

const IPOWriteUpMetaDataDealInfo: React.FC<
  IPOWriteUpMetaDataDealInfoProps
> = ({ basicDealDetails, metadata }) => {
  const [editMode, setEditMode] = useState(false)
  const [formState, setFormState] = useState<Record<string, any>>({})
  const [saving, setSaving] = useState(false)

  const apiUrl = process.env.REACT_APP_API_URL
  const ticker = basicDealDetails.ticker

  useEffect(() => {
    setFormState(metadata ?? {})
  }, [metadata])

  /* ---------------- CONFIG ---------------- */

  const timelineConfig = [
    { label: "Filed", key: "filed_date" },
    { label: "Term", key: "term_date" },
    { label: "Pricing", key: "pricing_date" },
    { label: "Trade", key: "trade_date" }
  ]

  const infoCardsConfig = [
    { label: "Deal Size ($ Million)", key: "deal_size" },
    { label: "Sector", key: "sector" },
    { label: "Shares Offered", key: "shares_offered" },
    { label: "No of Shares Outstanding", key: "nosh" },
    { label: "Established", key: "established_year" },
    { label: "Bookrunners", key: "bookrunners" }
  ]

  const priceRange =
    formState?.lower_bound || formState?.upper_bound
      ? `${formState?.lower_bound ?? "--"} - ${
          formState?.upper_bound ?? "--"
        }`
      : "--"

  /* ---------------- SAVE ---------------- */

  const handleSave = async () => {
    if (!apiUrl) return
    setSaving(true)

    await fetch(`${apiUrl}/api/update_deal_writeup/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`
      },
      body: JSON.stringify({
        ticker,
        metadata: formState
      })
    })

    setEditMode(false)
    setSaving(false)
  }

  /* ---------------- UI ---------------- */

  return (

      <Box sx={{ position: "relative" }}>
        {/* ACTIONS */}
        <Box sx={{ position: "absolute", right: 8, top: 8 }}>
          {editMode ? (
            <>
              <IconButton size="small" onClick={handleSave} disabled={saving}>
                <SaveIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" onClick={() => setEditMode(false)}>
                <CancelIcon fontSize="small" />
              </IconButton>
            </>
          ) : (
            <IconButton size="small" onClick={() => setEditMode(true)}>
              <EditIcon fontSize="small" />
            </IconButton>
          )}
        </Box>

        {/* -------- TIMELINE -------- */}
        <Box sx={{ py: 3, position: "relative" }}>
          <Box
            sx={{
              position: "absolute",
              left: 24,
              right: 24,
              top: 40,
              height: 2,
              background: "#d9e3ff"
            }}
          />
          <Grid container spacing={2}>
            {timelineConfig.map((item) => (
              <Grid item xs={6} md={3} key={item.key}>
                <Box textAlign="center">
                  <Typography fontSize={13} fontWeight={600} color="#5064c4">
                    {item.label}
                  </Typography>
                  <Box
                    sx={{
                      width: 14,
                      height: 14,
                      borderRadius: "50%",
                      border: "2px solid #4b63d2",
                      background: "#fff",
                      mx: "auto",
                      my: 0.5,
                      boxShadow: "0 4px 8px rgba(75,99,210,.3)"
                    }}
                  />
                  <Typography fontWeight={600}>
                    {formState?.[item.key] ?? "--"}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* -------- INFO CARDS -------- */}
        <Grid container spacing={2}>
          {infoCardsConfig.map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item.key}>
              <Box
                sx={{
                  background: "#eef3ff",
                  borderRadius: 2,
                  border: "1px solid #d9e3ff",
                  p: 2,
                  minHeight: 80,
                  boxShadow: "0 6px 14px rgba(72,100,170,.12)"
                }}
              >
                <Typography fontSize={13} fontWeight={700} color="#203c8a">
                  {item.label}
                </Typography>

                {editMode ? (
                  <TextField
                    size="small"
                    fullWidth
                    value={formState[item.key] ?? ""}
                    onChange={(e) =>
                      setFormState((p) => ({
                        ...p,
                        [item.key]: e.target.value
                      }))
                    }
                    sx={{ mt: 0.5 }}
                  />
                ) : (
                  <Typography sx={{ mt: 0.5 }}>
                    {formState[item.key] ?? "--"}
                  </Typography>
                )}
              </Box>
            </Grid>
          ))}

          {/* PRICE RANGE */}
          <Grid item xs={12} sm={6} md={4}>
            <Box
              sx={{
                background: "#eef3ff",
                borderRadius: 2,
                border: "1px solid #d9e3ff",
                p: 2,
                minHeight: 80,
                boxShadow: "0 6px 14px rgba(72,100,170,.12)"
              }}
            >
              <Typography fontSize={13} fontWeight={700} color="#203c8a">
                Price Range
              </Typography>
              <Typography sx={{ mt: 0.5 }}>{priceRange}</Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>
  )
}

export default IPOWriteUpMetaDataDealInfo
