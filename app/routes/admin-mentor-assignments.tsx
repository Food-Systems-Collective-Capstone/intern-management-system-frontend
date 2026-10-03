import { redirect } from "react-router";
import { MentorAssignmentsView } from "../components/AdminMentorAssignments/MentorAssignmentsView";
import { hasValidSession } from "../lib/auth";

export async function clientLoader() {
  if (!(await hasValidSession()))
    throw redirect("/sign-in?next=%2Fadmin%2Fmentor-assignments");
  return null;
}

clientLoader.hydrate = true as const;

export default function AdminMentorAssignments() {
  return <MentorAssignmentsView />;
}
