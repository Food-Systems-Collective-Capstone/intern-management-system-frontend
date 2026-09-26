import type { Candidate } from "~/lib/applications";
import { displayStatus } from "../statuses";

const statusStyles: Record<string, string> = {
  Submitted: "bg-gray-100 text-slate-700",
  Reviewing: "bg-blue-50 text-blue-700",
  Accepted: "bg-emerald-50 text-emerald-700",
  Rejected: "bg-red-50 text-red-700",
  Other: "bg-gray-100 text-slate-700",
};

export function Row({
  candidate,
  onView,
}: {
  candidate: Candidate;
  onView: (candidate: Candidate) => void;
}) {
  const name = `${candidate.firstname} ${candidate.lastname}`;
  const status = displayStatus(candidate.application_status);
  const date =
    candidate.created_at && !Number.isNaN(Date.parse(candidate.created_at))
      ? new Intl.DateTimeFormat("en-AU", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }).format(new Date(candidate.created_at))
      : "—";

  return (
    <tr className="border-t border-gray-200 text-sm">
      <td className="px-5 py-4 font-medium" title={candidate.person_id}>
        {candidate.person_id.slice(0, 8)}…
      </td>
      <td className="px-5 py-4">
        <div className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-200 text-xs font-semibold text-gray-600"
          >
            {candidate.firstname[0]}
            {candidate.lastname[0]}
          </span>
          <span>
            <span className="block font-medium">{name}</span>
            <span className="text-xs text-gray-500">{candidate.email}</span>
          </span>
        </div>
      </td>
      <td className="px-5 py-4">{candidate.degree || "—"}</td>
      <td className="px-5 py-4 whitespace-nowrap">{date}</td>
      <td className="px-5 py-4">
        {candidate.resume_url ? "PDF on file" : "Not uploaded"}
      </td>
      <td className="px-5 py-4">
        <span
          title={
            status === "Other"
              ? `Backend status: ${candidate.application_status}`
              : undefined
          }
          className={`rounded-full px-3 py-1 text-xs font-medium ${statusStyles[status]}`}
        >
          {status}
        </span>
      </td>
      <td className="px-5 py-4 text-center">
        <button
          type="button"
          onClick={() => onView(candidate)}
          aria-label={`View ${name}'s application`}
          title={`View ${name}'s application`}
          className="rounded p-2 text-gray-700 hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-black"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-5 w-5"
          >
            <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </button>
      </td>
    </tr>
  );
}
