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

const TEST_INTERN_ID = "cd8ac10e-1480-4237-97aa-71120bdcdbd4";

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

          throw new Error(
            result?.message || "Unable to load task.",
          );
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

        throw new Error(
          result?.message || "Unable to start task.",
        );
      }

      const updatedTask: Task = await response.json();
      setTask(updatedTask);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to start task.",
      );
    } finally {
      setStarting(false);
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
        {/* Header */}
        <header className="flex items-center justify-between border-b border-gray-500 px-8 py-5">
          <div className="flex h-20 w-20 items-center justify-center bg-gray-200 text-2xl font-bold">
            IMS
          </div>

          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-gray-200" />
            <span className="text-2xl font-bold">Intern</span>
          </div>
        </header>

        {/* Intern navigation */}
        <nav className="flex gap-2 border-b border-gray-200 bg-gray-50 px-8 py-3">
          <span className="px-4 py-2 text-sm text-gray-600">
            Workspace
          </span>

          <Link
            to="/intern/tasks"
            className="rounded-xl bg-gray-700 px-4 py-2 text-sm font-medium text-white"
          >
            My Tasks
          </Link>

          <span className="px-4 py-2 text-sm text-gray-600">
            Weekly Progress
          </span>
        </nav>

        <div className="px-10 py-8">
          {/* Back */}
          <Link
            to="/intern/tasks"
            className="mb-5 inline-block rounded-lg border border-gray-400 bg-gray-50 px-4 py-2 text-sm font-medium hover:bg-gray-100"
          >
            ← My Tasks
          </Link>

          <div className="mb-6">
            <h1 className="text-xl font-medium">Task Detail</h1>
          </div>

          {loading && (
            <div className="rounded-lg border border-gray-200 p-8 text-sm text-gray-500">
              Loading task...
            </div>
          )}

          {error && (
            <div className="mb-5 rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {!loading && task && (
            <>
              {/* Task information */}
              <section className="rounded-lg border border-gray-300 p-6">
                <p className="mb-2 text-sm text-gray-400">
                  {task.id.slice(0, 8)}
                </p>

                <h2 className="mb-4 text-xl font-medium">
                  {task.title}
                </h2>

                <p className="mb-5 max-w-4xl text-sm leading-6 text-gray-600">
                  {task.description || "No description provided."}
                </p>

                <div className="mb-5 space-y-1 text-sm text-gray-500">
                  <p>
                    Due{" "}
                    <span className="text-gray-700">
                      {formatDate(task.due_date)}
                    </span>
                  </p>

                  <p>
                    Assigned by{" "}
                    <span className="text-gray-700">
                      {assignedByName}
                    </span>
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap gap-3">
                    <span className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm">
                      {task.status}
                    </span>

                    <span
                      className={`rounded-md border px-3 py-2 text-sm ${priorityClasses(
                        task.priority,
                      )}`}
                    >
                      {task.priority
                        ? `${task.priority} priority`
                        : "No priority"}
                    </span>
                  </div>

                  {task.status === "Assigned" && (
                    <button
                      type="button"
                      onClick={handleStartTask}
                      disabled={starting}
                      className="rounded-md bg-gray-700 px-5 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {starting ? "Starting..." : "Start task"}
                    </button>
                  )}
                </div>

                <p className="mt-4 text-xs leading-5 text-gray-400">
                  Task status for this flow is limited to Assigned → In
                  Progress. Submission and completion are handled in later
                  workflow stages.
                </p>
              </section>

              {/* Submission placeholder - not implemented in this task */}
              <section className="mt-6 flex items-center justify-between rounded-lg border border-gray-300 p-6">
                <div>
                  <h2 className="text-lg font-medium">
                    Task Submission
                  </h2>

                  <p className="mt-2 text-sm text-gray-400">
                    Submission is handled in the next implementation stage.
                  </p>
                </div>

                <button
                  type="button"
                  disabled
                  className="cursor-not-allowed rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-400"
                >
                  Add submission
                </button>
              </section>
            </>
          )}
        </div>
      </div>
    </main>
  );
}