import { useEffect, useRef, useState } from "react";
import type { Candidate } from "~/lib/applications";
import { displayStatus } from "./statuses";

type Tab = "profile" | "summary" | "documents";
const tabs: { id: Tab; label: string }[] = [
  { id: "profile", label: "Profile" },
  { id: "summary", label: "Application summary" },
  { id: "documents", label: "Documents" },
];

export function CandidateDetails({
  candidate,
  onClose,
}: {
  candidate: Candidate;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<Tab>("profile");
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
      if (
        event.key === "Tab" &&
        !event.shiftKey &&
        document.activeElement === closeButtonRef.current
      ) {
        event.preventDefault();
        document.getElementById("candidate-tab-profile")?.focus();
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const name = `${candidate.firstname} ${candidate.lastname}`;
  const location = [candidate.city, candidate.state].filter(Boolean).join(", ");
  const submitted =
    candidate.created_at && !Number.isNaN(Date.parse(candidate.created_at))
      ? new Intl.DateTimeFormat("en-AU", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }).format(new Date(candidate.created_at))
      : "—";
  const status = displayStatus(candidate.application_status);
  const statusClass =
    status === "Accepted"
      ? "bg-emerald-50 text-emerald-700"
      : status === "Rejected"
        ? "bg-red-50 text-red-700"
        : status === "Reviewing"
          ? "bg-blue-50 text-blue-700"
          : "bg-gray-100 text-slate-700";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="candidate-dialog-title"
        className="flex max-h-[90vh] min-h-[550px] w-full max-w-[410px] flex-col overflow-y-auto rounded-lg bg-white p-3 shadow-xl sm:p-5"
      >
        <div className="flex items-center gap-3 px-1 pt-2">
          <span
            aria-hidden="true"
            className="h-16 w-16 shrink-0 rounded-full bg-gray-200"
          />
          <div className="min-w-0">
            <h2
              id="candidate-dialog-title"
              className="text-xl font-bold leading-tight"
            >
              {name}
            </h2>
            <p className="truncate text-xs">{candidate.email}</p>
            <p className="text-xs">{candidate.phone || "Phone unavailable"}</p>
            <p className="text-xs">{location || "Location unavailable"}</p>
          </div>
        </div>

        <div
          role="tablist"
          aria-label="Candidate details"
          className="mt-8 flex justify-center gap-3 border-b border-gray-200 text-xs"
        >
          {tabs.map((item) => (
            <button
              key={item.id}
              id={`candidate-tab-${item.id}`}
              type="button"
              role="tab"
              autoFocus={item.id === "profile"}
              aria-selected={tab === item.id}
              aria-controls="candidate-tab-panel"
              onClick={() => setTab(item.id)}
              className={`whitespace-nowrap px-1 pb-2 ${tab === item.id ? "border-b-2 border-black font-semibold" : "text-gray-600 hover:text-black"}`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div
          id="candidate-tab-panel"
          role="tabpanel"
          aria-labelledby={`candidate-tab-${tab}`}
          className="mt-8 flex-1"
        >
          {tab === "profile" && (
            <>
              <h3 className="mb-3 text-sm font-bold">Personal Information</h3>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-4 rounded-lg border border-gray-200 p-3 text-xs">
                <div>
                  <dt className="text-gray-600">Full name</dt>
                  <dd className="mt-1">{name}</dd>
                </div>
                <div>
                  <dt className="text-gray-600">Nationality</dt>
                  <dd className="mt-1">—</dd>
                </div>
                <div>
                  <dt className="text-gray-600">Email</dt>
                  <dd className="mt-1 break-all">{candidate.email}</dd>
                </div>
                <div>
                  <dt className="text-gray-600">Date of birth</dt>
                  <dd className="mt-1">—</dd>
                </div>
                <div>
                  <dt className="text-gray-600">Phone number</dt>
                  <dd className="mt-1">{candidate.phone || "—"}</dd>
                </div>
                <div>
                  <dt className="text-gray-600">Address</dt>
                  <dd className="mt-1">
                    {[
                      candidate.address,
                      candidate.city,
                      candidate.state,
                      candidate.post_code,
                    ]
                      .filter(Boolean)
                      .join(", ") || "—"}
                  </dd>
                </div>
              </dl>
            </>
          )}
          {tab === "summary" && (
            <>
              <h3 className="mb-3 text-sm font-bold">Application summary</h3>
              <dl className="space-y-3 rounded-lg border border-gray-200 p-3 text-xs">
                <div className="flex justify-between gap-4">
                  <dt className="font-semibold">Application ID</dt>
                  <dd className="text-right" title={candidate.person_id}>
                    {candidate.person_id.slice(0, 8)}…
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="font-semibold">Program</dt>
                  <dd>{candidate.degree || "—"}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="font-semibold">Submitted on</dt>
                  <dd>{submitted}</dd>
                </div>
              </dl>
              <h3 className="mb-3 mt-6 text-sm font-bold">Screening</h3>
              <dl className="space-y-4 rounded-lg border border-gray-200 p-3 text-xs">
                <div className="flex items-center justify-between gap-3">
                  <dt className="font-semibold">Status</dt>
                  <dd
                    className={`rounded-full px-3 py-1 ${statusClass}`}
                    title={
                      status === "Other"
                        ? candidate.application_status
                        : undefined
                    }
                  >
                    {status}
                  </dd>
                  <button
                    type="button"
                    disabled
                    title="Notes are not supported by the API yet"
                    className="rounded bg-black px-2 py-2 text-white opacity-50"
                  >
                    Add notes
                  </button>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="font-semibold">Notes</dt>
                  <dd className="text-gray-500">No notes yet</dd>
                </div>
              </dl>
            </>
          )}
          {tab === "documents" && (
            <>
              <h3 className="mb-3 text-sm font-bold">Resume</h3>
              <div className="rounded-lg border border-gray-200 p-3 text-xs">
                {candidate.resume_url
                  ? "Resume PDF on file"
                  : "No resume uploaded"}
              </div>
              <h3 className="mb-3 mt-10 text-sm font-bold">Cover letter</h3>
              <div className="rounded-lg border border-gray-200 p-3 text-xs text-gray-500">
                {candidate.cover_letter_url
                  ? "Cover letter on file"
                  : "No cover letter uploaded"}
              </div>
            </>
          )}
        </div>
        <div className="mt-8 flex justify-end">
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="rounded border border-gray-400 px-4 py-2 text-xs hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-black"
          >
            Close
          </button>
        </div>
      </section>
    </div>
  );
}
