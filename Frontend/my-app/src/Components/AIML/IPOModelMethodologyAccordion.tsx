import React, { useMemo, useState } from "react";
import {
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Typography,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Divider,
    Box,
    Grid,
    Chip,
    Tooltip,
    Button,
    Paper,
    TableContainer,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    useTheme,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import BusinessCenterOutlinedIcon from "@mui/icons-material/BusinessCenterOutlined";
import BarChartOutlinedIcon from "@mui/icons-material/BarChartOutlined";
import TimelineOutlinedIcon from "@mui/icons-material/TimelineOutlined";
import DomainOutlinedIcon from "@mui/icons-material/DomainOutlined";
import InsightsOutlinedIcon from "@mui/icons-material/InsightsOutlined";
import LocalAtmOutlinedIcon from "@mui/icons-material/LocalAtmOutlined";

type FeatureImportance = { feature: string; importance: number };

interface IPOModelMethodologyProps {
    featureImportance?: FeatureImportance[];
    defaultExpanded?: boolean;
    title?: string;
}

/** Small bullet row with a consistent icon + tighter spacing */
const BulletRow: React.FC<{ text: React.ReactNode; color?: "primary" | "secondary" | "success" | "default" }> = ({
    text,
    color = "primary",
}) => {
    return (
        <ListItem sx={{ py: 0.6, px: 0 }}>
            <ListItemIcon sx={{ minWidth: 28, mt: "2px" }}>
                <CheckCircleOutlineIcon fontSize="small" color={color === "default" ? undefined : color} />
            </ListItemIcon>
            <ListItemText
                primaryTypographyProps={{ variant: "body2", fontWeight: 500 }}
                secondaryTypographyProps={{ variant: "caption" }}
                primary={text}
            />
        </ListItem>
    );
};

const SectionHeader: React.FC<{ icon: React.ReactNode; label: string }> = ({ icon, label }) => {
    const theme = useTheme();
    return (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <Box
                sx={{
                    p: 0.8,
                    borderRadius: 2,
                    bgcolor: theme.palette.action.hover,
                    display: "inline-flex",
                }}
            >
                {icon}
            </Box>
            <Typography variant="subtitle1" fontWeight={700}>
                {label}
            </Typography>
        </Box>
    );
};

const IPOModelMethodologyAccordion: React.FC<IPOModelMethodologyProps> = ({
    featureImportance,
    defaultExpanded = false,
    title = "Model Methodology",
}) => {
    const theme = useTheme();
    const [expanded, setExpanded] = useState(defaultExpanded);

    const handleToggle = () => setExpanded((prev) => !prev);

    // ---- Content blocks (clean, finance-first phrasing) ----
    const dealSpecific = (
        <>
            <BulletRow
                text={
                    <>
                        <strong>Allocation % of IOI & Deal Size</strong> — Gauges how demand is distributed relative to investor
                        interest and total offering, a strong signal of price support.
                    </>
                }
            />
            <BulletRow
                text={
                    <>
                        <strong>Deal Size ($)</strong> — The total capital raised; larger offerings can dampen first-day volatility,
                        while smaller deals may move more sharply.
                    </>
                }
            />
            <BulletRow
                text={
                    <>
                        <strong>Primary vs. Secondary</strong> — New capital (primary) vs. selling shareholders (secondary); a
                        higher secondary mix can weigh on sentiment.
                    </>
                }
            />
            <BulletRow
                text={
                    <>
                        <strong>Sponsor (Y/N)</strong> — Presence of a credible sponsor can improve distribution and aftermarket
                        support.
                    </>
                }
            />
        </>
    );

    const sectorAndPeers = (
        <>
            <BulletRow
                text={
                    <>
                        <strong>Sector (GICS)</strong> — The IPO’s industry classification.
                    </>
                }
            />
            <BulletRow
                text={
                    <>
                        <strong>Average Sector Returns</strong> — Recent 1-Week, 1-Month, and 3-Month sector performance to assess
                        current momentum.
                    </>
                }
            />
            <BulletRow
                text={
                    <>
                        <strong>Recent Sector IPOs (Last 10)</strong> — Average Day-1 and 1-Month returns for the last cohort in the
                        same sector.
                    </>
                }
            />
            <BulletRow
                text={
                    <>
                        <strong>Lead Bank Tier</strong> — Tier-1 vs. Tier-2/3 underwriters.
                    </>
                }
            />
        </>
    );

    const companyFundamentals = (
        <>
            <BulletRow
                text={
                    <>
                        <strong>Revenue</strong> — Reported revenue level used as a scale anchor for valuation context.
                    </>
                }
            />
            <BulletRow
                text={
                    <>
                        <strong>Revenue Growth</strong> — Growth trajectory; higher growth can command stronger demand when quality
                        and durability are credible.
                    </>
                }
            />
            <BulletRow
                color="success"
                text={
                    <>
                        <strong>Net Profit Margin</strong> — Profitability flag (profitable vs. loss-making) with implications for
                        valuation sensitivity and investor base.
                    </>
                }
            />
        </>
    );

    const macroAndMarket = (
        <>
            <BulletRow
                text={
                    <>
                        <strong>SPY (S&amp;P 500) Returns</strong> — 1-Week, 1-Month, and 3-Month averages to frame broad risk
                        appetite.
                    </>
                }
            />
            <BulletRow
                text={
                    <>
                        <strong>Treasury Yields</strong> — Rate backdrop affecting discount rates and equity risk premia.
                    </>
                }
            />
            <BulletRow
                text={
                    <>
                        <strong>Inflation &amp; GDP</strong> — Macro trend (Stabilizing/Accelerating/Decelerating) that shapes
                        multiples and flows.
                    </>
                }
            />
            <BulletRow
                text={
                    <>
                        <strong>NYSE Volume (vs. 1-Month Avg)</strong> — Liquidity snapshot on pricing day.
                    </>
                }
            />
        </>
    );

    const newIssueFlow = (
        <>
            <BulletRow
                text={
                    <>
                        <strong>Monthly IPO Activity</strong> — Total deal count and the share of positive outcomes in the current
                        month vs. history.
                    </>
                }
            />
            <BulletRow
                text={
                    <>
                        <strong>Flow Momentum (30–60 Days)</strong> — Whether issuance pace/quality is accelerating or slowing vs.
                        prior months.
                    </>
                }
            />
            <BulletRow
                text={
                    <>
                        <strong>Opportunity Value / Excess Return</strong> — Aggregate investor capture vs. historical baselines.
                    </>
                }
            />
            <BulletRow
                text={
                    <>
                        <strong>Recent IPO Sector Flow (1-Day &amp; 1-Month)</strong> — Sector-specific cadence and outcome
                        distribution for near-term comparables.
                    </>
                }
            />
        </>
    );

    type ChipType = { key: string; label: string; icon: React.ReactNode };

    const chips: ChipType[] = useMemo(
        () => [
            { key: "deal", label: "Deal", icon: <BusinessCenterOutlinedIcon fontSize="small" /> },
            { key: "sector", label: "Sector", icon: <DomainOutlinedIcon fontSize="small" /> },
            { key: "fundamentals", label: "Fundamentals", icon: <BarChartOutlinedIcon fontSize="small" /> },
            { key: "macro", label: "Macro", icon: <TimelineOutlinedIcon fontSize="small" /> },
            { key: "dealflow", label: "Deal Flow Indicators", icon: <AssessmentOutlinedIcon fontSize="small" /> },
        ],
        []
    );

    const chipColorMap: Record<string, { bg: string; fg: string; border?: string }> = useMemo(() => {
        const get = (bg: string) => ({
            bg,
            fg: theme.palette.getContrastText(bg),
        });

        return {
            deal: get(theme.palette.primary.main),           // execution
            sector: get(theme.palette.info.main),            // classification/info
            fundamentals: get(theme.palette.success.main),   // health/quality
            macro: get(theme.palette.warning.main),          // regime/risk backdrop
            dealflow: get(theme.palette.secondary.main),     // issuance/risk-on/off
        };
    }, [theme]);

    const soft = (tone: any) => ({ bg: tone.light, fg: theme.palette.getContrastText(tone.light), border: tone.main });


    const topFeatures = useMemo(() => {
        if (!featureImportance || featureImportance.length === 0) return [];
        return [...featureImportance].sort((a, b) => b.importance - a.importance).slice(0, 10);
    }, [featureImportance]);

    return (
        <Accordion
            expanded={expanded}
            onChange={handleToggle}
            disableGutters
            square={false}
            sx={{
                mt: 3,
                borderRadius: 3,
                overflow: "hidden",
                boxShadow: expanded ? theme.shadows[6] : theme.shadows[2],
                "&:before": { display: "none" },
            }}
            elevation={expanded ? 6 : 2}
        >
            <AccordionSummary
                aria-controls="ipo-methodology-content"
                id="ipo-methodology-header"
                sx={{
                    bgcolor: theme.palette.mode === "light" ? theme.palette.grey[50] : theme.palette.action.hover,
                    px: 2.5,
                    py: 1.5,
                    "& .MuiAccordionSummary-content": {
                        alignItems: "center",
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 2,
                        width: "100%",
                    },
                }}
            >
                {/* Left: Title + Chips */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
                    <Typography variant="h6" fontWeight={700}>
                        {title}
                    </Typography>

                    <Box sx={{ display: "flex", gap: 0.8, flexWrap: "wrap" }}>
                        {chips.map((c) => {
                            const clr = chipColorMap[c.key];
                            return (
                                <Chip
                                    key={c.key}
                                    size="small"
                                    icon={c.icon as any}
                                    label={c.label}
                                    sx={{
                                        borderRadius: 2,
                                        bgcolor: clr.bg,
                                        color: clr.fg,
                                        border: `1px solid ${clr.border ?? 'transparent'}`,
                                        '& .MuiChip-icon': { color: clr.fg },
                                        // subtle hover/active feel
                                        '&:hover': { opacity: 0.9 },
                                        '&:active': { opacity: 0.85 },
                                    }}
                                />
                            );
                        })}
                    </Box>
                </Box>

                {/* Right: Actions */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Tooltip
                        title={
                            <Box sx={{ p: 0.5 }}>
                                <Typography variant="body2" fontWeight={700} gutterBottom>
                                    Accuracy
                                </Typography>
                                <Typography variant="caption" display="block" gutterBottom>
                                    Share of times the model correctly predicts direction.
                                </Typography>
                                <Typography variant="body2" fontWeight={700} gutterBottom>
                                    Confidence
                                </Typography>
                                <Typography variant="caption" display="block">
                                    Strength of conviction for a given prediction.
                                </Typography>
                            </Box>
                        }
                        arrow
                    >
                        <InfoOutlinedIcon fontSize="small" sx={{ color: theme.palette.info.main }} />
                    </Tooltip>

                    <Button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleToggle();
                        }}
                        size="small"
                        variant="contained"
                        disableElevation
                        startIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        sx={{ borderRadius: 2, textTransform: "none", fontWeight: 700 }}
                    >
                        {expanded ? "Collapse" : "Expand"}
                    </Button>
                </Box>
            </AccordionSummary>

            <AccordionDetails sx={{ px: 2.5, py: 2.5 }}>
                {/* Overview */}
                <Paper
                    variant="outlined"
                    sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: theme.palette.mode === "light" ? "background.paper" : "background.default",
                    }}
                >
                    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
                        <LocalAtmOutlinedIcon fontSize="small" sx={{ mt: "2px" }} />
                        <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                            Our U.S. IPO model blends <strong>Deal Structure</strong>, <strong>Sector Momentum</strong>,{" "}
                            <strong>Company Fundamentals</strong>, <strong>Macro Conditions</strong>, and <strong>New-Issue Flow</strong>{" "}
                            to estimate the likelihood of strong T+1 Day and 1-Month performance.
                        </Typography>
                    </Box>
                </Paper>

                <Divider sx={{ my: 2.5 }} />

                {/* Sections */}
                <Grid container spacing={2.5}>
                    <Grid item xs={12} md={6}>
                        <SectionHeader icon={<BusinessCenterOutlinedIcon />} label="Deal-Specific Parameters" />
                        <List dense disablePadding>{dealSpecific}</List>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <SectionHeader icon={<DomainOutlinedIcon />} label="Sector & Peers" />
                        <List dense disablePadding>{sectorAndPeers}</List>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <SectionHeader icon={<BarChartOutlinedIcon />} label="Company Fundamentals" />
                        <List dense disablePadding>{companyFundamentals}</List>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <SectionHeader icon={<TimelineOutlinedIcon />} label="Macro & Market" />
                        <List dense disablePadding>{macroAndMarket}</List>
                    </Grid>

                    <Grid item xs={12}>
                        <SectionHeader icon={<InsightsOutlinedIcon />} label="New-Issue Flow Indicators" />
                        <List dense disablePadding>{newIssueFlow}</List>
                    </Grid>
                </Grid>

                {/* Optional: Feature Importance */}
                {topFeatures.length > 0 && (
                    <>
                        <Divider sx={{ my: 2.5 }} />
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                            <AssessmentOutlinedIcon />
                            <Typography variant="subtitle1" fontWeight={700}>
                                Top Features Driving the Model
                            </Typography>
                            <Tooltip title="Relative contribution of each input to the model’s predictions (higher = more influence)." arrow>
                                <InfoOutlinedIcon fontSize="small" sx={{ color: theme.palette.text.secondary }} />
                            </Tooltip>
                        </Box>

                        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                            <Table size="small" aria-label="feature-importance">
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 700 }}>Feature</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 700 }}>
                                            Importance (%)
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {topFeatures.map((row) => (
                                        <TableRow key={row.feature} hover>
                                            <TableCell sx={{ whiteSpace: "nowrap" }}>{row.feature}</TableCell>
                                            <TableCell align="right">{row.importance.toFixed(3)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </>
                )}
            </AccordionDetails>
        </Accordion>
    );
};

export default IPOModelMethodologyAccordion;
