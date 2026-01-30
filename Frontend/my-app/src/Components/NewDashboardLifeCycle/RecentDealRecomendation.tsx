import React from 'react'
interface DashboardProps {
  ticker?: string;
}

const RecentDealRecomendation: React.FC<DashboardProps> = ({ ticker }) => {
  return (
    <div>
      <h1>Recent Deal Recommendation Component</h1>
    </div>
  )
}

export default RecentDealRecomendation
