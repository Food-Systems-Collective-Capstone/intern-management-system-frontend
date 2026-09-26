import { redirect } from "react-router";
import { ScreeningView } from "~/components/AdminScreening/ScreeningView";
import { hasValidSession } from "~/lib/auth";

export async function clientLoader() {
  if (!(await hasValidSession()))
    throw redirect("/sign-in?next=%2Fadmin%2Fapplications");
  return null;
}

clientLoader.hydrate = true as const;

export default function AdminApplications() {
  return <ScreeningView />;
}
