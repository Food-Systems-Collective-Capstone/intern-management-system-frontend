import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router";

type WeeklyProgress = {
  id: string;
  intern_id: string;
  reporting_week: string;
  accomplishments: string;
  blockers: string;
  next_steps: string;
  created_at: string;
  updated_at: string;
};

type ApiError = {
  message?: string;
};

const TEST_INTERN_ID = "ba89ecd4-3972-4eaf-bcc2-9c077d56204a";
const API_BASE_URL = "http://localhost:3000";

export function meta() {
  return [
    { title: "Weekly Progress | IMS" },
    {
      name: "description",
      content: "Submit Intern weekly progress",
    },
  ];
}

function getLocalDateString() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export default function InternWeeklyProgress() {
  const [reportingWeek] = useState(() => getLocalDateString());

  const [accomplishments, setAccomplishments] = useState("");
  const [blockers, setBlockers] = useState("");
  const [nextSteps, setNextSteps] = useState("");

  const [existingProgress, setExistingProgress] =
    useState<WeeklyProgress | null>(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function loadWeeklyProgress() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_BASE_URL}/weekly-progress/intern/${TEST_INTERN_ID}?reporting_week=${reportingWeek}`,
        );

        if (!response.ok) {
          const result: ApiError | null = await response
            .json()
            .catch(() => null);

          throw new Error(
            result?.message || "Unable to load Weekly Progress.",
          );
        }

        const text = await response.text();

        const result: WeeklyProgress | null = text
          ? JSON.parse(text)
          : null;

        setExistingProgress(result);

        if (result) {
          setAccomplishments(result.accomplishments);
          setBlockers(result.blockers);
          setNextSteps(result.next_steps);
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load Weekly Progress.",
        );
      } finally {
        setLoading(false);
      }
    }

    void loadWeeklyProgress();
  }, [reportingWeek]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (existingProgress) {
      return;
    }

    setError("");
    setSuccess("");

    if (
      !accomplishments.trim() ||
      !blockers.trim() ||
      !nextSteps.trim()
    ) {
      setError(
        "Please complete Accomplishments, Blockers and Next steps before submitting.",
      );
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch(
        `${API_BASE_URL}/weekly-progress/intern/${TEST_INTERN_ID}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            reporting_week: reportingWeek,
            accomplishments: accomplishments.trim(),
            blockers: blockers.trim(),
            next_steps: nextSteps.trim(),
          }),
        },
      );

      const text = await response.text();

      const result: WeeklyProgress | ApiError | null = text
        ? JSON.parse(text)
        : null;

      if (!response.ok) {
        throw new Error(
          (result as ApiError | null)?.message ||
            "Unable to submit Weekly Progress.",
        );
      }

      if (!result) {
        throw new Error(
          "Weekly Progress was submitted but no response was returned.",
        );
      }

      const submittedProgress = result as WeeklyProgress;

      setExistingProgress(submittedProgress);
      setAccomplishments(submittedProgress.accomplishments);
      setBlockers(submittedProgress.blockers);
      setNextSteps(submittedProgress.next_steps);

      setSuccess("Weekly Progress submitted successfully.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to submit Weekly Progress.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  const locked = existingProgress !== null;

  return (
    <main className="min-h-screen bg-[#171717] p-5 text-black">
      <div className="mx-auto min-h-[700px] max-w-5xl overflow-hidden rounded-2xl bg-white">
        <header className="flex items-center justify-between border-b-2 border-[#747474] px-7 py-4">
          <div className="flex h-[71px] w-[71px] items-center justify-center bg-[#d9d9d9] text-xl font-semibold">
            IMS
          </div>

          <div className="flex items-center gap-4">
            <div className="h-[55px] w-[55px] rounded-full bg-[#d9d9d9]" />

            <span className="text-xl font-semibold tracking-[-0.4px]">
              Intern⌄
            </span>
          </div>
        </header>

        <nav className="flex gap-2 border-b border-gray-300 bg-gray-50 px-7 py-2">
          <Link
            to="/intern/workspace"
            className="rounded-lg px-4 py-2 text-sm text-gray-600"
          >
            Workspace
          </Link>

          <Link
            to="/intern/tasks"
            className="rounded-lg px-4 py-2 text-sm text-gray-600"
          >
            My Tasks
          </Link>

          <Link
            to="/intern/weekly-progress"
            className="rounded-lg bg-[#3f3d3d] px-4 py-2 text-sm font-medium text-white"
          >
            Weekly Progress
          </Link>
        </nav>

        <section className="px-8 py-8">
          <Link
            to="/intern/workspace"
            className="text-sm text-gray-500 transition hover:text-black"
          >
            ← Intern Workspace
          </Link>

          <div className="mt-5">
            <h1 className="text-2xl font-semibold">Weekly Progress</h1>

            <p className="mt-2 text-sm text-gray-500">
              Share your overall progress for this reporting week.
            </p>
          </div>

          <div className="mt-6 rounded-lg border border-gray-300 bg-gray-50 px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Reporting week
            </p>

            <p className="mt-1 text-sm font-medium">{reportingWeek}</p>
          </div>

          {loading && (
            <div className="mt-6 rounded-lg border border-gray-300 p-5 text-sm text-gray-600">
              Loading Weekly Progress...
            </div>
          )}

          {!loading && (
            <>
              {locked && (
                <div className="mt-6 rounded-lg border border-green-300 bg-green-50 p-4 text-sm text-green-800">
                  ✓ This week's progress was already submitted. Only one
                  submission per week is allowed.
                </div>
              )}

              {success && (
                <div className="mt-6 rounded-lg border border-green-300 bg-green-50 p-4 text-sm text-green-800">
                  ✓ {success}
                </div>
              )}

              {error && (
                <div className="mt-6 rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-700">
                  {error}
                </div>
              )}

              <form
                onSubmit={handleSubmit}
                className="mt-6 space-y-6"
              >
                <div>
                  <label
                    htmlFor="accomplishments"
                    className="mb-2 block text-sm font-medium"
                  >
                    Accomplishments*
                  </label>

                  <textarea
                    id="accomplishments"
                    value={accomplishments}
                    onChange={(event) =>
                      setAccomplishments(event.target.value)
                    }
                    disabled={locked || submitting}
                    rows={5}
                    placeholder="What did you accomplish this week?"
                    className="w-full resize-y rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-gray-600 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-600"
                  />
                </div>

                <div>
                  <label
                    htmlFor="blockers"
                    className="mb-2 block text-sm font-medium"
                  >
                    Blockers*
                  </label>

                  <textarea
                    id="blockers"
                    value={blockers}
                    onChange={(event) =>
                      setBlockers(event.target.value)
                    }
                    disabled={locked || submitting}
                    rows={5}
                    placeholder="What blockers or challenges did you face?"
                    className="w-full resize-y rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-gray-600 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-600"
                  />
                </div>

                <div>
                  <label
                    htmlFor="nextSteps"
                    className="mb-2 block text-sm font-medium"
                  >
                    Next steps*
                  </label>

                  <textarea
                    id="nextSteps"
                    value={nextSteps}
                    onChange={(event) =>
                      setNextSteps(event.target.value)
                    }
                    disabled={locked || submitting}
                    rows={5}
                    placeholder="What will you work on next?"
                    className="w-full resize-y rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-gray-600 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-600"
                  />
                </div>

                {!locked && (
                  <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-lg bg-[#3f3d3d] px-6 py-3 text-sm font-medium text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitting
                      ? "Submitting..."
                      : "Submit progress"}
                  </button>
                )}
              </form>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
