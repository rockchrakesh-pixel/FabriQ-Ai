import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppDivision } from '../types';

interface DivisionContextType {
  division: AppDivision;
  setDivision: (division: AppDivision) => void;
  showSelectorModal: boolean;
  setShowSelectorModal: (show: boolean) => void;
  toggleDivision: () => void;
}

const DivisionContext = createContext<DivisionContextType>({
  division: 'laundry',
  setDivision: () => {},
  showSelectorModal: false,
  setShowSelectorModal: () => {},
  toggleDivision: () => {},
});

export const DivisionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [division, setDivisionState] = useState<AppDivision>(() => {
    const saved = localStorage.getItem('fabriq_selected_division');
    return (saved as AppDivision) || 'laundry';
  });

  const [showSelectorModal, setShowSelectorModal] = useState<boolean>(() => {
    const chosen = localStorage.getItem('fabriq_division_chosen');
    return !chosen; // Show modal on first entrance
  });

  const setDivision = (div: AppDivision) => {
    setDivisionState(div);
    localStorage.setItem('fabriq_selected_division', div);
    localStorage.setItem('fabriq_division_chosen', 'true');
    setShowSelectorModal(false);
  };

  const toggleDivision = () => {
    const next = division === 'laundry' ? 'boutique' : 'laundry';
    setDivision(next);
  };

  return (
    <DivisionContext.Provider
      value={{
        division,
        setDivision,
        showSelectorModal,
        setShowSelectorModal,
        toggleDivision,
      }}
    >
      {children}
    </DivisionContext.Provider>
  );
};

export const useDivision = () => useContext(DivisionContext);
