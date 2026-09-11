import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { profilesService } from '../../services/profiles';
import { jobsService } from '../../services/jobs';
import { parseProfileMeta, formatProfileMeta } from '../../utils/profileMeta';
import { Loading } from '../../components/Loading';
import { MapPin, Phone, Edit3, Save, X, Star, CheckCircle, Loader2, Briefcase } from 'lucide-react';


export const Profile: React.FC = () => {
  const { user, profile, loading: authLoading, refreshProfile } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [bioNote, setBioNote] = useState('');
  const [lat, setLat] = useState<number>(19.076);
  const [lng, setLng] = useState<number>(72.8777);

  const [jobCounts, setJobCounts] = useState<{ posted: number; completed: number }>({ posted: 0, completed: 0 });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setPhone(profile.phone || '');
      setAddress(profile.address || '');
      if (profile.lat) setLat(profile.lat);
      if (profile.lng) setLng(profile.lng);

      const parsedMeta = parseProfileMeta(profile.bio);
      if (parsedMeta.age) setAge(parsedMeta.age);
      if (parsedMeta.gender) setGender(parsedMeta.gender);
      if (parsedMeta.note) setBioNote(parsedMeta.note);
    }
  }, [profile]);

  useEffect(() => {
    if (profile?.id) {
      jobsService.getJobCountsByProvider(profile.id).then((counts) => {
        setJobCounts(counts);
      });
    }
  }, [profile?.id]);

  if (authLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    setMessage('');

    try {
      const combinedBio = formatProfileMeta(age, gender, bioNote);

      await profilesService.updateProfile(user.id, {
        full_name: fullName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        bio: combinedBio,
        lat,
        lng,
      });

      await refreshProfile();
      setIsEditing(false);
      setMessage('Job Provider profile updated successfully!');
      setTimeout(() => setMessage(''), 4000);
    } catch (err: unknown) {
      console.error('Error updating profile:', err);
      setMessage('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] py-8 px-4 sm:px-6 bg-slate-50 pb-24 md:pb-8">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Success Confirmation Toast */}
        {message && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-xs text-emerald-800 font-semibold shadow-sm">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {/* Header Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-orange-600 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : 'P'}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                    {profile?.full_name || 'Job Provider'}
                  </h1>
                  <span className="px-2.5 py-0.5 bg-orange-100 text-primary-800 text-[11px] font-bold rounded-full border border-orange-200">
                    Job Provider
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                  <span className="flex items-center gap-1 font-semibold text-amber-600">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    {profile?.rating || 5.0} Rating
                  </span>
                  {age && <span>• {age} yrs</span>}
                  {gender && <span>• {gender}</span>}
                </div>
              </div>
            </div>

            <div>
              {isEditing ? (
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5"
                >
                  <X className="w-4 h-4" />
                  <span>Cancel</span>
                </button>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold rounded-xl shadow-md transition-all flex items-center gap-1.5"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Edit Profile</span>
                </button>
              )}
            </div>
          </div>

          {/* Job Activity Summary Badges (Posted Jobs & Completed Jobs) */}
          <div className="grid grid-cols-2 gap-4 py-6 border-b">
            <div className="p-4 bg-orange-50/70 border border-orange-100 rounded-2xl flex items-center gap-3">
              <div className="p-2.5 bg-white rounded-xl text-primary-600 shadow-2xs">
                <Briefcase className="w-5 h-5" />

              </div>
              <div>
                <span className="text-2xl font-black text-slate-900 block leading-tight">{jobCounts.posted}</span>
                <span className="text-xs text-slate-500 font-medium">Jobs Posted</span>
              </div>
            </div>

            <div className="p-4 bg-emerald-50/70 border border-emerald-100 rounded-2xl flex items-center gap-3">
              <div className="p-2.5 bg-white rounded-xl text-emerald-600 shadow-2xs">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <span className="text-2xl font-black text-slate-900 block leading-tight">{jobCounts.completed}</span>
                <span className="text-xs text-slate-500 font-medium">Jobs Completed</span>
              </div>
            </div>
          </div>

          {/* Editable Form vs Read-Only Details */}
          {isEditing ? (
            <form onSubmit={handleSave} className="space-y-4 pt-6">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Age</label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Address / Area
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="pt-6 space-y-4 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Contact Phone
                  </span>
                  <div className="flex items-center gap-2 text-slate-800 font-medium">
                    <Phone className="w-4 h-4 text-primary-600" />
                    <span>{profile?.phone || 'Not provided'}</span>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Primary Address
                  </span>
                  <div className="flex items-center gap-2 text-slate-800 font-medium">
                    <MapPin className="w-4 h-4 text-primary-600" />
                    <span>{profile?.address || 'Mumbai, Maharashtra'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default Profile;


