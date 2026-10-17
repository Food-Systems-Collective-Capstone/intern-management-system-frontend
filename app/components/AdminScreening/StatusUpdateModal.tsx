import { useEffect, useRef, useState } from "react";
import {
  updateApplicantStatus,
  type Candidate,
} from "../../lib/applications";
import { displayStatus } from "./statuses";

export function StatusUpdateModal({
  candidate,
  status,
  onClose,
  onUpdated,
}: {
  candidate: Candidate;
  status: string;
  onClose: () => void;
  onUpdated: (candidate: Candidate) => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const name = `${candidate.firstname} ${candidate.lastname}`;
  const displayedStatus = displayStatus(status);
  const statusLabel = displayedStatus === "Other" ? status : displayedStatus;

  useEffect(() => {
    cancelButtonRef.current?.focus();
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape" && !submitting) onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose, submitting]);

  async function confirmUpdate() {
    setError("");
    setSubmitting(true);
    try {
      const updatedCandidate = await updateApplicantStatus(
        candidate.person_id,
        status,
      );
      onUpdated({
        ...candidate,
        ...updatedCandidate,
        person_id: updatedCandidate.person_id ?? candidate.person_id,
        firstname: updatedCandidate.firstname ?? candidate.firstname,
        lastname: updatedCandidate.lastname ?? candidate.lastname,
        application_status: updatedCandidate.application_status ?? status,
      });
      onClose();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Unable to update this application status.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !submitting) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="status-dialog-title"
        aria-describedby="status-dialog-description"
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl"
      >
        <h2 id="status-dialog-title" className="text-xl font-bold">
          Change application status?
        </h2>
        <p
          id="status-dialog-description"
          className="mt-3 text-sm text-gray-600"
        >
          Change {name}&apos;s status from{" "}
          {displayStatus(candidate.application_status)} to {statusLabel}?
        </p>

        {error && (
          <p
            role="alert"
            className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          >
            {error}
          </p>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            ref={cancelButtonRef}
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-md border border-gray-400 px-4 py-2 text-sm font-semibold hover:bg-gray-100 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void confirmUpdate()}
            disabled={submitting}
            className="rounded-md bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {submitting ? "Updating…" : `Confirm ${statusLabel}`}
          </button>
        </div>
      </section>
    </div>
  );
}
