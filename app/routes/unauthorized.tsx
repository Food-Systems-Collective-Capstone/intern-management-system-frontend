import { useState } from "react";
import {
  Link,
  redirect,
  useLoaderData,
  useNavigate,
} from "react-router";
import { signOut } from "~/lib/auth";
import { ApiError } from "~/lib/api";
import { getCurrentAccount } from "~/lib/route-auth";
import {
  defaultRouteByRole,
  type AccountRole,
} from "~/lib/roles";

export function meta() {
  return [{ title: "Unauthorized | FSC Intern Management" }];
}

function getRequiredRole(path: string | null): AccountRole | null {
  if (!path || !path.startsWith("/") || path.startsWith("//")) {
    return null;
  }

  const pathname = path.split(/[?#]/, 1)[0];

  if (
    pathname === "/intern/workspace" ||
    pathname === "/intern/tasks" ||
    pathname === "/intern/weekly-progress" ||
    /^\/intern\/tasks\/[^/]+$/.test(pathname)
  ) {
    return "intern";
  }

  if (
    pathname === "/mentor/tasks/assign" ||
    pathname === "/mentor/review"
  ) {
    return "mentor";
  }

  if (pathname === "/application") {
    return "applicant";
  }

  if (
    pathname === "/admin/applications" ||
    pathname === "/admin/mentor-assignments"
  ) {
    return "admin";
  }

  return null;
}

function roleLabel(role: AccountRole): string {
  switch (role) {
    case "intern":
      return "Intern";
    case "mentor":
      return "Mentor";
    case "applicant":
      return "Applicant";
    case "admin":
      return "Admin";
  }
}

export async function clientLoader({
  request,
}: {
  request: Request;
}) {
  const url = new URL(request.url);
  const requestedPath = url.searchParams.get("from");
  const requiredRole = getRequiredRole(requestedPath);

  try {
    const account = await getCurrentAccount();

    return {
      defaultPath: defaultRouteByRole[account.role],
      unresolved: false,
      message:
        requiredRole && requiredRole !== account.role
          ? `This area is for ${roleLabel(requiredRole)}s. You're signed in as a ${roleLabel(account.role)}.`
          : "Your account does not have permission to view this area.",
    };
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      throw redirect("/sign-in");
    }

    if (
      error instanceof ApiError &&
      (error.status === 403 || error.status === 404)
    ) {
      return {
        defaultPath: null,
        unresolved: true,
        message:
          "Your account does not currently have an assigned workspace. Please contact your administrator if you believe this is a mistake.",
      };
    }

    throw error;
  }
}

clientLoader.hydrate = true as const;

export default function UnauthorizedRoute() {
  const { defaultPath, unresolved, message } =
    useLoaderData<typeof clientLoader>();

  const navigate = useNavigate();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function handleSignOut() {
    if (pending) return;

    setPending(true);
    setError("");

    try {
      await signOut();
      void navigate("/sign-in", { replace: true });
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Unable to sign out. Please try again.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 text-slate-900">
      <section className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-semibold text-slate-500">
          {unresolved ? "Account access" : "403"}
        </p>

        <h1 className="mt-2 text-2xl font-bold">
          {unresolved
            ? "We couldn't find a workspace for your account"
            : "You cannot access this page"}
        </h1>

        <p className="mt-3 text-sm text-slate-600">
          {message}
        </p>

        {defaultPath && !unresolved ? (
          <Link
            to={defaultPath}
            className="mt-6 inline-flex rounded-md bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Go to my workspace
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => void handleSignOut()}
            disabled={pending}
            className="mt-6 inline-flex rounded-md bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-wait disabled:opacity-60"
          >
            {pending ? "Signing out..." : "Sign out"}
          </button>
        )}

        {error && (
          <p role="alert" className="mt-4 text-sm text-red-700">
            {error}
          </p>
        )}
      </section>
    </main>
  );
}