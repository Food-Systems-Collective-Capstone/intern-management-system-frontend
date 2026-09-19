import { useEffect, useState, type FormEvent } from "react";

type FormData = {
  title: string;
  description: string;
  due_date: string;
  priority: string;
  assigned_intern_id: string;
};

type AssignmentPerson = {
  id: string;
  email: string;
  role: string;
  first_name: string | null;
  last_name: string | null;
  name: string;
};

const initialForm: FormData = {
  title: "",
  description: "",
  due_date: "",
  priority: "Medium",
  assigned_intern_id: "",
};

export function meta() {
  return [
    { title: "Assign Task | IMS" },
    { name: "description", content: "Assign a task to an intern" },
  ];
}

export default function MentorTaskAssignment() {
  const [form, setForm] = useState<FormData>(initialForm);
  const [people, setPeople] = useState<AssignmentPerson[]>([]);
  const [loadingPeople, setLoadingPeople] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadPeople() {
      try {
        const response = await fetch(
          "http://localhost:3000/tasks/assignment-people",
        );

        if (!response.ok) {
          throw new Error("Unable to load account information.");
        }

        const result: AssignmentPerson[] = await response.json();
        setPeople(result);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load account information.",
        );
      } finally {
        setLoadingPeople(false);
      }
    }

    loadPeople();
  }, []);

  // Temporary until shared authentication/RBAC provides the signed-in Mentor.
  // For now PM confirmed we can reuse the existing Team A account/profile data.
  const currentMentor = people[0] ?? null;

  function updateField(field: keyof FormData, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSuccess("");
    setError("");

    if (
      !form.title.trim() ||
      !form.description.trim() ||
      !form.due_date ||
      !form.priority ||
      !form.assigned_intern_id
    ) {
      setError("Please complete all required fields.");
      return;
    }

    if (!currentMentor) {
      setError("Mentor account information is not available.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("http://localhost:3000/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: form.title.trim(),
          description: form.description.trim(),
          due_date: form.due_date,
          priority: form.priority,
          assigned_intern_id: form.assigned_intern_id,
          assigned_by_mentor_id: currentMentor.id,
        }),
      });

      if (!response.ok) {
        const result = await response.json().catch(() => null);

        const message = Array.isArray(result?.message)
          ? result.message.join(", ")
          : result?.message;

        throw new Error(message || "Unable to assign task.");
      }

      await response.json();

      const selectedIntern = people.find(
        (person) => person.id === form.assigned_intern_id,
      );

      setSuccess(
        `Task assigned to ${selectedIntern?.name ?? "Intern"} (${form.priority} priority).`,
      );

      setForm(initialForm);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to assign task.",
      );
    } finally {
      setSubmitting(false);
    }
  }

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
            <span className="text-2xl font-bold">Mentor</span>
          </div>
        </header>

        {/* Mentor navigation */}
        <nav className="flex gap-2 border-b border-gray-200 bg-gray-50 px-8 py-3">
          <span className="rounded-xl bg-gray-700 px-4 py-2 text-sm font-medium text-white">
            Assign Task
          </span>

          <span className="px-4 py-2 text-sm text-gray-600">
            Review Progress
          </span>
        </nav>

        {/* Page */}
        <div className="px-10 py-8">
          <div className="mb-8">
            <h1 className="text-xl font-medium">Assign task</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Task title */}
            <div>
              <label className="mb-2 block text-sm text-gray-600">
                Task title *
              </label>

              <input
                value={form.title}
                onChange={(e) => updateField("title", e.target.value)}
                className="w-full rounded-md border border-gray-300 bg-gray-50 px-4 py-3 outline-none focus:border-gray-500"
              />
            </div>

            {/* Description */}
            <div>
              <label className="mb-2 block text-sm text-gray-600">
                Description *
              </label>

              <textarea
                value={form.description}
                onChange={(e) =>
                  updateField("description", e.target.value)
                }
                className="min-h-24 w-full resize-y rounded-md border border-gray-300 bg-gray-50 px-4 py-3 outline-none focus:border-gray-500"
              />
            </div>

            {/* Due date */}
            <div>
              <label className="mb-2 block text-sm text-gray-600">
                Due date *
              </label>

              <input
                id="due-date"
                type="date"
                value={form.due_date}
                onChange={(e) => updateField("due_date", e.target.value)}
                onClick={(e) => {
                  const input = e.currentTarget;

                  if ("showPicker" in input) {
                    input.showPicker();
                  }
                }}
                className="w-full cursor-pointer rounded-md border border-gray-300 bg-gray-50 px-4 py-3 outline-none focus:border-gray-500"
              />
            </div>

            {/* Assigned Intern */}
            <div>
              <label className="mb-2 block text-sm text-gray-600">
                Assigned intern *
              </label>

              <select
                value={form.assigned_intern_id}
                onChange={(e) =>
                  updateField("assigned_intern_id", e.target.value)
                }
                disabled={loadingPeople || people.length === 0}
                className="w-full rounded-md border border-gray-300 bg-gray-50 px-4 py-3 outline-none focus:border-gray-500 disabled:opacity-50"
              >
                <option value="">
                  {loadingPeople
                    ? "Loading interns..."
                    : "Select an intern..."}
                </option>

                {people.map((person) => (
                  <option key={person.id} value={person.id}>
                    {person.name}
                  </option>
                ))}
              </select>

              <p className="mt-2 text-xs text-gray-400">
                Account information is loaded from the shared IMS account and
                profile data.
              </p>
            </div>

            {/* Priority */}
            <div>
              <label className="mb-2 block text-sm text-gray-600">
                Priority
              </label>

              <div className="flex gap-3">
                {["Low", "Medium", "High"].map((priority) => (
                  <button
                    key={priority}
                    type="button"
                    onClick={() => updateField("priority", priority)}
                    className={`rounded-md border px-5 py-2 text-sm ${
                      form.priority === priority
                        ? "border-gray-700 bg-gray-700 text-white"
                        : "border-gray-300 bg-white text-gray-600"
                    }`}
                  >
                    {priority}
                  </button>
                ))}
              </div>
            </div>

            {/* Assigned By */}
            <div>
              <label className="mb-2 block text-sm text-gray-600">
                Assigned by
              </label>

              <div className="w-full rounded-md border border-gray-300 bg-gray-50 px-4 py-3 text-gray-600">
                {loadingPeople
                  ? "Loading..."
                  : currentMentor
                    ? `${currentMentor.name} (you)`
                    : "No account available"}
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Assign button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting || loadingPeople || !currentMentor}
                className="rounded-xl bg-gray-700 px-6 py-3 font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? "Assigning..." : "Assign task"}
              </button>
            </div>

            {/* Success */}
            {success && (
              <div className="rounded-md border border-green-300 bg-green-50 px-4 py-4 text-sm text-green-700">
                ✓ {success}
              </div>
            )}
          </form>
        </div>
      </div>
    </main>
  );
}