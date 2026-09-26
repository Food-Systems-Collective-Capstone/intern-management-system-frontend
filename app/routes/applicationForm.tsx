import { redirect } from "react-router";
import { ApplicationForm } from "~/components/ApplicationForm/Form";
import { getAccessToken } from "~/lib/auth";

export async function clientLoader() {
  const token = await getAccessToken();
  if (!token) throw redirect("/sign-in");
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
