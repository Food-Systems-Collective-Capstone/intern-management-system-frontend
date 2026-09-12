import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Status from "../routes/status";

describe("Status", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("shows the checking message initially", () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(
      () => new Promise(() => {}),
    );

    render(<Status />);

    expect(screen.getByText("API Status")).toBeInTheDocument();
    expect(screen.getByText("Checking API status...")).toBeInTheDocument();
  });

  it("shows available when the API responds successfully", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ status: "ok" }),
    } as Response);

    render(<Status />);

    expect(await screen.findByText("API is available.")).toBeInTheDocument();
  });

  it("shows unavailable when the API returns a non-200 response", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      status: 500,
    } as Response);

    render(<Status />);

    expect(await screen.findByText("API is unavailable.")).toBeInTheDocument();
  });

  it("shows unavailable when the API request fails", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("Network error"));

    render(<Status />);

    expect(await screen.findByText("API is unavailable.")).toBeInTheDocument();
  });
});
