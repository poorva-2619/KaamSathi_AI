import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';

// Root Pages
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';

// Job Provider Pages
import { Home as JobProviderHome } from './pages/job-provider/Home';
import { PostJob } from './pages/job-provider/PostJob';
import { MyJobs } from './pages/job-provider/MyJobs';
import { Profile as JobProviderProfile } from './pages/job-provider/Profile';

// Service Provider Pages
import { Home as ServiceProviderHome } from './pages/service-provider/Home';
import { FindJobs } from './pages/service-provider/FindJobs';
import { JobDetails } from './pages/service-provider/JobDetails';
import { Profile as ServiceProviderProfile } from './pages/service-provider/Profile';

// Placeholder screen for placeholder routes
const ComingSoonScreen: React.FC<{ title: string; subtitle?: string }> = ({
  title,
  subtitle,
}) => {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl p-8 border border-slate-200 shadow-card text-center">
        <span className="inline-block px-3 py-1 bg-orange-100 text-primary-700 text-xs font-semibold rounded-full mb-3">
          Coming soon
        </span>
        <h1 className="text-2xl font-bold text-slate-900">
          <span className="text-primary-600">{title}</span>
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          {subtitle || 'This section is currently under development.'}
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            to="/job-provider"
            className="px-4 py-2 bg-orange-50 text-primary-700 text-xs font-semibold rounded-xl border border-orange-100 hover:bg-orange-100 transition-colors"
          >
            Job Provider
          </Link>
          <Link
            to="/service-provider"
            className="px-4 py-2 bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 hover:bg-slate-100 transition-colors"
          >
            Service Worker
          </Link>
        </div>
      </div>
    </div>
  );
};

export function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
        <Navbar />
        <main>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Placeholder routes rendering 'Coming soon' */}
            <Route
              path="/home"
              element={<ComingSoonScreen title="Home Feed" subtitle="Unified home stream coming soon." />}
            />
            <Route
              path="/chat"
              element={<ComingSoonScreen title="Messages & Chat" subtitle="Direct communication with workers coming soon." />}
            />
            <Route
              path="/profile"
              element={<ComingSoonScreen title="User Profile" subtitle="Account and preferences management coming soon." />}
            />

            {/* Protected Routes (Passthrough for now) */}
            <Route element={<ProtectedRoute />}>
              {/* Job Provider Portal */}
              <Route path="/job-provider" element={<JobProviderHome />} />
              <Route path="/job-provider/post-job" element={<PostJob />} />
              <Route path="/job-provider/my-jobs" element={<MyJobs />} />
              <Route path="/job-provider/profile" element={<JobProviderProfile />} />

              {/* Service Provider Portal */}
              <Route path="/service-provider" element={<ServiceProviderHome />} />
              <Route path="/service-provider/find-jobs" element={<FindJobs />} />
              <Route path="/service-provider/job/:id" element={<JobDetails />} />
              <Route path="/service-provider/profile" element={<ServiceProviderProfile />} />
            </Route>

            {/* Catch-all 404 */}
            <Route
              path="*"
              element={
                <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6">
                  <div className="max-w-md w-full bg-white rounded-2xl p-8 border border-slate-200 shadow-card text-center">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">404</h1>
                    <p className="text-sm text-slate-600 mb-6">Page not found.</p>
                    <Link
                      to="/"
                      className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl transition-colors inline-block"
                    >
                      Return to Landing
                    </Link>
                  </div>
                </div>
              }
            />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
