import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";

type Task = {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  status: string;
  priority: string | null;
  assigned_intern_id: string;
  assigned_by_mentor_id: string;
  reference_file_url: string | null;
  reference_file_name: string | null;
  reference_attachment_url: string | null;
  created_at: string;
  updated_at: string;
};

type AssignmentPerson = {
  id: string;
  email: string;
  role: string;
  first_name: string | null;
  last_name: string | null;
  name: string;
};

type SubmissionResponse = {
  submission: {
    id: string;
    task_id: string;
    submitted_by_intern_id: string;
    description: string | null;
    file_url: string | null;
    created_at: string;
    updated_at: string;
    submitted_at: string;
  };
  task: {
    id: string;
    status: string;
    updated_at: string;
  };
};

const TEST_INTERN_ID = "ba89ecd4-3972-4eaf-bcc2-9c077d56204a";

export function meta() {
  return [
    { title: "Task Detail | IMS" },
    { name: "description", content: "View Intern task details" },
  ];
}

function formatDate(value: string | null) {
  if (!value) {
    return "No due date";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "No due date";
  }

  return new Intl.DateTimeFormat("en-AU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function priorityClasses(priority: string | null) {
  switch (priority) {
    case "High":
      return "border-red-300 bg-red-50 text-red-700";
    case "Medium":
      return "border-amber-300 bg-amber-50 text-amber-700";
    case "Low":
      return "border-green-300 bg-green-50 text-green-700";
    default:
      return "border-gray-300 bg-gray-50 text-gray-700";
  }
}

export default function InternTaskDetail() {
  const { taskId } = useParams();

  const [task, setTask] = useState<Task | null>(null);
  const [assignmentPeople, setAssignmentPeople] = useState<
    AssignmentPerson[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submissionDescription, setSubmissionDescription] = useState("");
  const [submissionFile, setSubmissionFile] = useState<File | null>(null);
  const [submissionError, setSubmissionError] = useState("");
  const [submissionSuccess, setSubmissionSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadTask() {
      if (!taskId) {
        setError("Task ID is missing.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");
      setTask(null);

      try {
        const [taskResponse, peopleResponse] = await Promise.all([
          fetch(
            `http://localhost:3000/tasks/intern/${TEST_INTERN_ID}/${taskId}`,
          ),
          fetch("http://localhost:3000/tasks/assignment-people"),
        ]);

        if (!taskResponse.ok) {
          const result = await taskResponse.json().catch(() => null);

          throw new Error(result?.message || "Unable to load task.");
        }

        const taskResult: Task = await taskResponse.json();
        setTask(taskResult);

        if (peopleResponse.ok) {
          const peopleResult: AssignmentPerson[] =
            await peopleResponse.json();

          setAssignmentPeople(peopleResult);
        } else {
          setAssignmentPeople([]);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Unable to load task.",
        );
      } finally {
        setLoading(false);
      }
    }

    void loadTask();
  }, [taskId]);

  async function handleStartTask() {
    if (!taskId || !task) {
      return;
    }

    setStarting(true);
    setError("");

    try {
      const response = await fetch(
        `http://localhost:3000/tasks/intern/${TEST_INTERN_ID}/${taskId}/start`,
        {
          method: "PATCH",
        },
      );

      if (!response.ok) {
        const result = await response.json().catch(() => null);

        throw new Error(result?.message || "Unable to start task.");
      }

      const updatedTask: Task = await response.json();

      setTask((currentTask) =>
        currentTask
          ? {
              ...currentTask,
              ...updatedTask,
              reference_file_url: currentTask.reference_file_url,
              reference_file_name: currentTask.reference_file_name,
              reference_attachment_url:
                currentTask.reference_attachment_url,
            }
          : updatedTask,
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to start task.",
      );
    } finally {
      setStarting(false);
    }
  }

  async function handleSubmitTask() {
    if (!taskId || !task) {
      return;
    }

    setSubmissionError("");
    setSubmissionSuccess("");

    if (!submissionDescription.trim() && !submissionFile) {
      setSubmissionError(
        "Please provide a submission description or attach a file.",
      );
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();

      if (submissionDescription.trim()) {
        formData.append("description", submissionDescription.trim());
      }

      if (submissionFile) {
        formData.append("file", submissionFile);
      }

      const response = await fetch(
        `http://localhost:3000/tasks/intern/${TEST_INTERN_ID}/${taskId}/submission`,
        {
          method: "POST",
          body: formData,
        },
      );

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(result?.message || "Unable to submit task.");
      }

      const submissionResult = result as SubmissionResponse;

      setTask((currentTask) =>
        currentTask
          ? {
              ...currentTask,
              status: submissionResult.task.status,
              updated_at: submissionResult.task.updated_at,
            }
          : currentTask,
      );

      setSubmissionDescription("");
      setSubmissionFile(null);
      setSubmissionSuccess("Task submitted successfully.");
    } catch (err) {
      setSubmissionError(
        err instanceof Error ? err.message : "Unable to submit task.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  const assignedByPerson = task
    ? assignmentPeople.find(
        (person) => person.id === task.assigned_by_mentor_id,
      )
    : undefined;

  const assignedByName =
    assignedByPerson?.name ||
    assignedByPerson?.email ||
    "Unknown Mentor";

  return (
    <main className="min-h-screen bg-[#171717] p-4 text-gray-900">
      <div className="mx-auto min-h-[calc(100vh-2rem)] max-w-6xl overflow-hidden rounded-2xl bg-white">
        <header className="flex items-center justify-between border-b border-gray-500 px-8 py-5">
          <div className="flex h-20 w-20 items-center justify-center bg-gray-200 text-2xl font-bold">
            IMS
          </div>

          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-gray-200" />
            <span className="text-2xl font-bold">Intern</span>
          </div>
        </header>

        <nav className="flex gap-2 border-b border-gray-200 bg-gray-50 px-8 py-3">
          <Link
            to="/intern/workspace"
            className="px-4 py-2 text-sm text-gray-600"
          >
            Workspace
          </Link>

          <Link
            to="/intern/tasks"
            className="rounded-xl bg-gray-700 px-4 py-2 text-sm font-medium text-white"
          >
            My Tasks
          </Link>

          <Link
            to="/intern/weekly-progress"
            className="px-4 py-2 text-sm text-gray-600"
          >
            Weekly Progress
          </Link>
        </nav>

        <div className="px-10 py-8">
          <Link
            to="/intern/tasks"
            className="mb-5 inline-block rounded-lg border border-gray-400 bg-gray-50 px-4 py-2 text-sm font-medium hover:bg-gray-100"
          >
            ← My Tasks
          </Link>

          <h1 className="mb-6 text-2xl font-semibold">Task Detail</h1>

          {loading && (
            <p className="text-sm text-gray-500">Loading task...</p>
          )}

          {error && (
            <div className="mb-6 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {!loading && task && (
            <>
              <section className="rounded-xl border border-gray-300 p-6">
                <div className="mb-5">
                  <p className="mb-2 text-xs text-gray-400">
                    {task.id.slice(0, 8)}
                  </p>

                  <h2 className="text-xl font-semibold">{task.title}</h2>
                </div>

                <p className="mb-6 text-sm text-gray-700">
                  {task.description || "No description provided."}
                </p>

                <div className="mb-5 space-y-2 text-sm text-gray-600">
                  <p>Due {formatDate(task.due_date)}</p>
                  <p>Assigned by {assignedByName}</p>
                </div>

                {task.reference_file_url && (
                  <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <p className="mb-2 text-sm font-medium text-gray-700">
                      Reference attachment
                    </p>

                    {task.reference_attachment_url ? (
                      <a
                        href={task.reference_attachment_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                      >
                        {task.reference_file_name || "Open attachment"}
                      </a>
                    ) : (
                      <p className="text-sm text-gray-500">
                        Attachment unavailable
                      </p>
                    )}
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap gap-3">
                    <span className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm">
                      {task.status}
                    </span>

                    <span
                      className={`rounded-lg border px-4 py-2 text-sm ${priorityClasses(
                        task.priority,
                      )}`}
                    >
                      {task.priority || "No"} priority
                    </span>
                  </div>

                  {task.status === "Assigned" && (
                    <button
                      type="button"
                      onClick={handleStartTask}
                      disabled={starting}
                      className="rounded-lg bg-gray-700 px-5 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {starting ? "Starting..." : "Start task"}
                    </button>
                  )}
                </div>

                <p className="mt-4 text-xs text-gray-400">
                  Assigned tasks can be started by the Intern. In Progress
                  tasks can be submitted for Mentor review.
                </p>
              </section>

              <section className="mt-6 rounded-xl border border-gray-300 p-6">
                <h2 className="mb-3 text-lg font-semibold">
                  Task Submission
                </h2>

                {task.status === "Assigned" && (
                  <p className="text-sm text-gray-500">
                    Start this task before submitting your work.
                  </p>
                )}

                {task.status === "In Progress" && (
                  <div className="space-y-5">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Submission description
                      </label>

                      <textarea
                        value={submissionDescription}
                        onChange={(event) =>
                          setSubmissionDescription(event.target.value)
                        }
                        placeholder="Describe the work you completed..."
                        className="min-h-32 w-full resize-y rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-gray-500"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Attach file
                      </label>

                      <input
                        type="file"
                        onChange={(event) =>
                          setSubmissionFile(
                            event.target.files?.[0] ?? null,
                          )
                        }
                        className="block w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-sm"
                      />

                      {submissionFile && (
                        <p className="mt-2 text-xs text-gray-500">
                          Selected: {submissionFile.name}
                        </p>
                      )}
                    </div>

                    {submissionError && (
                      <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {submissionError}
                      </div>
                    )}

                    {submissionSuccess && (
                      <div className="rounded-lg border border-green-300 bg-green-50 px-4 py-3 text-sm text-green-700">
                        ✓ {submissionSuccess}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={handleSubmitTask}
                      disabled={submitting}
                      className="rounded-lg bg-gray-700 px-5 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {submitting ? "Submitting..." : "Submit task"}
                    </button>
                  </div>
                )}

                {task.status === "Submitted" && (
                  <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                    ✓ This task has been submitted for Mentor review.
                  </div>
                )}

                {task.status === "Completed" && (
                  <div className="rounded-lg border border-green-300 bg-green-50 px-4 py-3 text-sm text-green-700">
                    ✓ This task has been marked Completed.
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </div>
    </main>
  );
}