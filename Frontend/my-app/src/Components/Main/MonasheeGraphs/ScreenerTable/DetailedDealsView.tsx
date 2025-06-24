import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ScreenerDataTable from './ScreenerDataTable';

const DetailedDealsView: React.FC = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<any>(null);
  const [sector, setSector] = useState<string>('');

  useEffect(() => {
    const storedState = sessionStorage.getItem('detailedDealsState');
    if (storedState) {
      const parsed = JSON.parse(storedState);
      setFilters(parsed.filters);
      setSector(parsed.sector);
    } else {
      navigate('/', { replace: true });
    }
  }, [navigate]);

  if (!filters || !sector) return <p>Loading detailed view...</p>;

  const handleCancel = () => navigate(-1);
  const payload = { ...filters, sector: [sector] };

  return <ScreenerDataTable sectorwiseData={payload} handleCancel={handleCancel} />;
};

export default DetailedDealsView;
