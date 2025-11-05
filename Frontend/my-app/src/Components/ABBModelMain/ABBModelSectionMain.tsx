import React from 'react';
import ABBSection1 from './ABBSection1';
import ABBSection2 from './ABBSection2';
import ABBSection3 from './ABBSection3';
import ABBSection4 from './ABBSection4';
import ABBSection5 from './ABBSection5';
import ABBSection6 from './ABBSection6';
import ABBSection7 from './ABBSection7';
import ABBSection8 from './ABBSection8';
import type { ABBSectionProps } from './ABBSection.types';

const sectionData: ABBSectionProps[] = [
  {
    title: 'Executive Summary',
    description: 'High-level overview of the ABB model insights and business outcomes.',
    highlights: ['Key objectives', 'Top-line metrics', 'Strategic priorities'],
  },
  {
    title: 'Financial Metrics',
    description: 'Detailed breakdown of revenue, cost, and profitability drivers.',
    highlights: ['Revenue trends', 'Cost optimization levers', 'EBITDA impact'],
  },
  {
    title: 'Operational Insights',
    description: 'Operational performance indicators and process efficiency insights.',
    highlights: ['Throughput analysis', 'Cycle-time improvements', 'Resource utilization'],
  },
  {
    title: 'Customer Segmentation',
    description: 'Segmentation of customers with tailored engagement strategies.',
    highlights: ['Segment definitions', 'Value propositions', 'Engagement tactics'],
  },
  {
    title: 'Product Performance',
    description: 'Assessment of product portfolio performance and opportunities.',
    highlights: ['Top-performing products', 'Underperforming SKUs', 'Innovation pipeline'],
  },
  {
    title: 'Risk Assessment',
    description: 'Identified risks and mitigation plans associated with the ABB model.',
    highlights: ['Operational risks', 'Financial risks', 'Mitigation strategies'],
  },
  {
    title: 'Implementation Roadmap',
    description: 'Step-by-step plan to operationalize ABB model recommendations.',
    highlights: ['Phase timelines', 'Resource allocation', 'Success metrics'],
  },
  {
    title: 'Appendix & Resources',
    description: 'Supporting documents, data sources, and contact points.',
    highlights: ['Reference materials', 'Data dictionaries', 'Support contacts'],
  },
];

const ABBModelSectionMain: React.FC = () => (
  <div>
    <ABBSection1 {...sectionData[0]} />
    <ABBSection2 {...sectionData[1]} />
    <ABBSection3 {...sectionData[2]} />
    <ABBSection4 {...sectionData[3]} />
    <ABBSection5 {...sectionData[4]} />
    <ABBSection6 {...sectionData[5]} />
    <ABBSection7 {...sectionData[6]} />
    <ABBSection8 {...sectionData[7]} />
  </div>
);

export default ABBModelSectionMain;
