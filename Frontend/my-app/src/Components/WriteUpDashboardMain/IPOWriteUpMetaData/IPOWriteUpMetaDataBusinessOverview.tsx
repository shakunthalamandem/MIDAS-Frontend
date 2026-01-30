import React, { useEffect, useState, ReactElement } from 'react'
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  IconButton,
  TextField,
  Box,
  Chip,
  Paper,
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import EditIcon from '@mui/icons-material/Edit'
import SaveIcon from '@mui/icons-material/Save'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import GroupsIcon from '@mui/icons-material/Groups'
import AccountTreeIcon from '@mui/icons-material/AccountTree'

/* ===================== TYPES ===================== */

interface WriteUpData {
  business_overview: string[]
  key_highlights: string[]
  concerns: string[]
  principal_stockholders_preipo: string[]
  key_management_personnel: string[]
  [key: string]: string[]
}

interface Props {
  basicDealDetails: {
    ticker: string
  }
}

type AccordionSection = {
  section: keyof WriteUpData
  title: string
  icon: ReactElement
}

/* ===================== CONFIG ===================== */

const ACCORDION_SECTIONS: AccordionSection[] = [
  {
    section: 'key_highlights',
    title: 'Key Highlights',
    icon: <TrendingUpIcon />,
  },
  {
    section: 'concerns',
    title: 'Concerns',
    icon: <WarningAmberIcon />,
  },
  {
    section: 'principal_stockholders_preipo',
    title: 'Principal Stockholders Pre-IPO',
    icon: <AccountTreeIcon />,
  },
  {
    section: 'key_management_personnel',
    title: 'Key Management Personnel',
    icon: <GroupsIcon />,
  },
]

/* ===================== COMPONENT ===================== */

const IPOWriteUpMetaDataBusinessOverview: React.FC<Props> = ({
  basicDealDetails,
}) => {
  const [writeUpData, setWriteUpData] = useState<WriteUpData | null>(null)
  const [updatedData, setUpdatedData] = useState<WriteUpData | null>(null)
  const [editMode, setEditMode] = useState<keyof WriteUpData | null>(null)

  /* ===================== FETCH ===================== */

  useEffect(() => {
    const fetchData = async () => {
      const apiUrl = process.env.REACT_APP_API_URL
      const token = localStorage.getItem('access_token')

      const res = await fetch(`${apiUrl}/api/writeup_data/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ ticker: basicDealDetails.ticker }),
      })

      const data = await res.json()
      setWriteUpData(data)
      setUpdatedData(data)
    }

    fetchData()
  }, [basicDealDetails])

  /* ===================== HANDLERS ===================== */

  const handleChange = (
    section: keyof WriteUpData,
    index: number,
    value: string
  ) => {
    if (!updatedData) return
    const copy = { ...updatedData }
    copy[section][index] = value
    setUpdatedData(copy)
  }

  const renderSectionContent = (
    section: keyof WriteUpData,
    data: string[]
  ) =>
    data.map((item, index) =>
      editMode === section ? (
        <TextField
          key={index}
          fullWidth
          value={item}
          onChange={(e) => handleChange(section, index, e.target.value)}
          sx={{ mb: 2 }}
        />
      ) : (
        <Typography key={index} variant="body2" sx={{ mb: 1.5 }}>
          {item}
        </Typography>
      )
    )

  if (!writeUpData) return null

  /* ===================== UI ===================== */

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 3,
        backgroundColor: '#F8FAFF',
        border: '1px solid #E6ECF5',
      }}
    >
      {/* ================= BUSINESS OVERVIEW ================= */}
      <Box textAlign="center" mb={4}>
        <Typography variant="h5" fontWeight={600}>
          Business Overview
        </Typography>

        <Chip
          label="Rating – 9/10"
          size="small"
          sx={{
            mt: 1,
            backgroundColor: '#EAF1FF',
            color: '#2563EB',
            fontWeight: 500,
          }}
        />

        <Box mt={3}>
          {renderSectionContent(
            'business_overview',
            writeUpData.business_overview || []
          )}
        </Box>
      </Box>

      {/* ================= ACCORDIONS ================= */}
      {ACCORDION_SECTIONS.map(({ section, title, icon }) => (
        <Accordion
          key={section}
          sx={{
            mb: 2,
            borderRadius: 2,
            border: '1px solid #E6ECF5',
            '&:before': { display: 'none' },
          }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box display="flex" alignItems="center" gap={1.5}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 2,
                  backgroundColor: '#EEF4FF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#2563EB',
                }}
              >
                {icon}
              </Box>

              <Typography fontWeight={600}>{title}</Typography>
            </Box>

            <IconButton
              onClick={(e) => {
                e.stopPropagation()
                setEditMode(editMode === section ? null : section)
              }}
              sx={{ ml: 'auto' }}
            >
              {editMode === section ? <SaveIcon /> : <EditIcon />}
            </IconButton>
          </AccordionSummary>

          <AccordionDetails>
            {renderSectionContent(
              section,
              writeUpData[section] || []
            )}
          </AccordionDetails>
        </Accordion>
      ))}
    </Paper>
  )
}

export default IPOWriteUpMetaDataBusinessOverview
