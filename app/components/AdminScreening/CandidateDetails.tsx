import { useEffect, useRef, useState } from "react";
import type { Candidate } from "~/lib/applications";
import { displayStatus, editableStatuses } from "./statuses";
import { PromoteInternModal } from "./PromoteInternModal";
import { StatusUpdateModal } from "./StatusUpdateModal";

type Tab = "profile" | "summary" | "documents";
const tabs: { id: Tab; label: string }[] = [
  { id: "profile", label: "Profile" },
  { id: "summary", label: "Application summary" },
  { id: "documents", label: "Documents" },
];

function formatDate(value?: string | null) {
  if (!value) return "—";
  const date = new Date(
    /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00` : value,
  );
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function CandidateDetails({
  candidate,
  onClose,
  onPromoted,
  onStatusUpdated,
}: {
  candidate: Candidate;
  onClose: () => void;
  onPromoted?: (candidate: Candidate) => void;
  onStatusUpdated?: (candidate: Candidate) => void;
}) {
  const [tab, setTab] = useState<Tab>("profile");
  const [showPromotion, setShowPromotion] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape" && !showPromotion && !pendingStatus) onClose();
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
  }, [onClose, pendingStatus, showPromotion]);

  const name = `${candidate.firstname} ${candidate.lastname}`;
  const location = [candidate.city, candidate.state, candidate.country]
    .filter(Boolean)
    .join(", ");
  const submitted = formatDate(candidate.created_at);
  const status = displayStatus(candidate.application_status);
  const canPromote =
    candidate.application_status === "Accepted" &&
    !candidate.is_locked &&
    !candidate.promoted_at;
  const statusClass =
    status === "Accepted"
      ? "bg-emerald-50 text-emerald-700"
      : status === "Rejected"
        ? "bg-red-50 text-red-700"
        : status === "Reviewing"
          ? "bg-blue-50 text-blue-700"
          : "bg-gray-100 text-slate-700";

  return (
    <>
      <div
        aria-hidden={showPromotion || pendingStatus ? true : undefined}
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
              <p className="text-xs">
                {candidate.phone || "Phone unavailable"}
              </p>
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
                    <dt className="text-gray-600">Country</dt>
                    <dd className="mt-1">{candidate.country || "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-600">Email</dt>
                    <dd className="mt-1 break-all">{candidate.email}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-600">Date of birth</dt>
                    <dd className="mt-1">
                      {formatDate(candidate.date_of_birth)}
                    </dd>
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
                  <div className="col-span-2">
                    <dt className="text-gray-600">LinkedIn profile</dt>
                    <dd className="mt-1 break-all">
                      {candidate.linkedin_url ? (
                        <a
                          href={candidate.linkedin_url}
                          target="_blank"
                          rel="noreferrer"
                          className="underline hover:no-underline"
                        >
                          {candidate.linkedin_url}
                        </a>
                      ) : (
                        "—"
                      )}
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
                    <dt className="font-semibold">University / Institute</dt>
                    <dd className="text-right">
                      {candidate.university || "—"}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="font-semibold">Graduation year</dt>
                    <dd>{candidate.graduation_year || "—"}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="font-semibold">Submitted on</dt>
                    <dd>{submitted}</dd>
                  </div>
                  {candidate.updated_at && (
                    <div className="flex justify-between gap-4">
                      <dt className="font-semibold">Last updated</dt>
                      <dd>{formatDate(candidate.updated_at)}</dd>
                    </div>
                  )}
                  <div className="min-w-0 max-w-full">
                    <dt className="font-semibold">Motivation</dt>
                    <dd className="mt-2 max-w-full whitespace-pre-wrap break-words [overflow-wrap:anywhere] text-gray-700">
                      {candidate.motivation || "—"}
                    </dd>
                  </div>
                </dl>
                <h3 className="mb-3 mt-6 text-sm font-bold">Screening</h3>
                <dl className="space-y-4 rounded-lg border border-gray-200 p-3 text-xs">
                  <div className="flex items-center justify-between gap-3">
                    <dt className="font-semibold">Status</dt>
                    <dd>
                      {onStatusUpdated ? (
                        <>
                          <label
                            className="sr-only"
                            htmlFor={`candidate-status-${candidate.person_id}`}
                          >
                            Status for {name}
                          </label>
                          <select
                            id={`candidate-status-${candidate.person_id}`}
                            value={candidate.application_status}
                            disabled={candidate.is_locked}
                            onChange={(event) => {
                              if (
                                event.target.value !==
                                candidate.application_status
                              ) {
                                setPendingStatus(event.target.value);
                              }
                            }}
                            className={`rounded-md border border-gray-300 px-3 py-2 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-60 ${statusClass}`}
                          >
                            {!editableStatuses.some(
                              (item) =>
                                item.value === candidate.application_status,
                            ) && (
                              <option value={candidate.application_status}>
                                {candidate.application_status}
                              </option>
                            )}
                            {editableStatuses.map((item) => (
                              <option key={item.value} value={item.value}>
                                {item.label}
                              </option>
                            ))}
                          </select>
                        </>
                      ) : (
                        <span
                          className={`rounded-full px-3 py-1 ${statusClass}`}
                        >
                          {status}
                        </span>
                      )}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt className="font-semibold">Promoted to Intern?</dt>
                    <dd>{candidate.is_locked ? "Yes" : "No"}</dd>
                  </div>
                  {candidate.promoted_at && (
                    <div className="flex items-center justify-between gap-4">
                      <dt className="font-semibold">Promoted on</dt>
                      <dd>{formatDate(candidate.promoted_at)}</dd>
                    </div>
                  )}
                  {candidate.promoted_by && (
                    <div className="flex items-center justify-between gap-4">
                      <dt className="font-semibold">Promoted by</dt>
                      <dd
                        className="max-w-48 truncate"
                        title={candidate.promoted_by}
                      >
                        {candidate.promoted_by}
                      </dd>
                    </div>
                  )}
                </dl>
              </>
            )}
            {tab === "documents" && (
              <>
                <h3 className="mb-3 text-sm font-bold">Resume</h3>
                <div className="rounded-lg border border-gray-200 p-3 text-xs">
                  {candidate.resume_url ? (
                    <>
                      <span className="block font-semibold">
                        Resume PDF on file
                      </span>
                      <span className="mt-1 block break-all text-gray-600">
                        {candidate.resume_url}
                      </span>
                    </>
                  ) : (
                    "No resume uploaded"
                  )}
                </div>
              </>
            )}
          </div>
          <div className="mt-8 flex justify-end gap-3">
            {canPromote && onPromoted && (
              <button
                type="button"
                onClick={() => setShowPromotion(true)}
                className="rounded bg-black px-4 py-2 text-xs font-semibold text-white hover:bg-gray-800 focus-visible:outline-2 focus-visible:outline-black focus-visible:outline-offset-2"
              >
                Promote to Intern
              </button>
            )}
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
      {showPromotion && onPromoted && (
        <PromoteInternModal
          candidate={candidate}
          onClose={() => setShowPromotion(false)}
          onPromoted={onPromoted}
        />
      )}
      {pendingStatus && onStatusUpdated && (
        <StatusUpdateModal
          candidate={candidate}
          status={pendingStatus}
          onClose={() => setPendingStatus(null)}
          onUpdated={onStatusUpdated}
        />
      )}
    </>
  );
}
