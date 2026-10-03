import { useEffect, useRef, useState, type SubmitEvent } from "react";
import {
  promoteApplicant,
  type Candidate,
} from "../../lib/applications";

export function PromoteInternModal({
  candidate,
  onClose,
  onPromoted,
}: {
  candidate: Candidate;
  onClose: () => void;
  onPromoted: (candidate: Candidate) => void;
}) {
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const name = `${candidate.firstname} ${candidate.lastname}`;

  useEffect(() => {
    cancelButtonRef.current?.focus();

    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape" && !submitting) onClose();
      if (event.key !== "Tab") return;

      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button:not(:disabled), input:not(:disabled), [href], [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable?.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose, submitting]);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!confirmed) {
      setError("Confirm that you understand the account changes to continue.");
      return;
    }

    setSubmitting(true);
    try {
      const updatedCandidate = await promoteApplicant(candidate.person_id);
      onPromoted(updatedCandidate);
      onClose();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Unable to promote this candidate.",
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
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="promote-dialog-title"
        aria-describedby="promote-dialog-description"
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-6 w-6"
          >
            <path d="M12 3v12m0-12 5 5m-5-5L7 8M5 14v5h14v-5" />
          </svg>
        </div>

        <h2 id="promote-dialog-title" className="mt-5 text-xl font-bold">
          Promote {name} to Intern?
        </h2>
        <p
          id="promote-dialog-description"
          className="mt-2 text-sm leading-6 text-gray-600"
        >
          This changes the candidate&apos;s account role to Intern and locks
          their application profile. The change will be recorded in the audit
          log.
        </p>

        <dl className="mt-5 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="font-semibold">Candidate</dt>
            <dd className="text-right">{name}</dd>
          </div>
          <div className="mt-2 flex justify-between gap-4">
            <dt className="font-semibold">Email</dt>
            <dd className="break-all text-right">{candidate.email}</dd>
          </div>
        </dl>

        <form onSubmit={handleSubmit} noValidate>
          <label className="mt-5 flex cursor-pointer items-start gap-3 text-sm">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(event) => setConfirmed(event.target.checked)}
              disabled={submitting}
              className="mt-0.5 h-4 w-4"
            />
            <span>
              I understand that this will activate the candidate as an Intern
              and lock their application profile.
            </span>
          </label>

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
              type="submit"
              disabled={!confirmed || submitting}
              className="rounded-md bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "Promoting…" : "Confirm promotion"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
