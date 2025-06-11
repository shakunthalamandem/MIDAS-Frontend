// src/utils/tickerUtils.ts

// Interfaces
export interface DealogicRow {
    pricing_date: string;
    issuer_name: string;
    ticker_symbol: string;
    gics_sector: string;
    broad_region: string;
    deal_type: string;
    deal_value: number;
    issue_offer_price: number;
    t_plus_1d_return: number;
    left_lead_bank: string;
    t1d_excess_return: number;
    t_plus_1m_returns: number;
    t1m_excess_returns: number;
    opportunity_value_excess: number;
}

export interface MDDRow {
    broad_region: string | null;
    gics_sector_from_bloomberg: string | null;
    pricing_date: string;
    issuer_name: string;
    fo_discount: number | null;
    percentage_primary: number | null;
    allocation_deal_size: number | null;
    allocation_ioi: number | null;
    average_hold_period: number | null;
    total_committed_capital: number | null;
    total_return: number | null;
    percentage_total_return: number | null;
    t1m_return_from_bloomberg: number | null;
    all_bank: string;
    deal_type: string | null;
    deal_size: number | null;
    issue_offer_price: number | null;
    deal_captain: string | null;
    sponsor: string | null;
    ticker: string | null;
}

export interface ApiResponse {
    ticker: string;
    dealogic_data: {
        data: DealogicRow[];
        count: number;
    };
    mdd_data: {
        data: MDDRow[];
        summary: any;
    };
}

export interface SelectedTickerProps {
    ticker: string;
}

// Utility Functions
export const getOrdinalSuffix = (day: number): string => {
    if (day > 3 && day < 21) return "th";
    switch (day % 10) {
        case 1: return "st";
        case 2: return "nd";
        case 3: return "rd";
        default: return "th";
    }
};

export const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
        day: "numeric",
        month: "long",
        year: "numeric",
    };
    const formattedDate = date.toLocaleDateString("en-GB", options);
    const day = date.getDate();
    return formattedDate.replace(`${day}`, `${day}${getOrdinalSuffix(day)}`);
};

export const formatNumber = (num: number | null | undefined, decimals = 2) => {
    if (num === null || num === undefined) return "-";
    return num.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });
};
