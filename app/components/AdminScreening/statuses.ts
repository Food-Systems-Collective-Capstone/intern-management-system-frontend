// The list API uses different status names from the four labels in the screening wireframe.
export const screeningStatuses = [
  { label: "Submitted", value: "Applied" },
  { label: "Reviewing", value: "Review" },
  { label: "Accepted", value: "Hired" },
  { label: "Rejected", value: "Rejected" },
] as const;

export function displayStatus(status: string) {
  return (
    screeningStatuses.find((item) => item.value === status)?.label ?? "Other"
  );
}
