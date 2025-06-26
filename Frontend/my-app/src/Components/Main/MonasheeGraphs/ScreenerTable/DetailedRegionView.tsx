import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ScreenerDataTable from './ScreenerDataTable';

const DetailedRegionView: React.FC = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<any>(null);
  const [selectedRegion, setSelectedRegion] = useState<string>('');

  useEffect(() => {
    const storedState = sessionStorage.getItem('detailedRegionState');
    if (storedState) {
      const parsed = JSON.parse(storedState);
      setFilters(parsed.filters);
      setSelectedRegion(parsed.broad_region || '');  
    } else {
      navigate('/', { replace: true });
    }
  }, [navigate]);

  if (!filters || !selectedRegion) return <p>Loading detailed region view...</p>;

  const handleCancel = () => navigate(-1);

  const payload = {
    ...filters,
    broad_region: selectedRegion, 
  };

  console.log("Payload:", payload); 

  return <ScreenerDataTable sectorwiseData={payload} handleCancel={handleCancel} />;
};

export default DetailedRegionView;
