import { useMemo } from "react";
import { Mail, Shield, User2 } from "lucide-react";

export default function InstructorSettings() {
  const instructor = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("instructor") || "null");
    } catch {
      return null;
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
          <p className="mt-1 text-sm text-slate-500">Review your instructor profile information.</p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Profile</h2>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            <InfoCard label="Full name" value={instructor?.name || "Instructor"} icon={User2} />
            <InfoCard label="Email" value={instructor?.email || "-"} icon={Mail} />
            <InfoCard label="Department" value={instructor?.department || "-"} icon={Shield} />
            <InfoCard label="Employee ID" value={instructor?.employeeId || "-"} icon={Shield} />
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ label, value, icon: Icon }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
      <div className="flex items-center gap-3">
        <div className="rounded-full bg-blue-50 p-3 text-blue-600">
          <Icon size={18} />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
          <p className="mt-1 text-sm font-semibold text-slate-900">{value}</p>
        </div>
      </div>
    </div>
  );
}