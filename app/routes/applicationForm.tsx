import { redirect } from "react-router";
import { ApplicationForm } from "~/components/ApplicationForm/Form";
import { hasValidSession } from "~/lib/auth";

export async function clientLoader() {
  if (!(await hasValidSession())) throw redirect("/sign-in?next=%2Fapplication");
  return null;
}

clientLoader.hydrate = true as const;

export default function ApplicationFormRoute() {
  return (
    <main>
      <ApplicationForm />
    </main>
  );
}
