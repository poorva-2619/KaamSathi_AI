"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import Loading from "@/components/Loading";
import { getSession } from "@/services/auth";
import { getProfile, updateProfile, Profile } from "@/services/profiles";
import { Loader2, User, Building2, Phone, MapPin, Briefcase, CheckCircle } from "lucide-react";

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleParam = searchParams?.get("role");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  // Form fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [area, setArea] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [skills, setSkills] = useState("");

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadUser() {
      const { data } = await getSession();
      if (data?.session?.user) {
        const uid = data.session.user.id;
        setUserId(uid);
        const { data: prof } = await getProfile(uid);
        if (prof) {
          setProfile(prof);
          if (prof.name) setName(prof.name);
          if (prof.phone) setPhone(prof.phone);
          if (prof.area) setArea(prof.area);
          if (prof.company_name) setCompanyName(prof.company_name);
          if (prof.skills) setSkills(prof.skills.join(", "));
        }
      }
      setLoading(false);
    }
    loadUser();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }

    if (!userId) return;

    setSaving(true);
    setError(null);

    try {
      const isJobProvider = (profile?.role || roleParam) === "job_provider" || (profile?.role || roleParam) === "employer";
      
      const updates: any = {
        name: name.trim(),
        phone: phone.trim() || null,
        area: area.trim() || null,
      };

      if (isJobProvider) {
        updates.company_name = companyName.trim() || null;
      } else {
        updates.skills = skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      }

      const { error: updateError } = await updateProfile(userId, updates);

      if (updateError) {
        setError(updateError.message);
        setSaving(false);
        return;
      }

      // Success -> Redirect to /home
      router.push("/home");
    } catch (err: any) {
      setError(err?.message || "Failed to update profile.");
      setSaving(false);
    }
  };

  if (loading) {
    return <Loading message="Preparing your onboarding profile..." />;
  }

  const isJobProvider = (profile?.role || roleParam) === "job_provider" || (profile?.role || roleParam) === "employer";

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl shadow-slate-200/70 border border-slate-200/80 p-6 sm:p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 mb-1">
            {isJobProvider ? <Building2 className="w-6 h-6" /> : <User className="w-6 h-6" />}
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Complete Your Profile
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            {isJobProvider
              ? "Set up your hiring profile to start posting jobs and reviewing applicants."
              : "Tell employers about your skills and location to get relevant job recommendations."}
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ramesh Kumar / Ananya Sharma"
              className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 bg-slate-50/50 focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all outline-none"
            />
          </div>

          {isJobProvider ? (
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Company / Organization Name
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Om Logistics / Apex Services"
                className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 bg-slate-50/50 focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all outline-none"
              />
            </div>
          ) : (
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Skills / Trade (comma-separated)
              </label>
              <input
                type="text"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="e.g. Construction, Masonry, Driver, Electrician"
                className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 bg-slate-50/50 focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all outline-none"
              />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 9876543210"
                className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 bg-slate-50/50 focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Location / City
              </label>
              <input
                type="text"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="e.g. Okhla, New Delhi"
                className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 bg-slate-50/50 focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full min-h-[44px] mt-2 py-3 px-4 rounded-xl bg-orange-600 hover:bg-orange-700 active:scale-[0.99] text-white font-bold text-sm shadow-md shadow-orange-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Saving Profile...</span>
              </>
            ) : (
              <span>Save & Continue</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <ProtectedRoute>
      <Suspense fallback={<Loading message="Loading onboarding..." />}>
        <OnboardingContent />
      </Suspense>
    </ProtectedRoute>
  );
}
