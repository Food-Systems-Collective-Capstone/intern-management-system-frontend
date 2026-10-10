import { ScreeningView } from "~/components/AdminScreening/ScreeningView";
import { requireRole } from "~/lib/route-auth";

export async function clientLoader() {
  await requireRole("admin", "/admin/applications");
  return null;
}

clientLoader.hydrate = true as const;

export default function AdminApplications() {
  return <ScreeningView />;
}
