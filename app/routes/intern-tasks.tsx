import { useEffect, useState } from "react";
import { Link } from "react-router";
import { apiFetch } from "../lib/api";
import { requireRole } from "../lib/route-auth";

export async function clientLoader() {
  await requireRole("intern", "/intern/tasks");
  return null;
}

clientLoader.hydrate = true as const;

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

type CurrentUser = {
  id: string;
  email: string;
  role: string;
  first_name: string | null;
  last_name: string | null;
  name: string;
};

export function meta() {
  return [
    { title: "My Tasks | IMS" },
    { name: "description", content: "View assigned Intern tasks" },
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
    case "Assigned":
      return "border-gray-300 bg-gray-50 text-gray-600";
    case "In Progress":
      return "border-blue-300 bg-blue-50 text-blue-700";
    case "Submitted":
      return "border-purple-300 bg-purple-50 text-purple-700";
    case "Completed":
      return "border-green-300 bg-green-50 text-green-700";
    default:
      return "border-gray-300 bg-gray-50 text-gray-600";
  }
}

export default function InternTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadTasks() {
      try {
        const userResponse = await apiFetch("/tasks/me");
        const user: CurrentUser = await userResponse.json();

        if (user.role.trim().toLowerCase() !== "intern") {
          throw new Error("The signed-in account is not an Intern.");
        }

        setCurrentUser(user);

        const response = await apiFetch(`/tasks/intern/${user.id}`);

        const result: Task[] = await response.json();
        setTasks(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load tasks.");
      } finally {
        setLoading(false);
      }
    }

    void loadTasks();
  }, []);

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
              {currentUser?.name || "Intern"}
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
            className="rounded-lg bg-[#3f3d3d] px-4 py-2 text-sm font-medium text-white"
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
          <h1 className="mb-5 text-xl font-medium">My Tasks</h1>

          {loading && (
            <div className="rounded-lg border border-gray-300 p-5 text-gray-600">
              Loading tasks...
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-700">
              {error}
            </div>
          )}

          {!loading && !error && tasks.length === 0 && (
            <div className="rounded-lg border border-gray-300 p-5 text-gray-600">
              You currently have no assigned tasks.
            </div>
          )}

          {!loading && !error && tasks.length > 0 && (
            <div className="space-y-4">
              {tasks.map((task) => (
                <Link
                  key={task.id}
                  to={`/intern/tasks/${task.id}`}
                  className="block rounded-lg border border-gray-300 bg-white p-4 transition hover:bg-gray-50"
                >
                  <div className="flex items-start justify-between gap-6">
                    <div>
                      <p className="text-xs text-gray-400">
                        {task.id.slice(0, 8)}
                      </p>

                      <h2 className="mt-1 text-base font-semibold">
                        {task.title}
                      </h2>

                      <p className="mt-2 text-sm text-gray-400">
                        Due{" "}
                        {task.due_date
                          ? new Date(task.due_date).toLocaleDateString()
                          : "No due date"}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <span
                        className={`rounded-md border px-3 py-1 text-sm ${getStatusClasses(
                          task.status,
                        )}`}
                      >
                        {task.status}
                      </span>

                      <span
                        className={`rounded-md border px-3 py-1 text-sm ${getPriorityClasses(
                          task.priority,
                        )}`}
                      >
                        {task.priority || "No"} priority
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
