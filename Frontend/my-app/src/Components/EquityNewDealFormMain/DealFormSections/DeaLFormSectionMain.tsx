import React, { useEffect, useState } from 'react';
import DealFormDataTabsMain from '../DealFormDataTabs/DealFormDataTabsMain';

interface Props {
  selectedOption: any;
}

const DealFormSectionMain: React.FC<Props> = ({ selectedOption }) => {
  const [formData, setFormData] = useState<any>(null);
  const [isCreate, setIsCreate] = useState<boolean>(false);

  useEffect(() => {
    if (!selectedOption) return;

    if (selectedOption.create) {
      setFormData({});
      setIsCreate(true);
    } else {
      fetch(`/api/deal-details?ticker=${selectedOption.ticker}&pricing_date=${selectedOption.pricing_date}`)
        .then((res) => res.json())
        .then((data) => {
          setFormData(data);
          setIsCreate(false);
        });
    }
  }, [selectedOption]);

  if (!selectedOption) return null;

  return <DealFormDataTabsMain formData={formData} isCreate={isCreate} />;
};

export default DealFormSectionMain;