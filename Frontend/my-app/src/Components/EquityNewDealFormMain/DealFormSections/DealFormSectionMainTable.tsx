import React, { useEffect, useState } from 'react';
import DealFormDataTabsMain from '../DealFormDataTabs/DealFormDataTabsMain';

interface Props {
  selectedOption: any;
}

const DealFormSectionMainTable: React.FC<Props> = ({ selectedOption }) => {
  const [formData, setFormData] = useState<any>(null);
  const [isCreate, setIsCreate] = useState<boolean>(false);
  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem('access_token');

  useEffect(() => {
    if (!selectedOption) return;

    if (selectedOption.create) {
      setFormData({
        deal_information: {},
        deal_allocations: {},
        market_data: {},
        technical_market_data: {},
        deal_color: {},
      });
      setIsCreate(true);
    } else {
      fetch(`${apiUrl}/api/equity_get_deal_form/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ticker: selectedOption.ticker,
          pricing_date: selectedOption.pricing_date,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          setFormData(data);
          setIsCreate(false);
        });
    }
  }, [selectedOption]);

  if (!selectedOption || formData === null) return null;

  return <DealFormDataTabsMain formData={formData} isCreate={isCreate} />;
};

export default DealFormSectionMainTable;