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
    try {
      const saved = localStorage.getItem('fabriq_selected_division');
      if (saved && (saved === 'laundry' || saved === 'boutique' || saved === 'luxury_store')) {
        return saved as AppDivision;
      }
    } catch {
      // fallback
    }
    return 'laundry';
  });

  const [showSelectorModal, setShowSelectorModal] = useState<boolean>(() => {
    try {
      const chosen = localStorage.getItem('fabriq_division_chosen');
      return !chosen; // Show modal on first entrance
    } catch {
      return false;
    }
  });

  const setDivision = (div: AppDivision) => {
    setDivisionState(div);
    try {
      localStorage.setItem('fabriq_selected_division', div);
      localStorage.setItem('fabriq_division_chosen', 'true');
    } catch {
      // fallback
    }
    setShowSelectorModal(false);
  };

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'fabriq_selected_division' && e.newValue) {
        if (e.newValue === 'laundry' || e.newValue === 'boutique' || e.newValue === 'luxury_store') {
          setDivisionState(e.newValue as AppDivision);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const toggleDivision = () => {
    const nextMap: Record<AppDivision, AppDivision> = {
      laundry: 'boutique',
      boutique: 'luxury_store',
      luxury_store: 'laundry',
    };
    setDivision(nextMap[division] || 'laundry');
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
