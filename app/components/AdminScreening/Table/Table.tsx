import type { Candidate } from "~/lib/applications";
import { Row } from "./Row";

export function Table({
  rows,
  onView,
}: {
  rows: Candidate[];
  onView: (candidate: Candidate) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200">
      <table className="w-full min-w-[960px] text-left text-gray-900">
        <thead className="bg-gray-50 text-xs font-semibold">
          <tr>
            <th className="px-5 py-4">Application ID</th>
            <th className="px-5 py-4">Candidate</th>
            <th className="px-5 py-4">Program</th>
            <th className="px-5 py-4">Submitted on</th>
            <th className="px-5 py-4">Resume</th>
            <th className="px-5 py-4">Status</th>
            <th className="px-5 py-4 text-center">View</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((candidate) => (
            <Row
              key={candidate.person_id}
              candidate={candidate}
              onView={onView}
            />
          ))}
        </tbody>
      </table>
      {rows.length === 0 && (
        <p className="border-t border-gray-200 p-8 text-center text-sm text-gray-500">
          No matching applications on this page.
        </p>
      )}
    </div>
  );
}
