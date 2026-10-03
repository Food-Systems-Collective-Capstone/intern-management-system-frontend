import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CandidateDetails } from "../components/AdminScreening/CandidateDetails";
import type { Candidate } from "../lib/applications";

vi.mock("../lib/auth", () => ({
  getAccessToken: vi.fn(async () => "jwt-token"),
  signOut: vi.fn(),
}));

describe("promote to Intern flow", () => {
  const acceptedCandidate: Candidate = {
    person_id: "a5cc35ee-6086-49d0-887e-a5680ca39a83",
    firstname: "Jane",
    lastname: "Doe",
    email: "jane@example.com",
    degree: "Food safety",
    resume_url: null,
    application_status: "Accepted",
    created_at: "2026-08-19",
  };

  beforeEach(() => vi.stubEnv("VITE_API_URL", "https://backend.example.com"));
  afterEach(() => {
    cleanup();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("requires explicit confirmation and reports a successful promotion", async () => {
    const promoted = {
      ...acceptedCandidate,
      is_locked: true,
      promoted_at: "2026-10-03T01:00:00.000Z",
    };
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify(promoted)));
    vi.stubGlobal("fetch", fetchMock);
    const onPromoted = vi.fn();

    render(
      <CandidateDetails
        candidate={acceptedCandidate}
        onClose={vi.fn()}
        onPromoted={onPromoted}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Promote to Intern" }));

    const submit = screen.getByRole("button", { name: "Confirm promotion" });
    expect(submit).toBeDisabled();
    fireEvent.click(
      screen.getByRole("checkbox", {
        name: /I understand that this will activate/i,
      }),
    );
    fireEvent.click(submit);

    await waitFor(() => expect(onPromoted).toHaveBeenCalledWith(promoted));
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(
      screen.queryByRole("dialog", { name: /Promote Jane Doe/i }),
    ).not.toBeInTheDocument();
  });

  it("keeps the modal open and displays a backend error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            message: "This applicant has already been promoted",
          }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        ),
      ),
    );

    render(
      <CandidateDetails
        candidate={acceptedCandidate}
        onClose={vi.fn()}
        onPromoted={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Promote to Intern" }));
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: "Confirm promotion" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "This applicant has already been promoted",
    );
    expect(
      screen.getByRole("dialog", { name: /Promote Jane Doe/i }),
    ).toBeInTheDocument();
  });

  it("does not offer promotion for a candidate who is not accepted", () => {
    render(
      <CandidateDetails
        candidate={{ ...acceptedCandidate, application_status: "Review" }}
        onClose={vi.fn()}
        onPromoted={vi.fn()}
      />,
    );
    expect(
      screen.queryByRole("button", { name: "Promote to Intern" }),
    ).not.toBeInTheDocument();
  });
});
