import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Row } from "../components/AdminScreening/Table/Row";
import { screeningStatuses } from "../components/AdminScreening/statuses";
import type { Candidate } from "../lib/applications";

describe("screening row", () => {
  const candidate: Candidate = {
    person_id: "a5cc35ee-6086-49d0-887e-a5680ca39a83",
    firstname: "Jane",
    lastname: "Doe",
    email: "jane@example.com",
    degree: "Food safety",
    resume_url: null,
    application_status: "Applied",
    created_at: "2026-08-19",
  };

  it("uses the four wireframe statuses and opens the selected profile", () => {
    expect(screeningStatuses.map((status) => status.label)).toEqual([
      "Submitted",
      "Reviewing",
      "Accepted",
      "Rejected",
    ]);
    const onView = vi.fn();
    render(
      <table>
        <tbody>
          <Row candidate={candidate} onView={onView} />
        </tbody>
      </table>,
    );
    expect(screen.getByText("Submitted")).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("button", { name: "View Jane Doe's application" }),
    );
    expect(onView).toHaveBeenCalledWith(candidate);
  });
});
