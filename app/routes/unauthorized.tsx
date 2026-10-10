import { Link, useLoaderData } from "react-router";
import { getDefaultRouteForCurrentUser } from "~/lib/route-auth";

export function meta() {
  return [{ title: "Unauthorized | FSC Intern Management" }];
}

export async function clientLoader() {
  return { defaultPath: await getDefaultRouteForCurrentUser() };
}

clientLoader.hydrate = true as const;

export default function UnauthorizedRoute() {
  const { defaultPath } = useLoaderData<typeof clientLoader>();

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 text-slate-900">
      <section className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-semibold text-slate-500">403</p>
        <h1 className="mt-2 text-2xl font-bold">You cannot access this page</h1>
        <p className="mt-3 text-sm text-slate-600">
          Your account does not have permission to view this area.
        </p>
        <Link
          to={defaultPath}
          className="mt-6 inline-flex rounded-md bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
        >
          Return
        </Link>
      </section>
    </main>
  );
}
