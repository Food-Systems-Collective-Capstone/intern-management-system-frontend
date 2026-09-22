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

export function meta() {
  return [
    { title: "Review Progress | IMS" },
    {
      name: "description",
      content: "Review Intern task submissions and confirm completion",
    },
  ];
}

function getPriorityClasses(priority: string | null) {
  switch (priority) {
    case "High":
      return "border-red-300 bg-red-50 text-red-700";
    case "Medium":
      return "border-amber-300 bg-amber-50 text-amber-700";
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
    default:
      return "border-gray-300 bg-gray-50 text-gray-600";
  }
}

export default function MentorReviewProgress() {
  const [people, setPeople] = useState<AssignmentPerson[]>([]);
  const [reviews, setReviews] = useState<MentorSubmissionReview[]>([]);
  const [selectedInternId, setSelectedInternId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successTaskId, setSuccessTaskId] = useState("");
  const [completingTaskId, setCompletingTaskId] = useState("");

  // Temporary until shared authentication/RBAC provides the signed-in Mentor.
  // This matches the current Mentor Task Assignment implementation.
  const currentMentor = people[0] ?? null;

  useEffect(() => {
    async function loadReviewData() {
      try {
        setLoading(true);
        setError("");

        const peopleResponse = await fetch(
          "http://localhost:3000/tasks/assignment-people",
        );

        if (!peopleResponse.ok) {
          throw new Error("Unable to load account information.");
        }

        const peopleResult: AssignmentPerson[] =
          await peopleResponse.json();

        setPeople(peopleResult);

        const mentor = peopleResult[0];

        if (!mentor) {
          throw new Error("Mentor account information is not available.");
        }

        const reviewsResponse = await fetch(
          `http://localhost:3000/tasks/mentor/${mentor.id}/reviews`,
        );

        if (!reviewsResponse.ok) {
          const result = await reviewsResponse.json().catch(() => null);

          throw new Error(
            result?.message || "Unable to load submission reviews.",
          );
        }

        const reviewsResult: MentorSubmissionReview[] =
          await reviewsResponse.json();

        setReviews(reviewsResult);
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
    const uniqueInterns = new Map<
      string,
      { id: string; name: string; email: string }
    >();

    reviews.forEach((review) => {
      if (!uniqueInterns.has(review.assigned_intern_id)) {
        uniqueInterns.set(review.assigned_intern_id, {
          id: review.assigned_intern_id,
          name: review.intern_name,
          email: review.intern_email,
        });
      }
    });

    return Array.from(uniqueInterns.values()).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
  }, [reviews]);

  const filteredReviews = useMemo(() => {
    if (!selectedInternId) {
      return reviews;
    }

    return reviews.filter(
      (review) => review.assigned_intern_id === selectedInternId,
    );
  }, [reviews, selectedInternId]);

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
        `http://localhost:3000/tasks/mentor/${currentMentor.id}/${taskId}/complete`,
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
      <div className="mx-auto min-h-[700px] max-w-5xl overflow-hidden rounded-2xl bg-white">
        {/* Header */}
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

        {/* Navigation */}
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

        {/* Content */}
        <section className="px-8 py-8">
          <h1 className="text-xl font-medium">Review Progress</h1>

          <p className="mt-2 text-sm text-gray-500">
            Review Intern task submissions and confirm completed work.
          </p>

          {/* Intern filter */}
          <div className="mt-7">
            <label
              htmlFor="intern-filter"
              className="mb-2 block text-sm text-gray-600"
            >
              Intern Name
            </label>

            <select
              id="intern-filter"
              value={selectedInternId}
              onChange={(event) => setSelectedInternId(event.target.value)}
              className="w-full rounded-md border border-gray-300 bg-gray-50 px-4 py-3 outline-none focus:border-gray-500"
            >
              <option value="">All interns</option>

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

          {!loading && !error && filteredReviews.length === 0 && (
            <div className="mt-6 rounded-lg border border-gray-300 p-5 text-gray-600">
              No tasks are available for the selected Intern.
            </div>
          )}

          {!loading && filteredReviews.length > 0 && (
            <div className="mt-7 space-y-6">
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

                          <h2 className="mt-1 text-lg font-semibold">
                            {review.title}
                          </h2>

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
                      <div>
                        <h3 className="text-base font-semibold">
                          Task Submission Review
                        </h3>
                      </div>

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
                              {review.attachment_url && review.file_name ? (
                                <a
                                  href={review.attachment_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="font-medium text-blue-700 underline"
                                >
                                  {review.file_name}
                                </a>
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
                            disabled={completingTaskId === review.task_id}
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
                          This task has been marked Completed.
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {/* Weekly Progress intentionally remains separate from this task. */}
          <div className="mt-8 rounded-xl border border-gray-300 bg-gray-50 px-5 py-5">
            <h2 className="font-semibold">Weekly Progress</h2>

            <p className="mt-2 text-sm text-gray-500">
              Weekly Progress review will be available in the separate Weekly
              Progress workflow.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}