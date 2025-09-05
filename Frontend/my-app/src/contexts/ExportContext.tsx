import React, { createContext, useContext, useState, ReactNode } from 'react';

type ExportContextType = {
  forceExpand: boolean;
  setForceExpand: (v: boolean) => void;
};

const ExportContext = createContext<ExportContextType | undefined>(undefined);

export const ExportProvider = ({
  children,
  forceExpand: controlledForceExpand,
  setForceExpand: controlledSetForceExpand,
}: {
  children: ReactNode;
  forceExpand?: boolean;
  setForceExpand?: (v: boolean) => void;
}) => {
  const [uncontrolledForceExpand, setUncontrolledForceExpand] = useState(false);
  const forceExpand = controlledForceExpand ?? uncontrolledForceExpand;
  const setForceExpand = controlledSetForceExpand ?? setUncontrolledForceExpand;
  return (
    <ExportContext.Provider value={{ forceExpand, setForceExpand }}>
      {children}
    </ExportContext.Provider>
  );
};

export const useExportContext = (): ExportContextType => {
  const ctx = useContext(ExportContext);
  if (!ctx) throw new Error('useExportContext must be used within ExportProvider');
  return ctx;
};
