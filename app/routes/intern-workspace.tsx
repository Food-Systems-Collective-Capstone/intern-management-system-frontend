import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";

type InternTask = {
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

const TEST_INTERN_ID = "ba89ecd4-3972-4eaf-bcc2-9c077d56204a";
const API_BASE_URL = "http://localhost:3000";

export function meta() {
  return [
    { title: "Intern Workspace | IMS" },
    {
      name: "description",
      content: "Intern workspace and task progress summary",
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

export default function InternWorkspace() {
  const [tasks, setTasks] = useState<InternTask[]>([]);
  const [weeklyProgress, setWeeklyProgress] =
    useState<WeeklyProgress | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const reportingWeek = useMemo(() => getLocalDateString(), []);

  useEffect(() => {
    async function loadWorkspace() {
      try {
        setLoading(true);
        setError("");

        const [tasksResponse, weeklyResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/tasks/intern/${TEST_INTERN_ID}`),
          fetch(
            `${API_BASE_URL}/weekly-progress/intern/${TEST_INTERN_ID}?reporting_week=${reportingWeek}`,
          ),
        ]);

        if (!tasksResponse.ok) {
          const result = await tasksResponse.json().catch(() => null);

          throw new Error(
            result?.message || "Unable to load Intern tasks.",
          );
        }

        if (!weeklyResponse.ok) {
          const result = await weeklyResponse.json().catch(() => null);

          throw new Error(
            result?.message || "Unable to load Weekly Progress.",
          );
        }

        const tasksResult: InternTask[] = await tasksResponse.json();

        const weeklyText = await weeklyResponse.text();

        const weeklyResult: WeeklyProgress | null = weeklyText
          ? JSON.parse(weeklyText)
          : null;

        setTasks(tasksResult);
        setWeeklyProgress(weeklyResult);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load Intern workspace.",
        );
      } finally {
        setLoading(false);
      }
    }

    void loadWorkspace();
  }, [reportingWeek]);

  const summary = useMemo(() => {
    const today = getLocalDateString();

    let assigned = 0;
    let inProgress = 0;
    let submitted = 0;
    let completed = 0;
    let overdue = 0;
    let dueToday = 0;

    tasks.forEach((task) => {
      switch (task.status) {
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

      if (!task.due_date || task.status === "Completed") {
        return;
      }

      const dueDate = task.due_date.slice(0, 10);

      if (dueDate === today) {
        dueToday += 1;
      } else if (dueDate < today) {
        overdue += 1;
      }
    });

    return {
      total: tasks.length,
      assigned,
      inProgress,
      submitted,
      completed,
      overdue,
      dueToday,
    };
  }, [tasks]);

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
              Intern⌄
            </span>
          </div>
        </header>

        <nav className="flex gap-2 border-b border-gray-300 bg-gray-50 px-7 py-2">
          <Link
            to="/intern/workspace"
            className="rounded-lg bg-[#3f3d3d] px-4 py-2 text-sm font-medium text-white"
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
            className="rounded-lg px-4 py-2 text-sm text-gray-600"
          >
            Weekly Progress
          </Link>
        </nav>

        <section className="px-8 py-8">
          <h1 className="text-2xl font-semibold">Intern Workspace</h1>

          <p className="mt-2 text-sm text-gray-500">
            View your task progress and Weekly Progress status.
          </p>

          {loading && (
            <div className="mt-7 rounded-lg border border-gray-300 p-5 text-sm text-gray-600">
              Loading workspace...
            </div>
          )}

          {error && (
            <div className="mt-7 rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {!loading && !error && (
            <>
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

              <div className="mt-8 grid gap-5 md:grid-cols-2">
                <Link
                  to="/intern/tasks"
                  className="rounded-xl border border-gray-300 bg-white p-6 transition hover:border-gray-500 hover:bg-gray-50"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-semibold">My Tasks</h2>

                      <p className="mt-2 text-sm text-gray-500">
                        View your assigned tasks, task details and
                        submissions.
                      </p>
                    </div>

                    <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium">
                      {summary.total} tasks
                    </span>
                  </div>

                  <p className="mt-6 text-sm font-medium">
                    View My Tasks →
                  </p>
                </Link>

                <Link
                  to="/intern/weekly-progress"
                  className="rounded-xl border border-gray-300 bg-white p-6 transition hover:border-gray-500 hover:bg-gray-50"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-semibold">
                        Weekly Progress
                      </h2>

                      <p className="mt-2 text-sm text-gray-500">
                        Submit your accomplishments, blockers and next
                        steps.
                      </p>
                    </div>

                    {weeklyProgress ? (
                      <span className="rounded-full border border-green-300 bg-green-50 px-3 py-1 text-sm text-green-700">
                        Submitted
                      </span>
                    ) : (
                      <span className="rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-sm text-amber-700">
                        Not submitted
                      </span>
                    )}
                  </div>

                  <p className="mt-6 text-sm text-gray-600">
                    {weeklyProgress
                      ? "Weekly Progress submitted for this reporting week."
                      : "Not submitted this week"}
                  </p>

                  <p className="mt-3 text-sm font-medium">
                    View Weekly Progress →
                  </p>
                </Link>
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}