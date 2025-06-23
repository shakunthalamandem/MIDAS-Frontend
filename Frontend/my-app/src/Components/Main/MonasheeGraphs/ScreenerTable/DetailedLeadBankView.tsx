import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ScreenerDataTable from './ScreenerDataTable';

const DetailedLeadBankView: React.FC = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<any>(null);
  const [selectedBank, setSelectedBank] = useState<string>('');

  useEffect(() => {
    const storedState = sessionStorage.getItem('detailedLeadBankState');
    if (storedState) {
      const parsed = JSON.parse(storedState);
      setFilters(parsed.filters);
      setSelectedBank(parsed.bankName || '');
    } else {
      navigate('/', { replace: true });
    }
  }, [navigate]);

  if (!filters || !selectedBank) return <p>Loading detailed view...</p>;

  const handleCancel = () => navigate(-1);
  const payload = { ...filters, left_lead_bank: [selectedBank] };

  return <ScreenerDataTable sectorwiseData={payload} handleCancel={handleCancel} />;
};

export default DetailedLeadBankView;