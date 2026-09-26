import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";

type AssignmentPerson = {
  id: string;
  email: string;
  role: string;
  first_name: string | null;
  last_name: string | null;
  name: string;
};

type MentorSubmissionReview = {
  task_id: string;
  title: string;
  task_description: string | null;
  due_date: string | null;
  priority: string | null;
  status: string;
  assigned_intern_id: string;
  assigned_by_mentor_id: string;
  intern_name: string;
  intern_email: string;
  submission_id: string | null;
  submission_description: string | null;
  file_url: string | null;
  file_name: string | null;
  attachment_url: string | null;
  submitted_at: string | null;
};

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

const API_BASE_URL = "http://localhost:3000";

const TEST_MENTOR_EMAIL = "team40.mentor.test@example.com";
const TEST_INTERN_EMAIL = "team40.intern1.test@example.com";

export function meta() {
  return [
    { title: "Review Progress | IMS" },
    {
      name: "description",
      content: "Review Intern task submissions and Weekly Progress",
    },
  ];
}

function getPriorityClasses(priority: string | null) {
  switch (priority) {
    case "High":
      return "border-red-300 bg-red-50 text-red-700";
    case "Medium":
      return "border-amber-300 bg-amber-50 text-amber-700";
    case "Low":
      return "border-green-300 bg-green-50 text-green-700";
    default:
      return "border-gray-300 bg-gray-50 text-gray-600";
  }
}

function getStatusClasses(status: string) {
  switch (status) {
    case "Submitted":
      return "border-blue-300 bg-blue-50 text-blue-700";
    case "Completed":
      return "border-green-300 bg-green-50 text-green-700";
    case "In Progress":
      return "border-amber-300 bg-amber-50 text-amber-700";
    default:
      return "border-gray-300 bg-gray-50 text-gray-600";
  }
}

function formatReportingWeek(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString();
}

export default function MentorReviewProgress() {
  const [people, setPeople] = useState<AssignmentPerson[]>([]);
  const [reviews, setReviews] = useState<MentorSubmissionReview[]>([]);
  const [selectedInternId, setSelectedInternId] = useState("");

  const [weeklyProgress, setWeeklyProgress] = useState<WeeklyProgress[]>([]);

  const [loading, setLoading] = useState(true);
  const [weeklyLoading, setWeeklyLoading] = useState(false);

  const [error, setError] = useState("");
  const [weeklyError, setWeeklyError] = useState("");

  const [successTaskId, setSuccessTaskId] = useState("");
  const [completingTaskId, setCompletingTaskId] = useState("");

  // Temporary Team 40 DEV identities.
  // Shared authentication will provide the signed-in user later.
  const currentMentor =
    people.find(
      (person) =>
        person.email.toLowerCase() === TEST_MENTOR_EMAIL.toLowerCase(),
    ) ?? null;

  const currentIntern =
    people.find(
      (person) =>
        person.email.toLowerCase() === TEST_INTERN_EMAIL.toLowerCase(),
    ) ?? null;

  useEffect(() => {
    async function loadReviewData() {
      try {
        setLoading(true);
        setError("");

        const peopleResponse = await fetch(
          `${API_BASE_URL}/tasks/assignment-people`,
        );

        if (!peopleResponse.ok) {
          throw new Error("Unable to load account information.");
        }

        const peopleResult: AssignmentPerson[] =
          await peopleResponse.json();

        setPeople(peopleResult);

        const mentor =
          peopleResult.find(
            (person) =>
              person.email.toLowerCase() ===
              TEST_MENTOR_EMAIL.toLowerCase(),
          ) ?? null;

        const intern =
          peopleResult.find(
            (person) =>
              person.email.toLowerCase() ===
              TEST_INTERN_EMAIL.toLowerCase(),
          ) ?? null;

        if (!mentor) {
          throw new Error(
            "Team 40 Mentor test account is not available.",
          );
        }

        if (!intern) {
          throw new Error(
            "Team 40 Intern test account is not available.",
          );
        }

        const reviewsResponse = await fetch(
          `${API_BASE_URL}/tasks/mentor/${mentor.id}/reviews`,
        );

        if (!reviewsResponse.ok) {
          const result = await reviewsResponse
            .json()
            .catch(() => null);

          throw new Error(
            result?.message || "Unable to load submission reviews.",
          );
        }

        const reviewsResult: MentorSubmissionReview[] =
          await reviewsResponse.json();

        setReviews(reviewsResult);
        setSelectedInternId(intern.id);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load submission reviews.",
        );
      } finally {
        setLoading(false);
      }
    }

    void loadReviewData();
  }, []);

  const internOptions = useMemo(() => {
    if (!currentIntern) {
      return [];
    }

    return [
      {
        id: currentIntern.id,
        name: currentIntern.name,
        email: currentIntern.email,
      },
    ];
  }, [currentIntern]);

  useEffect(() => {
    if (!currentMentor || !selectedInternId) {
      setWeeklyProgress([]);
      return;
    }

    async function loadWeeklyProgress() {
      if (!currentMentor) {
        return;
      }

      try {
        setWeeklyLoading(true);
        setWeeklyError("");

        const response = await fetch(
          `${API_BASE_URL}/weekly-progress/mentor/${currentMentor.id}/intern/${selectedInternId}`,
        );

        if (!response.ok) {
          const result = await response.json().catch(() => null);

          throw new Error(
            result?.message || "Unable to load Weekly Progress.",
          );
        }

        const result: WeeklyProgress[] = await response.json();

        setWeeklyProgress(result);
      } catch (err) {
        setWeeklyProgress([]);

        setWeeklyError(
          err instanceof Error
            ? err.message
            : "Unable to load Weekly Progress.",
        );
      } finally {
        setWeeklyLoading(false);
      }
    }

    void loadWeeklyProgress();
  }, [currentMentor, selectedInternId]);

  const filteredReviews = useMemo(() => {
    if (!selectedInternId) {
      return [];
    }

    return reviews.filter(
      (review) => review.assigned_intern_id === selectedInternId,
    );
  }, [reviews, selectedInternId]);

  const summary = useMemo(() => {
    const today = new Date();

    const todayString = [
      today.getFullYear(),
      String(today.getMonth() + 1).padStart(2, "0"),
      String(today.getDate()).padStart(2, "0"),
    ].join("-");

    let assigned = 0;
    let inProgress = 0;
    let submitted = 0;
    let completed = 0;
    let overdue = 0;
    let dueToday = 0;

    reviews.forEach((review) => {
      switch (review.status) {
        case "Assigned":
          assigned += 1;
          break;
        case "In Progress":
          inProgress += 1;
          break;
        case "Submitted":
          submitted += 1;
          break;
        case "Completed":
          completed += 1;
          break;
      }

      if (!review.due_date || review.status === "Completed") {
        return;
      }

      const dueDate = review.due_date.slice(0, 10);

      if (dueDate === todayString) {
        dueToday += 1;
      } else if (dueDate < todayString) {
        overdue += 1;
      }
    });

    return {
      total: reviews.length,
      assigned,
      inProgress,
      submitted,
      completed,
      overdue,
      dueToday,
    };
  }, [reviews]);

  async function handleComplete(taskId: string) {
    if (!currentMentor) {
      setError("Mentor account information is not available.");
      return;
    }

    setError("");
    setSuccessTaskId("");
    setCompletingTaskId(taskId);

    try {
      const response = await fetch(
        `${API_BASE_URL}/tasks/mentor/${currentMentor.id}/${taskId}/complete`,
        {
          method: "PATCH",
        },
      );

      if (!response.ok) {
        const result = await response.json().catch(() => null);

        throw new Error(
          result?.message || "Unable to mark this task Completed.",
        );
      }

      const result: {
        id: string;
        status: string;
        updated_at: string;
      } = await response.json();

      setReviews((current) =>
        current.map((review) =>
          review.task_id === taskId
            ? {
                ...review,
                status: result.status,
              }
            : review,
        ),
      );

      setSuccessTaskId(taskId);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to mark this task Completed.",
      );
    } finally {
      setCompletingTaskId("");
    }
  }

  return (
    <main className="min-h-screen bg-[#171717] p-5 text-black">
      <div className="mx-auto min-h-[700px] max-w-6xl overflow-hidden rounded-2xl bg-white">
        <header className="flex items-center justify-between border-b-2 border-[#747474] px-7 py-4">
          <div className="flex h-[71px] w-[71px] items-center justify-center bg-[#d9d9d9] text-xl font-semibold">
            IMS
          </div>

          <div className="flex items-center gap-4">
            <div className="h-[55px] w-[55px] rounded-full bg-[#d9d9d9]" />

            <span className="text-xl font-semibold tracking-[-0.4px]">
              Mentor
            </span>
          </div>
        </header>

        <nav className="flex gap-2 border-b border-gray-300 bg-gray-50 px-7 py-2">
          <Link
            to="/mentor/tasks/assign"
            className="rounded-lg px-4 py-2 text-sm text-gray-600"
          >
            Assign Task
          </Link>

          <Link
            to="/mentor/review"
            className="rounded-lg bg-[#3f3d3d] px-4 py-2 text-sm font-medium text-white"
          >
            Review Progress
          </Link>
        </nav>

        <section className="px-8 py-8">
          <h1 className="text-2xl font-semibold">Review Progress</h1>

          <p className="mt-2 text-sm text-gray-500">
            Review Intern task submissions and Weekly Progress.
          </p>

          {!loading && !error && (
            <div className="mt-7 grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
              <div className="rounded-lg border border-gray-300 p-4">
                <p className="text-xs text-gray-500">Total Tasks</p>
                <p className="mt-1 text-2xl font-semibold">
                  {summary.total}
                </p>
              </div>

              <div className="rounded-lg border border-gray-300 p-4">
                <p className="text-xs text-gray-500">Assigned</p>
                <p className="mt-1 text-2xl font-semibold">
                  {summary.assigned}
                </p>
              </div>

              <div className="rounded-lg border border-gray-300 p-4">
                <p className="text-xs text-gray-500">In Progress</p>
                <p className="mt-1 text-2xl font-semibold">
                  {summary.inProgress}
                </p>
              </div>

              <div className="rounded-lg border border-gray-300 p-4">
                <p className="text-xs text-gray-500">Submitted</p>
                <p className="mt-1 text-2xl font-semibold">
                  {summary.submitted}
                </p>
              </div>

              <div className="rounded-lg border border-gray-300 p-4">
                <p className="text-xs text-gray-500">Completed</p>
                <p className="mt-1 text-2xl font-semibold">
                  {summary.completed}
                </p>
              </div>

              <div className="rounded-lg border border-gray-300 p-4">
                <p className="text-xs text-gray-500">Overdue</p>
                <p className="mt-1 text-2xl font-semibold">
                  {summary.overdue}
                </p>
              </div>

              <div className="rounded-lg border border-gray-300 p-4">
                <p className="text-xs text-gray-500">Due Today</p>
                <p className="mt-1 text-2xl font-semibold">
                  {summary.dueToday}
                </p>
              </div>
            </div>
          )}

          <div className="mt-7">
            <label
              htmlFor="intern-filter"
              className="mb-2 block text-sm font-medium text-gray-600"
            >
              Intern Name
            </label>

            <select
              id="intern-filter"
              value={selectedInternId}
              onChange={(event) =>
                setSelectedInternId(event.target.value)
              }
              disabled={loading || internOptions.length === 0}
              className="w-full rounded-md border border-gray-300 bg-gray-50 px-4 py-3 outline-none focus:border-gray-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {internOptions.length === 0 && (
                <option value="">No Intern available</option>
              )}

              {internOptions.map((intern) => (
                <option key={intern.id} value={intern.id}>
                  {intern.name}
                </option>
              ))}
            </select>
          </div>

          {loading && (
            <div className="mt-6 rounded-lg border border-gray-300 p-5 text-gray-600">
              Loading submission reviews...
            </div>
          )}

          {error && (
            <div className="mt-6 rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {!loading &&
            !error &&
            selectedInternId &&
            filteredReviews.length === 0 && (
              <div className="mt-6 rounded-lg border border-gray-300 p-5 text-gray-600">
                No tasks are available for the selected Intern.
              </div>
            )}

          {!loading && filteredReviews.length > 0 && (
            <div className="mt-8">
              <h2 className="text-lg font-semibold">
                Task Submission Review
              </h2>

              <div className="mt-4 space-y-6">
                {filteredReviews.map((review) => {
                  const hasSubmission = Boolean(review.submission_id);

                  const canComplete =
                    review.status === "Submitted" && hasSubmission;

                  const completed = review.status === "Completed";

                  return (
                    <article
                      key={review.task_id}
                      className="overflow-hidden rounded-xl border border-gray-300 bg-white"
                    >
                      <div className="border-b border-gray-200 bg-gray-50 px-5 py-4">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div>
                            <p className="text-xs text-gray-400">
                              {review.task_id.slice(0, 8)}
                            </p>

                            <h3 className="mt-1 text-lg font-semibold">
                              {review.title}
                            </h3>

                            <p className="mt-1 text-sm text-gray-500">
                              Intern: {review.intern_name}
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`rounded-md border px-3 py-1 text-sm ${getStatusClasses(
                                review.status,
                              )}`}
                            >
                              {review.status}
                            </span>

                            <span
                              className={`rounded-md border px-3 py-1 text-sm ${getPriorityClasses(
                                review.priority,
                              )}`}
                            >
                              {review.priority || "No"} priority
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-5 px-5 py-5">
                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <p className="text-xs uppercase tracking-wide text-gray-400">
                              Due date
                            </p>

                            <p className="mt-1 text-sm text-gray-700">
                              {review.due_date
                                ? new Date(
                                    review.due_date,
                                  ).toLocaleDateString()
                                : "No due date"}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs uppercase tracking-wide text-gray-400">
                              Submitted
                            </p>

                            <p className="mt-1 text-sm text-gray-700">
                              {review.submitted_at
                                ? new Date(
                                    review.submitted_at,
                                  ).toLocaleString()
                                : "Not yet submitted"}
                            </p>
                          </div>
                        </div>

                        {review.task_description && (
                          <div>
                            <p className="text-sm font-medium text-gray-600">
                              Task Description
                            </p>

                            <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700">
                              {review.task_description}
                            </p>
                          </div>
                        )}

                        {!hasSubmission && (
                          <div className="rounded-lg border border-gray-300 bg-gray-50 px-4 py-4 text-sm text-gray-600">
                            Not yet submitted for review.
                          </div>
                        )}

                        {hasSubmission && (
                          <>
                            <div>
                              <p className="text-sm font-medium text-gray-600">
                                Description
                              </p>

                              <div className="mt-2 min-h-20 rounded-md border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-700">
                                {review.submission_description ||
                                  "No submission description provided."}
                              </div>
                            </div>

                            <div>
                              <p className="text-sm font-medium text-gray-600">
                                Attachment
                              </p>

                              <div className="mt-2 rounded-md border border-gray-300 bg-gray-50 px-4 py-3 text-sm">
                                {review.attachment_url &&
                                review.file_name ? (
                                  <a
                                    href={review.attachment_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="font-medium text-blue-700 underline"
                                  >
                                    {review.file_name}
                                  </a>
                                ) : review.file_url ? (
                                  <span className="text-amber-700">
                                    Attachment unavailable.
                                  </span>
                                ) : (
                                  <span className="text-gray-500">
                                    No attachment provided.
                                  </span>
                                )}
                              </div>
                            </div>
                          </>
                        )}

                        {canComplete && (
                          <div className="flex justify-end">
                            <button
                              type="button"
                              disabled={
                                completingTaskId === review.task_id
                              }
                              onClick={() =>
                                void handleComplete(review.task_id)
                              }
                              className="rounded-xl bg-[#3f3d3d] px-6 py-3 font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {completingTaskId === review.task_id
                                ? "Marking Completed..."
                                : "Mark Completed"}
                            </button>
                          </div>
                        )}

                        {(completed ||
                          successTaskId === review.task_id) && (
                          <div className="rounded-md border border-green-300 bg-green-50 px-4 py-4 text-sm text-green-700">
                            ✓ This task has been marked Completed.

                          </div>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mt-10 border-t border-gray-200 pt-8">
            <div>
              <h2 className="text-lg font-semibold">
                Weekly Progress
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Review the selected Intern&apos;s submitted Weekly
                Progress.
              </p>
            </div>

            {!selectedInternId && !loading && (
              <div className="mt-4 rounded-xl border border-gray-300 bg-gray-50 px-5 py-5">
                <p className="text-sm text-gray-600">
                  Select an Intern to view Weekly Progress.
                </p>
              </div>
            )}

            {weeklyLoading && (
              <div className="mt-4 rounded-xl border border-gray-300 bg-gray-50 px-5 py-5">
                <p className="text-sm text-gray-600">
                  Loading Weekly Progress...
                </p>
              </div>
            )}

            {weeklyError && (
              <div className="mt-4 rounded-xl border border-red-300 bg-red-50 px-5 py-5">
                <p className="text-sm text-red-700">
                  {weeklyError}
                </p>
              </div>
            )}

            {!weeklyLoading &&
              !weeklyError &&
              selectedInternId &&
              weeklyProgress.length === 0 && (
                <div className="mt-4 rounded-xl border border-gray-300 bg-gray-50 px-5 py-5">
                  <p className="font-medium text-gray-700">
                    No progress submitted yet.
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    Check back after the Intern&apos;s next submission.
                  </p>
                </div>
              )}

            {!weeklyLoading &&
              !weeklyError &&
              weeklyProgress.length > 0 && (
                <div className="mt-4 space-y-4">
                  {weeklyProgress.map((progress) => (
                    <article
                      key={progress.id}
                      className="rounded-xl border border-gray-300 bg-white p-5"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 pb-4">
                        <div>
                          <p className="text-xs uppercase tracking-wide text-gray-400">
                            Reporting week
                          </p>

                          <p className="mt-1 font-semibold">
                            {formatReportingWeek(
                              progress.reporting_week,
                            )}
                          </p>
                        </div>

                        <span className="rounded-md border border-green-300 bg-green-50 px-3 py-1 text-sm text-green-700">
                          Submitted
                        </span>
                      </div>

                      <div className="mt-5 space-y-5">
                        <div>
                          <p className="text-sm font-medium text-gray-600">
                            Accomplishments
                          </p>

                          <div className="mt-2 rounded-md border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-700">
                            <p className="whitespace-pre-wrap">
                              {progress.accomplishments}
                            </p>
                          </div>
                        </div>

                        <div>
                          <p className="text-sm font-medium text-gray-600">
                            Blockers
                          </p>

                          <div className="mt-2 rounded-md border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-700">
                            <p className="whitespace-pre-wrap">
                              {progress.blockers}
                            </p>
                          </div>
                        </div>

                        <div>
                          <p className="text-sm font-medium text-gray-600">
                            Next steps
                          </p>

                          <div className="mt-2 rounded-md border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-700">
                            <p className="whitespace-pre-wrap">
                              {progress.next_steps}
                            </p>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
          </div>
        </section>
      </div>
    </main>
  );
}
