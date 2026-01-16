export type MeetingOverview = {
  ticker: string;
  name: string;
  date: string;
  location: string;
  reason: string;
  broker: string;
  attendees: string;
  bankerAttendees: string;
};

export type InvestmentSnapshot = {
  oneLineSummary: string;
  executiveSummary: string;
  keyLevel: string;
  possibleSize: string;
  results: string;
};

export type BusinessStrategy = {
  meetingNotes: string;
  catalysts: string;
  likelihoodPrimaryRaise: string;
  reasonForRaise: string;
  opportunisticDeal: string;
};

export type CapitalStructure = {
  potentialSellers: string;
  ipoLockupExpiry: string;
  lastDealLockupExpiry: string;
  historicalSellers: string;
  followUpQuestions: string;
  attachments: File[];
  keyValueAmount: string;
  keyValueComparator: string;
  keyValueAutomate: boolean;
  emailRecipients: string;
  ipoLockupExpiryAutomate: boolean;
  lastDealLockupExpiryAutomate: boolean;
  resultsAutomate: boolean;
};
