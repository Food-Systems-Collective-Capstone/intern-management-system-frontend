import { useState } from "react";
import { useNavigate } from "react-router";
import { signOut } from "~/lib/auth";

type WorkspaceAccountMenuProps = {
  name: string;
  role: "Intern" | "Mentor";
  large?: boolean;
};

export function WorkspaceAccountMenu({
  name,
  role,
  large = false,
}: WorkspaceAccountMenuProps) {
  const navigate = useNavigate();
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState("");

  async function handleSignOut() {
    if (signingOut) return;

    try {
      setSigningOut(true);
      setError("");
      await signOut();
      void navigate("/sign-in", { replace: true });
    } catch {
      setError("Unable to sign out. Please try again.");
      setSigningOut(false);
    }
  }

  const displayName = name.trim() || role;

  return (
    <details className="group relative ml-auto">
      <summary className="flex cursor-pointer list-none items-center gap-4 rounded-md p-1 focus-visible:outline-2 focus-visible:outline-black [&::-webkit-details-marker]:hidden">
        <span
          aria-hidden="true"
          className={`flex shrink-0 items-center justify-center rounded-full bg-[#d9d9d9] text-sm font-semibold text-gray-600 ${
            large ? "h-16 w-16" : "h-[55px] w-[55px]"
          }`}
        >
          {displayName.slice(0, 2).toUpperCase()}
        </span>

        <span
          className={
            large
              ? "text-2xl font-bold"
              : "text-xl font-semibold tracking-[-0.4px]"
          }
        >
          {displayName}
        </span>

        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="h-4 w-4 transition-transform group-open:rotate-180"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </summary>

      <div className="absolute right-0 z-20 mt-1 min-w-44 rounded-md border border-gray-200 bg-white p-1 shadow-lg">
        <button
          type="button"
          disabled={signingOut}
          onClick={() => {
            void handleSignOut();
          }}
          className="w-full rounded px-3 py-2 text-left text-sm hover:bg-gray-100 disabled:opacity-50"
        >
          {signingOut ? "Signing out..." : "Sign out"}
        </button>

        {error && (
          <p role="alert" className="px-3 py-2 text-xs text-red-600">
            {error}
          </p>
        )}
      </div>
    </details>
  );
}