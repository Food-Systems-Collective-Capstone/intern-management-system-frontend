import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Dropdown } from "../components/Dropdown";
import { Search } from "../components/AdminScreening/Table/Search";
import { CandidateDetails } from "../components/AdminScreening/CandidateDetails";
import type { Candidate } from "../lib/applications";

describe("shared screening controls", () => {
  it("provides a labelled reusable dropdown and search input", () => {
    const onChange = vi.fn();
    const onSearch = vi.fn();
    render(
      <>
        <Dropdown
          label="Status"
          options={[
            { value: "", label: "All statuses" },
            { value: "Applied", label: "Submitted" },
          ]}
          onChange={onChange}
        />
        <Search value="" onChange={onSearch} />
      </>,
    );
    fireEvent.change(screen.getByRole("combobox", { name: "Status" }), {
      target: { value: "Applied" },
    });
    fireEvent.change(
      screen.getByRole("searchbox", { name: "Search this page" }),
      { target: { value: "Jane" } },
    );
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onSearch).toHaveBeenCalledWith("Jane");
  });

  it("shows the three profile views from the eye-view wireframe", () => {
    const candidate: Candidate = {
      person_id: "a5cc35ee-6086-49d0-887e-a5680ca39a83",
      firstname: "Jane",
      lastname: "Doe",
      email: "jane@example.com",
      phone: "0400 000 000",
      city: "Melbourne",
      state: "VIC",
      degree: "Food safety",
      resume_url: "path/to/resume.pdf",
      application_status: "Review",
      created_at: "2026-08-19",
    };
    render(<CandidateDetails candidate={candidate} onClose={vi.fn()} />);
    expect(
      screen.getByRole("dialog", { name: "Jane Doe" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Personal Information")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("tab", { name: "Application summary" }));
    expect(screen.getByText("Screening")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("tab", { name: "Documents" }));
    expect(screen.getByText("Resume PDF on file")).toBeInTheDocument();
  });
});
