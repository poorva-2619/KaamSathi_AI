import React from 'react';

export interface ProfileCardProps {
  name?: string;
  role?: string;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
  name = 'User Name',
  role = 'Service Provider',
}) => {
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-card flex items-center gap-4">
      <div className="w-14 h-14 rounded-2xl bg-primary-100 text-primary-600 font-bold flex items-center justify-center text-xl">
        {name.charAt(0)}
      </div>
      <div>
        <h3 className="text-lg font-bold text-slate-900">{name}</h3>
        <p className="text-sm text-primary-600 font-medium">{role}</p>
      </div>
    </div>
  );
};

export default ProfileCard;
