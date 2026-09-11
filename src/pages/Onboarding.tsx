import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { profilesService } from '../services/profiles';
import { parseProfileMeta, formatProfileMeta } from '../utils/profileMeta';
import { Loading } from '../components/Loading';
import { MapPin, Briefcase, UserCheck, Loader2, Check, AlertCircle, HeartPulse, Wrench } from 'lucide-react';

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

export const Onboarding: React.FC = () => {
  const { user, profile, loading: authLoading, refreshProfile } = useAuth();
  const navigate = useNavigate();

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
  const [locationStatus, setLocationStatus] = useState<string>('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (profile) {
      if (profile.full_name) setFullName(profile.full_name);
      if (profile.phone) setPhone(profile.phone);
      if (profile.address) setAddress(profile.address);
      if (profile.skills && profile.skills.length > 0) setSkills(profile.skills);
      if (profile.hazards_avoided && profile.hazards_avoided.length > 0) setHazardsAvoided(profile.hazards_avoided);
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

  const role = profile?.role || 'service_provider';

  const toggleSkill = (skill: string) => {
    setSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const toggleAccessibilityPref = (item: string) => {
    setHazardsAvoided((prev) =>
      prev.includes(item) ? prev.filter((h) => h !== item) : [...prev, item]
    );
  };

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('Geolocation is not supported by your browser.');
      return;
    }
    setLocationStatus('Detecting location...');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLat(Math.round(position.coords.latitude * 10000) / 10000);
        setLng(Math.round(position.coords.longitude * 10000) / 10000);
        setLocationStatus('Location updated successfully!');
      },
      (err) => {
        console.error('Geolocation error:', err);
        setLocationStatus('Using default city coordinates (Mumbai).');
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validations: name, age, gender, address, phone
    if (!fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }

    if (!age || isNaN(Number(age)) || Number(age) < 14 || Number(age) > 100) {
      setError('Please enter a valid age (between 14 and 100).');
      return;
    }

    if (!gender) {
      setError('Please select your gender.');
      return;
    }

    if (!address.trim()) {
      setError('Please enter your address.');
      return;
    }

    if (!phone.trim() || phone.trim().length < 8) {
      setError('Please enter a valid phone number (at least 8 digits).');
      return;
    }

    if (role === 'service_provider' && skills.length === 0) {
      setError('Please select at least one work skill.');
      return;
    }

    if (!user) {
      setError('Session expired. Please log in again.');
      return;
    }

    setSubmitting(true);

    try {
      const combinedBio = formatProfileMeta(age, gender, bioNote);

      await profilesService.updateProfile(user.id, {
        full_name: fullName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        bio: combinedBio,
        skills: role === 'service_provider' ? skills : [],
        hazards_avoided: role === 'service_provider' ? hazardsAvoided : [],
        max_distance_km: role === 'service_provider' ? maxDistanceKm : 20,
        lat,
        lng,
      });

      await refreshProfile();

      if (role === 'job_provider') {
        navigate('/job-provider', { replace: true });
      } else {
        navigate('/service-provider', { replace: true });
      }
    } catch (err: unknown) {
      console.error('Onboarding save error:', err);
      setError(err instanceof Error ? err.message : 'Failed to save profile details.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] py-8 px-4 sm:px-6 bg-slate-50 pb-24 md:pb-8">
      <div className="max-w-2xl mx-auto bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-card">
        
        {/* Title Header */}
        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-100 border border-orange-200 text-primary-800 text-xs font-bold rounded-full mb-3">
            {role === 'job_provider' ? <Briefcase className="w-3.5 h-3.5 text-primary-600" /> : <UserCheck className="w-3.5 h-3.5 text-primary-600" />}
            <span>{role === 'job_provider' ? 'Job Provider Onboarding' : 'Worker Onboarding'}</span>
          </span>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Complete Profile Setup
          </h1>
          <p className="mt-2 text-sm text-slate-500 max-w-md mx-auto">
            {role === 'job_provider'
              ? 'Provide your details to start posting and hiring local workers.'
              : 'Add your skills and work preferences for instant AI job matching.'}
          </p>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Section 1: Basic Information */}
          <div className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b pb-2">
              1. Basic Information
            </h2>

            {/* Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Ramesh Kumar"
                disabled={submitting}
                className="w-full h-11 px-3.5 bg-slate-50 focus:bg-white border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent rounded-xl text-sm text-slate-900 transition-all"
              />
            </div>

            {/* Age & Gender */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Age <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="14"
                  max="100"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="e.g. 28"
                  disabled={submitting}
                  className="w-full h-11 px-3.5 bg-slate-50 focus:bg-white border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent rounded-xl text-sm text-slate-900 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Gender <span className="text-red-500">*</span>
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  disabled={submitting}
                  className="w-full h-11 px-3.5 bg-slate-50 focus:bg-white border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent rounded-xl text-sm text-slate-900 transition-all"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Phone & Address */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  disabled={submitting}
                  className="w-full h-11 px-3.5 bg-slate-50 focus:bg-white border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent rounded-xl text-sm text-slate-900 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Address / City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Andheri East, Mumbai"
                  disabled={submitting}
                  className="w-full h-11 px-3.5 bg-slate-50 focus:bg-white border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent rounded-xl text-sm text-slate-900 transition-all"
                />
              </div>
            </div>

          </div>

          {/* Location GPS Pin Section */}
          <div className="space-y-3 bg-orange-50/60 p-4 border border-orange-100 rounded-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary-600" />
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Location Coordinates (MVP)
                </span>
              </div>

              <button
                type="button"
                onClick={detectLocation}
                className="px-3 py-1.5 bg-white border border-orange-200 text-primary-700 hover:bg-orange-100 text-xs font-semibold rounded-lg shadow-sm transition-all"
              >
                Use My Location
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block mb-0.5">Latitude</span>
                <input
                  type="number"
                  step="0.0001"
                  value={lat}
                  onChange={(e) => setLat(parseFloat(e.target.value) || 0)}
                  className="w-full h-9 px-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 text-xs"
                />
              </div>

              <div>
                <span className="text-slate-500 block mb-0.5">Longitude</span>
                <input
                  type="number"
                  step="0.0001"
                  value={lng}
                  onChange={(e) => setLng(parseFloat(e.target.value) || 0)}
                  className="w-full h-9 px-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 text-xs"
                />
              </div>
            </div>

            {locationStatus && (
              <p className="text-[11px] font-medium text-primary-700 mt-1">{locationStatus}</p>
            )}
          </div>

          {/* Section 2: Service Worker Role Specific Fields */}
          {role === 'service_provider' && (
            <>
              {/* Skills Multi-Select Pill Buttons */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b pb-2">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Wrench className="w-4 h-4 text-primary-600" />
                    2. What work can you do? <span className="text-red-500">*</span>
                  </h2>
                  <span className="text-xs text-slate-500 font-medium">Selected ({skills.length})</span>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {SPEC_SKILLS.map((skill) => {
                    const isSelected = skills.includes(skill);
                    return (
                      <button
                        type="button"
                        key={skill}
                        onClick={() => toggleSkill(skill)}
                        className={`px-4 py-2 text-xs font-semibold rounded-full border transition-all flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
                            : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400 hover:bg-slate-50'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                        <span>{skill}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Work & Accessibility Preferences Section */}
              <div className="space-y-3">
                <div className="border-b pb-2">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <HeartPulse className="w-4 h-4 text-primary-600" />
                    3. Work & Accessibility Preferences
                  </h2>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Let us know if any of these apply so we can avoid showing you unsuitable work.
                  </p>
                </div>

                <div className="space-y-2 pt-1">
                  {ACCESSIBILITY_PREFERENCES.map((pref) => {
                    const isChecked = hazardsAvoided.includes(pref);
                    return (
                      <div
                        key={pref}
                        onClick={() => toggleAccessibilityPref(pref)}
                        className={`flex items-center justify-between p-3.5 rounded-xl border text-xs font-medium cursor-pointer transition-all ${
                          isChecked
                            ? 'bg-orange-50 border-orange-200 text-primary-900 shadow-2xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                              isChecked
                                ? 'bg-primary-600 border-primary-600 text-white'
                                : 'bg-white border-slate-300'
                            }`}
                          >
                            {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                          <span className="text-sm font-medium">{pref}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Travel Radius Slider */}
              <div className="space-y-2 bg-slate-50 p-4 border border-slate-200 rounded-2xl">
                <div className="flex justify-between items-center text-xs font-semibold text-slate-700">
                  <span>Max Preferred Work Distance</span>
                  <span className="px-2.5 py-1 bg-primary-100 text-primary-800 rounded-lg text-xs font-bold">
                    {maxDistanceKm} km
                  </span>
                </div>
                <input
                  type="range"
                  min={2}
                  max={50}
                  step={1}
                  value={maxDistanceKm}
                  onChange={(e) => setMaxDistanceKm(parseInt(e.target.value, 10))}
                  className="w-full accent-primary-600 cursor-pointer"
                />
              </div>
            </>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full h-12 mt-6 bg-primary-600 hover:bg-primary-700 active:scale-[0.99] disabled:opacity-60 text-white font-bold text-base rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Saving Profile...</span>
              </>
            ) : (
              <span>Complete Setup & Go to Home →</span>
            )}
          </button>

        </form>

      </div>
    </div>
  );
};

export default Onboarding;


