import { useMemo, useState } from "react";
import { Link } from "react-router";
import { Search } from "./Table/Search";
import { Table } from "./Table/Table";
import { useApplications } from "./useApplications";
import { signOut } from "~/lib/auth";
import { AdminAccount } from "./AdminAccount";
import { CandidateDetails } from "./CandidateDetails";
import { screeningStatuses } from "./statuses";
import type { Candidate } from "~/lib/applications";
import { Dropdown } from "~/components/Dropdown";

export function ScreeningView() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [program, setProgram] = useState("");
  const [search, setSearch] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(
    null,
  );
  const { data, total, loading, error } = useApplications(page, status);
  const programs = useMemo(
    () => [...new Set(data.map((item) => item.degree).filter(Boolean))].sort(),
    [data],
  );
  const rows = useMemo(
    () =>
      data.filter((item) => {
        const text =
          `${item.firstname} ${item.lastname} ${item.email} ${item.person_id}`.toLowerCase();
        return (
          (!program || item.degree === program) &&
          text.includes(search.trim().toLowerCase())
        );
      }),
    [data, program, search],
  );
  const pages = Math.max(1, Math.ceil(total / 6));

  return (
    <main className="min-h-screen bg-white font-sans text-gray-950 md:flex">
      <aside className="flex w-full flex-col border-b border-gray-200 md:min-h-screen md:w-64 md:shrink-0 md:border-r md:border-b-0">
        <div className="flex items-center gap-3 p-6">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200 text-xs font-semibold">
            Logo
          </span>
          <span>
            <strong className="block">IMS</strong>
            <small>intern management system</small>
          </span>
        </div>
        <nav aria-label="Admin" className="mt-4">
          <div className="flex items-center gap-4 px-7 py-4 font-semibold">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-6 w-6"
            >
              <path d="m3 11 9-8 9 8v10h-7v-7h-4v7H3Z" />
            </svg>
            Dashboard
          </div>
          <div
            aria-current="page"
            className="flex items-center gap-4 bg-black px-7 py-4 font-semibold text-white"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-6 w-6"
            >
              <path d="M5 2h10l4 4v16H5Z" />
              <path d="M15 2v5h4M8 12h8M8 16h6" />
            </svg>
            Application
          </div>
        </nav>
        <Link
          to="/sign-in"
          onClick={() => {
            void signOut();
          }}
          className="m-6 mt-auto flex items-center gap-4 text-sm font-semibold"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-6 w-6"
          >
            <path d="M9 4H5v16h4M15 8l4 4-4 4M19 12H9" />
          </svg>
          Sign out
        </Link>
      </aside>
      <section className="mx-auto w-full max-w-7xl px-5 py-7 md:px-10">
        <header className="flex justify-end">
          <AdminAccount />
        </header>
        <div className="mt-14 md:mt-16">
          <h1 className="text-3xl font-bold tracking-tight">
            Candidate Screening
          </h1>
          <p className="mt-1 text-sm">
            Review and screen candidate applications
          </p>
        </div>

        <div className="mt-12 grid gap-4 rounded-xl border border-gray-200 p-5 shadow-sm sm:grid-cols-2 xl:mt-28 xl:grid-cols-[2fr_1fr_1fr_auto] xl:items-end">
          <Search value={search} onChange={setSearch} />
          <Dropdown
            label="Status"
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(1);
              setProgram("");
            }}
            options={[
              { value: "", label: "All statuses" },
              ...screeningStatuses.map((item) => ({
                value: item.value,
                label: item.label,
              })),
            ]}
          />
          <Dropdown
            label="Program on this page"
            value={program}
            onChange={(event) => setProgram(event.target.value)}
            options={[
              { value: "", label: "All programs" },
              ...programs.map((item) => ({ value: item, label: item })),
            ]}
          />
          <button
            type="button"
            onClick={() => {
              setStatus("");
              setProgram("");
              setSearch("");
              setPage(1);
            }}
            className="h-11 rounded-md border border-gray-400 px-5 text-sm font-semibold hover:bg-gray-100"
          >
            Clear
          </button>
        </div>
        <p className="mt-2 text-xs text-gray-500">
          Search and program filters apply to the current page. Status filters
          all applications.
        </p>
        <div className="mt-7" aria-busy={loading}>
          {loading ? (
            <p role="status" className="p-8">
              Loading applications…
            </p>
          ) : error ? (
            <p
              role="alert"
              className="rounded border border-red-200 bg-red-50 p-5 text-red-700"
            >
              {error}
            </p>
          ) : (
            <Table rows={rows} onView={setSelectedCandidate} />
          )}
        </div>
        {!error && !loading && (
          <div className="mt-5 flex flex-wrap items-center justify-between gap-4 text-sm text-gray-500">
            <span>
              {total
                ? `Showing ${(page - 1) * 6 + 1} to ${Math.min(page * 6, total)} of ${total} applications`
                : "No applications"}
            </span>
            <div className="flex items-center gap-2">
              <button
                aria-label="Previous page"
                disabled={page === 1}
                onClick={() => {
                  setPage(page - 1);
                  setProgram("");
                }}
                className="rounded border px-3 py-2 disabled:opacity-40"
              >
                ←
              </button>
              <span>
                Page {page} of {pages}
              </span>
              <button
                aria-label="Next page"
                disabled={page >= pages}
                onClick={() => {
                  setPage(page + 1);
                  setProgram("");
                }}
                className="rounded border px-3 py-2 disabled:opacity-40"
              >
                →
              </button>
            </div>
          </div>
        )}
      </section>
      {selectedCandidate && (
        <CandidateDetails
          candidate={selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
        />
      )}
    </main>
  );
}
