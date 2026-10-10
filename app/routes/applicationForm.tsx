import { ApplicationForm } from "~/components/ApplicationForm/Form";
import { requireRole } from "~/lib/route-auth";

export async function clientLoader() {
  await requireRole("applicant", "/application", {
    allowUnprovisionedApplicant: true,
  });
  return null;
}

clientLoader.hydrate = true as const;

export default function ApplicationFormRoute() {
  return (
    <main className="min-h-screen bg-white text-gray-950 [color-scheme:light]">
      <ApplicationForm />
    </main>
  );
}
