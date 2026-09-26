import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { Link } from "react-router";

type TaskFormData = {
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

const initialForm: TaskFormData = {
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
  const [form, setForm] = useState<TaskFormData>(initialForm);
  const [people, setPeople] = useState<AssignmentPerson[]>([]);
  const [referenceFile, setReferenceFile] = useState<File | null>(null);
  const [loadingPeople, setLoadingPeople] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

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

    void loadPeople();
  }, []);

  // Temporary Team 40 test identities for DEV/integration work.
  // Final signed-in identity will come from shared authentication/RBAC.
  const currentMentor =
    people.find(
      (person) => person.role.trim().toLowerCase() === "mentor",
    ) ?? null;

  const interns = people.filter(
    (person) => person.role.trim().toLowerCase() === "intern",
  );

  function updateField(field: keyof TaskFormData, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleReferenceFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setReferenceFile(file);
  }

  function removeReferenceFile() {
    setReferenceFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
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
      const payload = new FormData();

      payload.append("title", form.title.trim());
      payload.append("description", form.description.trim());
      payload.append("due_date", form.due_date);
      payload.append("priority", form.priority);
      payload.append("assigned_intern_id", form.assigned_intern_id);
      payload.append("assigned_by_mentor_id", currentMentor.id);

      if (referenceFile) {
        payload.append("reference_file", referenceFile);
      }

      const response = await fetch("http://localhost:3000/tasks", {
        method: "POST",
        body: payload,
      });

      if (!response.ok) {
        const result = await response.json().catch(() => null);

        const message = Array.isArray(result?.message)
          ? result.message.join(", ")
          : result?.message;

        throw new Error(message || "Unable to assign task.");
      }

      await response.json();

      const selectedIntern = interns.find(
        (person) => person.id === form.assigned_intern_id,
      );

      setSuccess(
        `Task assigned to ${selectedIntern?.name ?? "Intern"} (${form.priority} priority).`,
      );

      setForm(initialForm);
      setReferenceFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
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
        <header className="flex items-center justify-between border-b border-gray-500 px-8 py-5">
          <div className="flex h-20 w-20 items-center justify-center bg-gray-200 text-2xl font-bold">
            IMS
          </div>

          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-gray-200" />
            <span className="text-2xl font-bold">Mentor</span>
          </div>
        </header>

        <nav className="flex gap-2 border-b border-gray-200 bg-gray-50 px-8 py-3">
          <Link
            to="/mentor/tasks/assign"
            className="rounded-xl bg-gray-700 px-4 py-2 text-sm font-medium text-white"
          >
            Assign Task
          </Link>

          <Link
            to="/mentor/review"
            className="rounded-xl px-4 py-2 text-sm text-gray-600"
          >
            Review Progress
          </Link>
        </nav>

        <div className="px-10 py-8">
          <div className="mb-8">
            <h1 className="text-xl font-medium">Assign task</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
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

            <div>
              <label className="mb-2 block text-sm text-gray-600">
                Reference file (optional)
              </label>

              <input
                ref={fileInputRef}
                type="file"
                onChange={handleReferenceFile}
                className="hidden"
              />

              {!referenceFile ? (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-md border border-gray-300 bg-white px-4 py-3 text-sm text-gray-600 hover:bg-gray-50"
                >
                  + Add attachment
                </button>
              ) : (
                <div className="flex items-center justify-between rounded-md border border-gray-300 bg-gray-50 px-4 py-3">
                  <span className="truncate text-sm text-gray-700">
                    {referenceFile.name}
                  </span>

                  <button
                    type="button"
                    onClick={removeReferenceFile}
                    className="ml-4 text-sm text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

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

            <div>
              <label className="mb-2 block text-sm text-gray-600">
                Assigned intern *
              </label>

              <select
                value={form.assigned_intern_id}
                onChange={(e) =>
                  updateField("assigned_intern_id", e.target.value)
                }
                disabled={loadingPeople || interns.length === 0}
                className="w-full rounded-md border border-gray-300 bg-gray-50 px-4 py-3 outline-none focus:border-gray-500 disabled:opacity-50"
              >
                <option value="">
                  {loadingPeople
                    ? "Loading interns..."
                    : interns.length === 0
                      ? "No Intern accounts available"
                      : "Select an intern..."}
                </option>

                {interns.map((person) => (
                  <option key={person.id} value={person.id}>
                    {person.name}
                  </option>
                ))}
              </select>

              <p className="mt-2 text-xs text-gray-400">
                Temporary Team 40 Intern accounts are used for current DEV
                integration testing.
              </p>
            </div>

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

            <div>
              <label className="mb-2 block text-sm text-gray-600">
                Assigned by
              </label>

              <div className="w-full rounded-md border border-gray-300 bg-gray-50 px-4 py-3 text-gray-600">
                {loadingPeople
                  ? "Loading..."
                  : currentMentor
                    ? `${currentMentor.name} (you)`
                    : "No Mentor account available"}
              </div>
            </div>

            {error && (
              <div className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={
                  submitting ||
                  loadingPeople ||
                  !currentMentor ||
                  interns.length === 0
                }
                className="rounded-xl bg-gray-700 px-6 py-3 font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? "Assigning..." : "Assign task"}
              </button>
            </div>

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