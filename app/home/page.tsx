"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import Loading from "@/components/Loading";
import { getSession, signOut } from "@/services/auth";
import { getProfile, Profile } from "@/services/profiles";
import { 
  Briefcase, 
  UserCheck, 
  LogOut, 
  PlusCircle, 
  Search, 
  FileText, 
  HeartPulse, 
  Building2, 
  User, 
  MapPin, 
  Phone,
  ShieldCheck
} from "lucide-react";

function HomeContent() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    async function loadData() {
      const { data } = await getSession();
      if (data?.session?.user) {
        setUserEmail(data.session.user.email || "");
        const { data: prof } = await getProfile(data.session.user.id);
        if (!prof || prof.name == null) {
          router.replace("/onboarding");
          return;
        }
        setProfile(prof);
      }
      setLoading(false);
    }
    loadData();
  }, [router]);

  const handleLogout = async () => {
    setLoggingOut(true);
    await signOut();
    router.push("/");
  };

  if (loading) {
    return <Loading message="Loading your dashboard..." />;
  }

  const isJobProvider = profile?.role === "job_provider" || profile?.role === "employer";

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-white/20 backdrop-blur text-white">
            {isJobProvider ? <Building2 className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
            <span>{isJobProvider ? "Job Provider Portal" : "Service Provider Portal"}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">
            Welcome, {profile?.name || "Member"}!
          </h1>
          <p className="text-sm text-orange-100 max-w-xl">
            {isJobProvider
              ? "Manage your job listings, hire skilled workers, and review applicants effortlessly."
              : "Explore verified jobs, apply with one click, and access health & social security schemes."}
          </p>
        </div>

        {/* Quick Logout Button */}
        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-slate-900 hover:bg-orange-50 font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50"
        >
          <LogOut className="w-4 h-4 text-orange-600" />
          <span>{loggingOut ? "Signing Out..." : "Log Out"}</span>
        </button>
      </div>

      {/* Main Actions Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
        {isJobProvider ? (
          <>
            <Link
              href="/employer/post"
              className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-orange-500 hover:shadow-lg transition-all group flex flex-col justify-between space-y-4"
            >
              <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <PlusCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900 group-hover:text-orange-600 transition-colors">
                  Post a New Job
                </h3>
                <p className="text-xs text-slate-500">
                  Publish openings with AI salary suggestions and candidate matching.
                </p>
              </div>
              <span className="text-xs font-bold text-orange-600 flex items-center gap-1">
                Create Listing &rarr;
              </span>
            </Link>

            <Link
              href="/employer"
              className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-orange-500 hover:shadow-lg transition-all group flex flex-col justify-between space-y-4"
            >
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Briefcase className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900 group-hover:text-orange-600 transition-colors">
                  Employer Dashboard
                </h3>
                <p className="text-xs text-slate-500">
                  View active jobs, candidate submissions, and hire workers.
                </p>
              </div>
              <span className="text-xs font-bold text-orange-600 flex items-center gap-1">
                View Dashboard &rarr;
              </span>
            </Link>

            <Link
              href="/onboarding"
              className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-orange-500 hover:shadow-lg transition-all group flex flex-col justify-between space-y-4"
            >
              <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Building2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900 group-hover:text-orange-600 transition-colors">
                  Company Profile
                </h3>
                <p className="text-xs text-slate-500">
                  Update your contact details, enterprise name, and hiring location.
                </p>
              </div>
              <span className="text-xs font-bold text-orange-600 flex items-center gap-1">
                Edit Profile &rarr;
              </span>
            </Link>
          </>
        ) : (
          <>
            <Link
              href="/jobs"
              className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-orange-500 hover:shadow-lg transition-all group flex flex-col justify-between space-y-4"
            >
              <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Search className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900 group-hover:text-orange-600 transition-colors">
                  Browse Jobs
                </h3>
                <p className="text-xs text-slate-500">
                  Discover openings matching your skills, document checklist, and health needs.
                </p>
              </div>
              <span className="text-xs font-bold text-orange-600 flex items-center gap-1">
                Explore Jobs &rarr;
              </span>
            </Link>

            <Link
              href="/applications"
              className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-orange-500 hover:shadow-lg transition-all group flex flex-col justify-between space-y-4"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <FileText className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900 group-hover:text-orange-600 transition-colors">
                  My Applications
                </h3>
                <p className="text-xs text-slate-500">
                  Track the status of your submitted job applications.
                </p>
              </div>
              <span className="text-xs font-bold text-orange-600 flex items-center gap-1">
                Track Applications &rarr;
              </span>
            </Link>

            <Link
              href="/health"
              className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-orange-500 hover:shadow-lg transition-all group flex flex-col justify-between space-y-4"
            >
              <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <HeartPulse className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900 group-hover:text-orange-600 transition-colors">
                  Health & Welfare
                </h3>
                <p className="text-xs text-slate-500">
                  Access bilingual AI health triage and nearby Ayushman Bharat / ESIC facilities.
                </p>
              </div>
              <span className="text-xs font-bold text-orange-600 flex items-center gap-1">
                Check Health Support &rarr;
              </span>
            </Link>
          </>
        )}
      </div>

      {/* Profile Card */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
          Account Details
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
            <span className="text-slate-400 block font-semibold">EMAIL</span>
            <span className="text-slate-900 font-bold truncate block">{userEmail}</span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
            <span className="text-slate-400 block font-semibold">ROLE</span>
            <span className="text-slate-900 font-bold capitalize">
              {profile?.role?.replace("_", " ") || "Member"}
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
            <span className="text-slate-400 block font-semibold">
              {isJobProvider ? "ORGANIZATION" : "SKILLS"}
            </span>
            <span className="text-slate-900 font-bold truncate block">
              {isJobProvider
                ? profile?.company_name || "Not specified"
                : profile?.skills?.join(", ") || "General"}
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
            <span className="text-slate-400 block font-semibold">LOCATION</span>
            <span className="text-slate-900 font-bold truncate block">
              {profile?.area || "Not set"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <ProtectedRoute>
      <HomeContent />
    </ProtectedRoute>
  );
}
