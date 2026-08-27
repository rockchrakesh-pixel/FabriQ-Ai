import React from 'react';
import { ScreenId } from '../types';
import { GlobalHeader, GlobalHeaderProps } from './GlobalHeader';

export interface HeaderProps extends GlobalHeaderProps {
  onOpenOnboarding?: () => void;
}

export const Header: React.FC<HeaderProps> = (props) => {
  return <GlobalHeader {...props} />;
};
