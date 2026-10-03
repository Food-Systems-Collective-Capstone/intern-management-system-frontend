import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { Dropdown } from "../Dropdown";
import { AdminAccount } from "../AdminScreening/AdminAccount";
import { signOut } from "../../lib/auth";
import {
  assignMentor,
  fetchMentorAssignmentData,
  type AssignableIntern,
  type Mentor,
} from "../../lib/mentorAssignments.mock";

export function MentorAssignmentsView() {
  const [interns, setInterns] = useState<AssignableIntern[]>([]);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    fetchMentorAssignmentData()
      .then((data) => {
        if (!active) return;
        setInterns(data.interns);
        setMentors(data.mentors);
        setSelections(
          Object.fromEntries(
            data.interns.map((intern) => [intern.id, intern.mentorId ?? ""]),
          ),
        );
      })
      .catch((cause) => {
        if (active) {
          setError(
            cause instanceof Error
              ? cause.message
              : "Unable to load mentor assignments.",
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const mentorOptions = useMemo(
    () =>
      mentors.map((mentor) => ({
        value: mentor.id,
        label: mentor.name,
      })),
    [mentors],
  );

  async function saveAssignment(intern: AssignableIntern) {
    const mentorId = selections[intern.id] ?? "";
    setSuccess("");
    setError("");

    if (!mentorId) {
      setError(`Select a mentor for ${intern.name} before saving.`);
      return;
    }

    setSavingId(intern.id);
    try {
      const result = await assignMentor(intern.id, mentorId);
      setInterns((current) =>
        current.map((item) =>
          item.id === result.intern.id ? result.intern : item,
        ),
      );
      setSuccess(
        `${result.mentor.name} is now assigned to ${result.intern.name}.`,
      );
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Unable to assign mentor.",
      );
    } finally {
      setSavingId("");
    }
  }

  return (
    <main className="min-h-screen bg-white font-sans text-gray-950 md:flex">
      <aside className="flex w-full flex-col border-b border-gray-200 md:min-h-screen md:w-64 md:shrink-0 md:border-r md:border-b-0">
        <div className="flex items-center gap-3 p-6">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200 text-xs font-semibold">
            Logo
          </span>
          <span>
            <strong className="block">IMS</strong>
            <small>intern management system</small>
          </span>
        </div>
        <nav aria-label="Admin" className="mt-4">
          <div className="flex items-center gap-4 px-7 py-4 font-semibold">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-6 w-6"
            >
              <path d="m3 11 9-8 9 8v10h-7v-7h-4v7H3Z" />
            </svg>
            Dashboard
          </div>
          <Link
            to="/admin/applications"
            className="flex items-center gap-4 px-7 py-4 font-semibold hover:bg-gray-100"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-6 w-6"
            >
              <path d="M5 2h10l4 4v16H5Z" />
              <path d="M15 2v5h4M8 12h8M8 16h6" />
            </svg>
            Applications
          </Link>
          <div
            aria-current="page"
            className="bg-black px-7 py-4 font-semibold text-white"
          >
            Mentor assignments
          </div>
        </nav>
        <Link
          to="/sign-in"
          onClick={() => void signOut()}
          className="m-6 mt-auto text-sm font-semibold"
        >
          Sign out
        </Link>
      </aside>

      <section className="mx-auto w-full max-w-7xl px-5 py-7 md:px-10">
        <header className="flex justify-end">
          <AdminAccount />
        </header>

        <div className="mt-14 md:mt-16">
          <h1 className="text-3xl font-bold tracking-tight">
            Mentor Assignments
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Assign a mentor to each active intern.
          </p>
          <p className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            Prototype: assignments are stored in memory and reset when the page
            is reloaded.
          </p>
        </div>

        <div className="mt-8" aria-busy={loading}>
          {success && (
            <p
              role="status"
              className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
            >
              {success}
            </p>
          )}
          {error && (
            <p
              role="alert"
              className="mb-4 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              {error}
            </p>
          )}

          {loading ? (
            <p role="status" className="rounded-xl border p-8">
              Loading interns and mentors…
            </p>
          ) : interns.length === 0 ? (
            <p className="rounded-xl border p-8 text-center text-gray-500">
              No promoted interns are available for assignment.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full min-w-[760px] text-left">
                <thead className="bg-gray-50 text-xs font-semibold">
                  <tr>
                    <th className="px-5 py-4">Intern</th>
                    <th className="px-5 py-4">Program</th>
                    <th className="px-5 py-4">Mentor</th>
                    <th className="px-5 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {interns.map((intern) => {
                    const selectedMentorId = selections[intern.id] ?? "";
                    const unchanged = selectedMentorId === intern.mentorId;
                    const saving = savingId === intern.id;

                    return (
                      <tr key={intern.id} className="border-t border-gray-200">
                        <td className="px-5 py-4">
                          <span className="block font-semibold">
                            {intern.name}
                          </span>
                          <span className="text-xs text-gray-500">
                            {intern.email}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-sm">{intern.program}</td>
                        <td className="w-[300px] px-5 py-4">
                          <Dropdown
                            label={`Mentor for ${intern.name}`}
                            value={selectedMentorId}
                            placeholder="Select a mentor"
                            options={mentorOptions}
                            disabled={saving}
                            onChange={(event) => {
                              setSelections((current) => ({
                                ...current,
                                [intern.id]: event.target.value,
                              }));
                              setError("");
                              setSuccess("");
                            }}
                          />
                        </td>
                        <td className="px-5 py-4 text-right">
                          <button
                            type="button"
                            disabled={!selectedMentorId || unchanged || saving}
                            onClick={() => void saveAssignment(intern)}
                            className="rounded-md bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            {saving
                              ? "Saving…"
                              : intern.mentorId
                                ? "Update"
                                : "Assign"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
