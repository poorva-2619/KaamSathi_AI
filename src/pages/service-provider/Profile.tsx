import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { profilesService } from '../../services/profiles';
import { parseProfileMeta, formatProfileMeta } from '../../utils/profileMeta';
import { Loading } from '../../components/Loading';
import {
  MapPin,
  Phone,
  Edit3,
  Save,
  X,
  Star,
  CheckCircle,
  Loader2,
  Wrench,
  HeartPulse,
  Check,
} from 'lucide-react';

const SPEC_SKILLS = [
  'House Cleaning',
  'Cooking',
  'Construction',
  'Delivery',
  'Driving',
  'Gardening',
  'Plumbing',
  'Electrical Work',
  'Painting',
  'General Labour',
];

const ACCESSIBILITY_PREFERENCES = [
  'Back pain / body pain',
  'Cold / cough',
  'Breathing issue',
  'Injury',
  'Pregnancy',
  'Menstrual issues',
  'Physically disabled',
];

export const Profile: React.FC = () => {
  const { user, profile, loading: authLoading, refreshProfile } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [bioNote, setBioNote] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [hazardsAvoided, setHazardsAvoided] = useState<string[]>([]);
  const [maxDistanceKm, setMaxDistanceKm] = useState<number>(20);
  const [lat, setLat] = useState<number>(19.076);
  const [lng, setLng] = useState<number>(72.8777);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setPhone(profile.phone || '');
      setAddress(profile.address || '');
      if (profile.skills) setSkills(profile.skills);
      if (profile.hazards_avoided) setHazardsAvoided(profile.hazards_avoided);
      if (profile.max_distance_km) setMaxDistanceKm(profile.max_distance_km);
      if (profile.lat) setLat(profile.lat);
      if (profile.lng) setLng(profile.lng);

      const parsedMeta = parseProfileMeta(profile.bio);
      if (parsedMeta.age) setAge(parsedMeta.age);
      if (parsedMeta.gender) setGender(parsedMeta.gender);
      if (parsedMeta.note) setBioNote(parsedMeta.note);
    }
  }, [profile]);

  if (authLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  const toggleSkill = (skill: string) => {
    setSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const toggleAccessibilityPref = (pref: string) => {
    setHazardsAvoided((prev) =>
      prev.includes(pref) ? prev.filter((h) => h !== pref) : [...prev, pref]
    );
  };

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
        skills,
        hazards_avoided: hazardsAvoided,
        max_distance_km: maxDistanceKm,
        lat,
        lng,
      });

      await refreshProfile();
      setIsEditing(false);
      setMessage('Worker profile updated successfully!');
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

        {/* Success Alert */}
        {message && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-xs text-emerald-800 font-semibold shadow-sm">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-orange-600 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : 'W'}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                    {profile?.full_name || 'Service Worker'}
                  </h1>
                  <span className="px-2.5 py-0.5 bg-orange-100 text-primary-800 text-[11px] font-bold rounded-full border border-orange-200">
                    Service Worker
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                  <span className="flex items-center gap-1 font-semibold text-amber-600">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    {profile?.rating || 5.0} Rating
                  </span>
                  {age && <span>• {age} yrs</span>}
                  {gender && <span>• {gender}</span>}
                  <span>• Radius: {profile?.max_distance_km || 20} km</span>
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

          {/* Form or Read-Only Mode */}
          {isEditing ? (
            <form onSubmit={handleSave} className="space-y-5 pt-6">
              
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
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
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Address / City</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Skills Multi-Select Pill Buttons */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  What work can you do? ({skills.length} selected)
                </label>
                <div className="flex flex-wrap gap-2">
                  {SPEC_SKILLS.map((skill) => {
                    const sel = skills.includes(skill);
                    return (
                      <button
                        type="button"
                        key={skill}
                        onClick={() => toggleSkill(skill)}
                        className={`px-4 py-2 text-xs font-semibold rounded-full border flex items-center gap-1.5 transition-all ${
                          sel
                            ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
                            : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400 hover:bg-slate-50'
                        }`}
                      >
                        {sel && <Check className="w-3.5 h-3.5" />}
                        <span>{skill}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Work & Accessibility Preferences Checkboxes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Work & Accessibility Preferences
                </label>
                <p className="text-xs text-slate-500 mb-2">
                  Let us know if any of these apply so we can avoid showing you unsuitable work.
                </p>
                <div className="space-y-2">
                  {ACCESSIBILITY_PREFERENCES.map((pref) => {
                    const checked = hazardsAvoided.includes(pref);
                    return (
                      <div
                        key={pref}
                        onClick={() => toggleAccessibilityPref(pref)}
                        className={`flex items-center justify-between p-3 rounded-xl border text-xs font-medium cursor-pointer transition-all ${
                          checked
                            ? 'bg-orange-50 border-orange-200 text-primary-900 shadow-2xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                              checked
                                ? 'bg-primary-600 border-primary-600 text-white'
                                : 'bg-white border-slate-300'
                            }`}
                          >
                            {checked && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <span>{pref}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Radius Slider */}
              <div className="space-y-1 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <span>Max Preferred Work Distance</span>
                  <span className="text-primary-700 font-bold">{maxDistanceKm} km</span>
                </div>
                <input
                  type="range"
                  min={2}
                  max={50}
                  value={maxDistanceKm}
                  onChange={(e) => setMaxDistanceKm(parseInt(e.target.value, 10))}
                  className="w-full accent-primary-600 cursor-pointer"
                />
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
            <div className="pt-6 space-y-5 text-sm">
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
                    Location Address
                  </span>
                  <div className="flex items-center gap-2 text-slate-800 font-medium">
                    <MapPin className="w-4 h-4 text-primary-600" />
                    <span>{profile?.address || 'Mumbai, Maharashtra'}</span>
                  </div>
                </div>
              </div>

              {/* Skills Chips */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2 flex items-center gap-1">
                  <Wrench className="w-3.5 h-3.5 text-primary-600" />
                  Skills & Work Types
                </span>
                {profile?.skills && profile.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {profile.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-3.5 py-1 bg-white text-slate-800 border border-slate-200 text-xs font-semibold rounded-full shadow-2xs"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No skills listed yet.</p>
                )}
              </div>

              {/* Work & Accessibility Preferences Chips */}
              <div className="p-4 bg-orange-50/60 rounded-2xl border border-orange-100">
                <span className="text-xs font-bold text-primary-900 uppercase tracking-wider block mb-2 flex items-center gap-1">
                  <HeartPulse className="w-3.5 h-3.5 text-primary-600" />
                  Work & Accessibility Preferences
                </span>
                {profile?.hazards_avoided && profile.hazards_avoided.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {profile.hazards_avoided.map((item) => (
                      <span
                        key={item}
                        className="px-3.5 py-1 bg-white text-primary-900 border border-orange-200 text-xs font-medium rounded-full shadow-2xs"
                      >
                        ✓ {item}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">No accessibility preferences recorded.</p>
                )}
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default Profile;


