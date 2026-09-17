import { useState, type FormEvent } from "react";

type FormData = {
  title: string;
  description: string;
  due_date: string;
  priority: string;
  assigned_intern_id: string;
  assigned_by_mentor_id: string;
};

const initialForm: FormData = {
  title: "",
  description: "",
  due_date: "",
  priority: "Medium",
  assigned_intern_id: "",
  assigned_by_mentor_id: "",
};

export function meta() {
  return [
    { title: "Assign Task | IMS" },
    { name: "description", content: "Assign a task to an intern" },
  ];
}

export default function MentorTaskAssignment() {
  const [form, setForm] = useState<FormData>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

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
      !form.priority ||
      !form.assigned_intern_id.trim() ||
      !form.assigned_by_mentor_id.trim()
    ) {
      setError("Please complete all required fields.");
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
          description: form.description.trim() || undefined,
          due_date: form.due_date || undefined,
          priority: form.priority,
          assigned_intern_id: form.assigned_intern_id.trim(),
          assigned_by_mentor_id: form.assigned_by_mentor_id.trim(),
        }),
      });

      if (!response.ok) {
        const result = await response.json().catch(() => null);

        const message = Array.isArray(result?.message)
          ? result.message.join(", ")
          : result?.message;

        throw new Error(message || "Unable to assign task.");
      }

      const task = await response.json();

      setSuccess(
        `Task "${task.title}" assigned successfully with status ${task.status}.`,
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
    <main className="min-h-screen bg-gray-50 px-6 py-10 text-gray-900">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <p className="text-sm font-medium text-gray-500">
            Mentor Workspace
          </p>
          <h1 className="mt-1 text-3xl font-bold">Assign Task</h1>
          <p className="mt-2 text-gray-600">
            Create and assign a new task to an intern.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
        >
          <div>
            <label className="mb-1 block text-sm font-medium">
              Task title *
            </label>
            <input
              value={form.title}
              onChange={(e) => updateField("title", e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
              placeholder="Enter task title"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              className="min-h-28 w-full rounded-lg border border-gray-300 px-3 py-2"
              placeholder="Enter task description"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Due date
            </label>
            <input
              type="date"
              value={form.due_date}
              onChange={(e) => updateField("due_date", e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Priority *
            </label>
            <select
              value={form.priority}
              onChange={(e) => updateField("priority", e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Intern account ID *
            </label>
            <input
              value={form.assigned_intern_id}
              onChange={(e) =>
                updateField("assigned_intern_id", e.target.value)
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
              placeholder="Intern UUID"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Assigned By / Mentor account ID *
            </label>
            <input
              value={form.assigned_by_mentor_id}
              onChange={(e) =>
                updateField("assigned_by_mentor_id", e.target.value)
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
              placeholder="Mentor UUID"
            />
          </div>

          <div className="rounded-lg bg-gray-50 p-3 text-sm">
            <span className="font-medium">Initial status:</span> Assigned
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-gray-900 px-4 py-2.5 font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Assigning..." : "Assign Task"}
          </button>
        </form>
      </div>
    </main>
  );
}