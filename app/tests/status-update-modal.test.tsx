import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { StatusUpdateModal } from "../components/AdminScreening/StatusUpdateModal";
import type { Candidate } from "../lib/applications";

vi.mock("../lib/auth", () => ({
  getAccessToken: vi.fn(async () => "jwt-token"),
  signOut: vi.fn(),
}));

describe("application status confirmation", () => {
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

  beforeEach(() => vi.stubEnv("VITE_API_URL", "https://backend.example.com"));
  afterEach(() => {
    cleanup();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("only sends the PATCH after the administrator confirms", async () => {
    const updated = { ...candidate, application_status: "Accepted" };
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify([{ application_status: "Accepted" }])),
      );
    vi.stubGlobal("fetch", fetchMock);
    const onUpdated = vi.fn();

    render(
      <StatusUpdateModal
        candidate={candidate}
        status="Accepted"
        onClose={vi.fn()}
        onUpdated={onUpdated}
      />,
    );

    expect(fetchMock).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Confirm Accepted" }));

    await waitFor(() => expect(onUpdated).toHaveBeenCalledWith(updated));
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("cancels without changing the status", () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const onClose = vi.fn();

    render(
      <StatusUpdateModal
        candidate={candidate}
        status="Rejected"
        onClose={onClose}
        onUpdated={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
