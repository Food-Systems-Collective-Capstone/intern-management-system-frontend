import { Link } from "react-router";

export function meta() {
  return [
    { title: "FSC Intern Management" },
    { name: "description", content: "Internship applications and management" },
  ];
}

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 text-slate-900">
      <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-3xl font-bold tracking-tight">FSC Intern Management</h1>
        <p className="mt-3 text-slate-600">Start or continue your internship application.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/register" className="rounded-md bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800">
            Create account
          </Link>
          <Link to="/sign-in" className="rounded-md border border-slate-300 px-5 py-3 text-sm font-semibold hover:bg-slate-100">
            Sign in
          </Link>
        </div>
      </div>
    </main>
  );
}
