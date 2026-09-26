import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { getSupabaseClient } from "~/lib/supabase";
import { signOut } from "~/lib/auth";

export function AdminAccount() {
  const navigate = useNavigate();
  const [account, setAccount] = useState({ name: "Account", email: "" });

  useEffect(() => {
    let active = true;
    void getSupabaseClient()
      .auth.getUser()
      .then(({ data }) => {
        if (active && data.user) {
          const fullName = data.user.user_metadata?.full_name;
          setAccount({
            name:
              typeof fullName === "string" && fullName.trim()
                ? fullName
                : "Admin user",
            email: data.user.email || "",
          });
        }
      })
      .catch(() => {
        /* The authenticated route can still display its account placeholder. */
      });
    return () => {
      active = false;
    };
  }, []);

  async function handleSignOut() {
    await signOut();
    void navigate("/sign-in", { replace: true });
  }

  return (
    <details className="group relative ml-auto w-fit">
      <summary className="flex cursor-pointer list-none items-center gap-3 rounded-md p-2 text-left hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-black [&::-webkit-details-marker]:hidden">
        <span
          aria-hidden="true"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-200 text-sm font-semibold text-gray-600"
        >
          {account.name.slice(0, 2).toUpperCase()}
        </span>
        <span className="hidden sm:block">
          <span className="block text-sm font-medium">{account.name}</span>
          <span className="block max-w-48 truncate text-xs text-gray-500">
            {account.email}
          </span>
        </span>
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="h-4 w-4 transition group-open:rotate-180"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </summary>
      <div className="absolute right-0 z-20 mt-1 min-w-44 rounded-md border border-gray-200 bg-white p-1 shadow-lg">
        <button
          type="button"
          onClick={() => {
            void handleSignOut();
          }}
          className="w-full rounded px-3 py-2 text-left text-sm hover:bg-gray-100"
        >
          Sign out
        </button>
      </div>
    </details>
  );
}
