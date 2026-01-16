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
  managementEmailFeedback: string;
  bankerFollowUpFeedback: string;
  emailSendToManagement: boolean;
  emailSendToBanker: boolean;
  emailSendToInternalTeam: boolean;
  emailSendToDealCaptain: boolean;
  emailIncludeInEmail: boolean;
  emailIncludeOneLineSummary: boolean;
  emailIncludeExecutiveSummary: boolean;
  emailIncludeMeetingNotes: boolean;
  emailIncludeKeyLevels: boolean;
  emailIncludeDealSize: boolean;
  emailIncludeFollowUpQuestion: boolean;
  ipoLockupExpiryAutomate: boolean;
  ipoLockupExpiryEmailTwoWeeks: boolean;
  ipoLockupExpiryEmailOnDay: boolean;
  lastDealLockupExpiryAutomate: boolean;
  lastDealLockupExpiryEmailTwoWeeks: boolean;
  lastDealLockupExpiryEmailOnDay: boolean;
  resultsAutomate: boolean;
  resultsEmailTwoWeeks: boolean;
  resultsEmailOnDay: boolean;
  opportunisticDealEmailOnTrigger: boolean;
};
