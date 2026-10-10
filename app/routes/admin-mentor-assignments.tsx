import { MentorAssignmentsView } from "../components/AdminMentorAssignments/MentorAssignmentsView";
import { requireRole } from "../lib/route-auth";

export async function clientLoader() {
  await requireRole("admin", "/admin/mentor-assignments");
  return null;
}

clientLoader.hydrate = true as const;

export default function AdminMentorAssignments() {
  return <MentorAssignmentsView />;
}
