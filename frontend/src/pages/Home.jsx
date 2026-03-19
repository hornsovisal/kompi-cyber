import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cadtSky via-white to-slate-100">
      <nav className="flex items-center justify-between px-6 py-4 border-b border-cadtLine bg-white shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cadtBlue text-lg font-bold text-white">
            KC
          </div>
          <p className="text-sm font-semibold uppercase tracking-wider text-cadtBlue">
            Kompi-Cyber
          </p>
        </div>
        <div className="flex gap-4">
          <Link
            to="/login"
            className="rounded-lg px-4 py-2 text-sm font-semibold text-cadtBlue transition hover:bg-cadtSky"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="rounded-lg bg-cadtBlue px-4 py-2 text-sm font-semibold text-white transition hover:bg-cadtNavy"
          >
            Register
          </Link>
        </div>
      </nav>

      <main className="flex min-h-[calc(100vh-80px)] flex-col items-center justify-center px-4 py-20">
        <div className="max-w-2xl text-center">
          <div className="mb-8 inline-flex h-24 w-24 items-center justify-center rounded-3xl bg-cadtBlue text-5xl font-bold text-white shadow-lg">
            KC
          </div>

          <h1 className="mb-4 text-5xl font-bold text-cadtNavy">
            Welcome to Kompi-Cyber
          </h1>

          <p className="mb-8 text-lg text-slate-600">
            Learn cybersecurity with a clean, modern learning platform. Master
            essential security skills from beginner to advanced levels.
          </p>

          <div className="mb-12 grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-cadtLine bg-white p-6 shadow-card">
              <div className="mb-3 text-3xl">🎓</div>
              <h3 className="mb-2 font-semibold text-cadtNavy">
                Expert Content
              </h3>
              <p className="text-sm text-slate-600">
                Industry-curated cybersecurity courses
              </p>
            </div>

            <div className="rounded-2xl border border-cadtLine bg-white p-6 shadow-card">
              <div className="mb-3 text-3xl">📊</div>
              <h3 className="mb-2 font-semibold text-cadtNavy">
                Track Progress
              </h3>
              <p className="text-sm text-slate-600">
                Monitor your learning journey in real-time
              </p>
            </div>

            <div className="rounded-2xl border border-cadtLine bg-white p-6 shadow-card">
              <div className="mb-3 text-3xl">🏆</div>
              <h3 className="mb-2 font-semibold text-cadtNavy">
                Get Certified
              </h3>
              <p className="text-sm text-slate-600">
                Earn certificates upon course completion
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link
              to="/register"
              className="rounded-lg bg-cadtBlue px-8 py-3 text-sm font-semibold text-white transition hover:bg-cadtNavy"
            >
              Get Started
            </Link>
            <Link
              to="/login"
              className="rounded-lg border-2 border-cadtBlue px-8 py-3 text-sm font-semibold text-cadtBlue transition hover:bg-cadtSky"
            >
              Sign In
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
