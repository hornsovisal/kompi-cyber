import React from "react";
import { useNavigate } from "react-router-dom";

const DemoPortal = () => {
  const navigate = useNavigate();

  const resetAuth = () => {
    ["token", "instructor", "sessionExpires", "user"].forEach((key) => {
      sessionStorage.removeItem(key);
      localStorage.removeItem(key);
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
      <div className="w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-900/60 p-8">
        <h1 className="text-3xl font-bold text-center mb-2">KOMPI CYBER</h1>
        <p className="text-slate-300 text-center mb-8">Choose your login role</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => {
              resetAuth();
              navigate("/coordinator/login?fresh=1");
            }}
            className="rounded-xl bg-indigo-600 hover:bg-indigo-500 transition px-5 py-4 font-semibold"
          >
            Login as Coordinator
          </button>
          <button
            onClick={() => {
              resetAuth();
              navigate("/instructor/login?fresh=1");
            }}
            className="rounded-xl bg-emerald-600 hover:bg-emerald-500 transition px-5 py-4 font-semibold"
          >
            Login as Instructor
          </button>
        </div>
      </div>
    </div>
  );
};

export default DemoPortal;
