export interface BusinessDetails {
  strengths?: string;
  weakness?: string;
  management?: string;
  business_highlights?: string;
}

export type SectionKey = keyof BusinessDetails;

export const SECTION_ORDER: { key: SectionKey; title: string }[] = [
  { key: "business_highlights", title: "Business Highlights" },
  { key: "management", title: "Management" },
  { key: "strengths", title: "Strengths" },
  { key: "weakness", title: "Concerns" },
];
