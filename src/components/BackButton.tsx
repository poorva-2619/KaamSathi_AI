import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export interface BackButtonProps {
  /** Optional custom path to navigate to instead of -1 */
  to?: string;
  /** Optional custom click handler to override default navigation */
  onClick?: () => void;
  className?: string;
}

export const BackButton: React.FC<BackButtonProps> = ({ to, onClick, className = '' }) => {
  const navigate = useNavigate();

  const handlePress = () => {
    if (onClick) {
      onClick();
    } else if (to) {
      navigate(to);
    } else {
      navigate(-1);
    }
  };

  return (
    <button
      type="button"
      onClick={handlePress}
      className={`min-w-[44px] min-h-[44px] flex items-center justify-center -ml-2 rounded-full hover:bg-slate-100 active:bg-slate-200 transition-colors text-slate-700 ${className}`}
      aria-label="Go back"
    >
      <ArrowLeft className="w-5 h-5" />
    </button>
  );
};

export default BackButton;
