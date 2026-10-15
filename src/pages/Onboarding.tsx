import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { profilesService } from '../services/profiles';
import { parseProfileMeta, formatProfileMeta, isProfileComplete } from '../utils/profileMeta';
import { searchLocationSuggestions, type LocationSuggestion, resolveLocation, reverseGeocode } from '../utils/locations';
import { Loading } from '../components/Loading';
import {
  MapPin,
  Briefcase,
  UserCheck,
  Loader2,
  Check,
  AlertCircle,
  HeartPulse,
  Wrench,
  Navigation,
  Search,
  CheckCircle2,
  X,
} from 'lucide-react';
import { BackButton } from '../components/BackButton';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [bioNote, setBioNote] = useState('');

  const [skills, setSkills] = useState<string[]>([]);
  const [hazardsAvoided, setHazardsAvoided] = useState<string[]>([]);
  const [maxDistanceKm, setMaxDistanceKm] = useState<number>(20);

  // Location handling (Current GPS vs Manual with autocomplete popup)
  const [locationMode, setLocationMode] = useState<'current' | 'manual'>('current');
  const [lat, setLat] = useState<number>(19.076);
  const [lng, setLng] = useState<number>(72.8777);
  const [locationStatus, setLocationStatus] = useState<string>('');
  const [manualQuery, setManualQuery] = useState('');
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [selectedLocationLabel, setSelectedLocationLabel] = useState('');

  const suggestionsRef = useRef<HTMLDivElement>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // 1. If user has ALREADY completed profile setup, bypass onboarding immediately!
  useEffect(() => {
    if (!authLoading && profile && isProfileComplete(profile)) {
      const roleHome = profile.role === 'job_provider' ? '/job-provider' : '/service-provider';
      navigate(roleHome, { replace: true });
    }
  }, [profile, authLoading, navigate]);

  // Prepopulate form if existing profile fields exist
  useEffect(() => {
    if (profile) {
      if (profile.full_name) setFullName(profile.full_name);
      if (profile.phone) setPhone(profile.phone);
      if (profile.address) {
        setAddress(profile.address);
        setManualQuery(profile.address);
        setSelectedLocationLabel(profile.address);
      }
      if (profile.skills && profile.skills.length > 0) setSkills(profile.skills);
      if (profile.hazards_avoided && profile.hazards_avoided.length > 0) {
        setHazardsAvoided(profile.hazards_avoided);
      }
      if (profile.max_distance_km) setMaxDistanceKm(profile.max_distance_km);
      if (profile.lat) setLat(profile.lat);
      if (profile.lng) setLng(profile.lng);

      const parsedMeta = parseProfileMeta(profile.bio);
      if (parsedMeta.age) setAge(parsedMeta.age);
      if (parsedMeta.gender) setGender(parsedMeta.gender);
      if (parsedMeta.note) setBioNote(parsedMeta.note);
    }
  }, [profile]);

  // Close suggestions dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (authLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  const signupRole = (location.state as { role?: 'job_provider' | 'service_provider' } | null)?.role;
  const role = profile?.role ?? signupRole ?? 'service_provider';

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

  // Option 1: Detect Current Location via Geolocation API
  const handleDetectCurrentLocation = () => {
    setLocationMode('current');
    if (!navigator.geolocation) {
      setLocationStatus('Geolocation is not supported by your browser. Please choose Manual Location.');
      return;
    }

    setIsDetectingLocation(true);
    setLocationStatus('Detecting your GPS location...');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const detectedLat = Math.round(position.coords.latitude * 10000) / 10000;
        const detectedLng = Math.round(position.coords.longitude * 10000) / 10000;
        setLat(detectedLat);
        setLng(detectedLng);

        setLocationStatus('Finding your area address...');
        const resolvedPlace = await reverseGeocode(detectedLat, detectedLng);
        setSelectedLocationLabel(resolvedPlace);
        setAddress(resolvedPlace);
        setIsDetectingLocation(false);
        setLocationStatus('Current location detected successfully!');
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setIsDetectingLocation(false);
        setLocationStatus('Could not access GPS. Please choose Manual Location.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Option 2: Search Manual Location (Instant Autocomplete as user types)
  const handleManualSearchChange = (query: string) => {
    setManualQuery(query);
    setLocationStatus('');

    if (query.trim().length > 0) {
      const results = searchLocationSuggestions(query, 6);
      setSuggestions(results);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSelectSuggestion = (suggestion: LocationSuggestion) => {
    setLat(suggestion.lat);
    setLng(suggestion.lng);
    setManualQuery(suggestion.name);
    setAddress(suggestion.name);
    setSelectedLocationLabel(suggestion.name);
    setShowSuggestions(false);
    setLocationStatus(`Selected: ${suggestion.name}`);
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

    if (!phone.trim() || phone.trim().length < 8) {
      setError('Please enter a valid phone number (at least 8 digits).');
      return;
    }

    const finalAddress = address.trim() || selectedLocationLabel.trim() || manualQuery.trim();
    if (!finalAddress) {
      setError('Please select or enter your location.');
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
      // Mark onboarding as completed in metadata
      const combinedBio = formatProfileMeta(age, gender, bioNote, true);

      // Save to localStorage so it is never shown again on this device/user
      if (typeof window !== 'undefined') {
        localStorage.setItem(`kaamsathi_onboarding_completed_${user.id}`, 'true');
      }

      // Check if lat/lng should be auto-resolved from address if user typed manually
      let finalLat = lat;
      let finalLng = lng;
      if (locationMode === 'manual' && finalAddress) {
        const resolved = resolveLocation(finalAddress);
        if (resolved) {
          finalLat = resolved.lat;
          finalLng = resolved.lng;
        }
      }

      await profilesService.updateProfile(user.id, {
        full_name: fullName.trim(),
        phone: phone.trim(),
        address: finalAddress,
        bio: combinedBio,
        skills: role === 'service_provider' ? skills : [],
        hazards_avoided: role === 'service_provider' ? hazardsAvoided : [],
        max_distance_km: role === 'service_provider' ? maxDistanceKm : 20,
        lat: finalLat,
        lng: finalLng,
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
      <div className="max-w-2xl mx-auto bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-card relative">
        <div className="absolute top-4 left-4 sm:top-6 sm:left-6">
          <BackButton />
        </div>

        {/* Title Header */}
        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-100 border border-orange-200 text-primary-800 text-xs font-bold rounded-full mb-3">
            {role === 'job_provider' ? (
              <Briefcase className="w-3.5 h-3.5 text-primary-600" />
            ) : (
              <UserCheck className="w-3.5 h-3.5 text-primary-600" />
            )}
            <span>
              {role === 'job_provider' ? t('jobProviderOnboarding') : t('workerOnboarding')}
            </span>
          </span>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {t('completeProfile')}
          </h1>
          <p className="mt-2 text-sm text-slate-500 max-w-md mx-auto">
            {role === 'job_provider'
              ? t('providerOnboardingDescription')
              : t('workerOnboardingDescription')}
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
              {t('basicInformation')}
            </h2>

            {/* Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t('fullName')} <span className="text-red-500">*</span>
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
                  {t('age')} <span className="text-red-500">*</span>
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
                  {t('gender')} <span className="text-red-500">*</span>
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

            {/* Phone */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t('phoneNumber')} <span className="text-red-500">*</span>
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

            {/* LOCATION SELECTOR: 2 Options (Use Current Location or Manual Location with Instant Suggestions) */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-slate-700">
                  {t('location', 'Location')} <span className="text-red-500">*</span>
                </label>
                <span className="text-[11px] text-slate-500">Choose preferred method</span>
              </div>

              {/* 2-Option Tabs: Current Location vs Manual Location */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl mb-3">
                <button
                  type="button"
                  onClick={() => {
                    setLocationMode('current');
                    handleDetectCurrentLocation();
                  }}
                  className={`flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold rounded-lg transition-all ${
                    locationMode === 'current'
                      ? 'bg-white text-primary-700 shadow-sm border border-orange-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Navigation className="w-3.5 h-3.5 text-primary-600" />
                  <span>Use Current Location</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setLocationMode('manual');
                    setShowSuggestions(Boolean(manualQuery.trim()));
                  }}
                  className={`flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold rounded-lg transition-all ${
                    locationMode === 'manual'
                      ? 'bg-white text-primary-700 shadow-sm border border-orange-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Search className="w-3.5 h-3.5 text-primary-600" />
                  <span>Manual Location</span>
                </button>
              </div>

              {/* OPTION 1: Current Location Display */}
              {locationMode === 'current' && (
                <div className="p-4 bg-orange-50/70 border border-orange-100 rounded-2xl">
                  {isDetectingLocation ? (
                    <div className="flex items-center gap-3 text-xs text-primary-800 font-semibold py-1">
                      <Loader2 className="w-4 h-4 animate-spin text-primary-600" />
                      <span>Detecting your real-world locality and address via GPS...</span>
                    </div>
                  ) : selectedLocationLabel || address ? (
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900">
                              {selectedLocationLabel || address}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full">
                              GPS Active
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Real-time location linked for nearby job recommendations.
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleDetectCurrentLocation}
                        className="text-xs font-semibold text-primary-600 hover:text-primary-700 hover:underline shrink-0"
                      >
                        Re-detect
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-orange-100 text-primary-700 flex items-center justify-center shrink-0">
                          <MapPin className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">
                            Allow Location Access
                          </h4>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Tap below to automatically detect your neighbourhood.
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleDetectCurrentLocation}
                        className="px-3.5 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
                      >
                        Detect Location
                      </button>
                    </div>
                  )}

                  {locationStatus && !isDetectingLocation && (
                    <p className="text-[11px] font-medium text-emerald-700 mt-2 border-t border-orange-100/60 pt-1.5 flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{locationStatus}</span>
                    </p>
                  )}
                </div>
              )}

              {/* OPTION 2: Manual Location with Instant Typing Suggestions Dropdown */}
              {locationMode === 'manual' && (
                <div className="relative" ref={suggestionsRef}>
                  <div className="relative">
                    <input
                      type="text"
                      value={manualQuery}
                      onChange={(e) => handleManualSearchChange(e.target.value)}
                      onFocus={() => {
                        if (manualQuery.trim().length > 0) {
                          setShowSuggestions(true);
                        }
                      }}
                      placeholder="Start typing your area or city (e.g. Malviya Nagar, Andheri East, Saket)..."
                      className="w-full h-11 pl-10 pr-9 bg-slate-50 focus:bg-white border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent rounded-xl text-sm text-slate-900 placeholder:text-slate-400 transition-all"
                    />
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />

                    {manualQuery && (
                      <button
                        type="button"
                        onClick={() => {
                          setManualQuery('');
                          setSuggestions([]);
                          setShowSuggestions(false);
                        }}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 p-0.5"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Suggestions Popover / Dropdown */}
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute z-30 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden divide-y divide-slate-100 animate-in fade-in-50 slide-in-from-top-1 duration-150">
                      <div className="px-3.5 py-1.5 bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Matching Areas & Localities
                      </div>
                      {suggestions.map((item) => (
                        <button
                          key={item.name}
                          type="button"
                          onClick={() => handleSelectSuggestion(item)}
                          className="w-full px-4 py-2.5 text-left hover:bg-orange-50/80 transition-colors flex items-center justify-between group"
                        >
                          <div className="flex items-center gap-2.5">
                            <MapPin className="w-4 h-4 text-primary-600 shrink-0 group-hover:scale-110 transition-transform" />
                            <div>
                              <div className="text-xs font-semibold text-slate-900">
                                {item.name}
                              </div>
                              {item.subtitle && (
                                <div className="text-[11px] text-slate-500">
                                  {item.subtitle}
                                </div>
                              )}
                            </div>
                          </div>
                          <span className="text-[11px] font-semibold text-primary-600 opacity-0 group-hover:opacity-100 transition-opacity">
                            Select →
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Selected indicator */}
                  {selectedLocationLabel && (
                    <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Location set to: <strong>{selectedLocationLabel}</strong></span>
                    </div>
                  )}

                  {locationStatus && !selectedLocationLabel && (
                    <p className="text-[11px] font-medium text-primary-700 mt-1.5">
                      {locationStatus}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Service Worker Role Specific Fields */}
          {role === 'service_provider' && (
            <>
              {/* Skills Multi-Select Pill Buttons */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between border-b pb-2">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Wrench className="w-4 h-4 text-primary-600" />
                    2. What work can you do? <span className="text-red-500">*</span>
                  </h2>
                  <span className="text-xs text-slate-500 font-medium">
                    Selected ({skills.length})
                  </span>
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
              <div className="space-y-3 pt-2">
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
              <div className="space-y-2 bg-slate-50 p-4 border border-slate-200 rounded-2xl pt-2">
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
                <span>{t('savingProfile')}</span>
              </>
            ) : (
              <span>{t('completeSetup')}</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Onboarding;
