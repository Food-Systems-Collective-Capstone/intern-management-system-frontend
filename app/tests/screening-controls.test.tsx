import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Dropdown } from "../components/Dropdown";
import { Search } from "../components/AdminScreening/Table/Search";
import { CandidateDetails } from "../components/AdminScreening/CandidateDetails";
import type { Candidate } from "../lib/applications";

describe("shared screening controls", () => {
  afterEach(() => cleanup());

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
      country: "Australia",
      date_of_birth: "2001-04-12",
      linkedin_url: "https://www.linkedin.com/in/jane-doe",
      degree: "Food safety",
      university: "RMIT University",
      graduation_year: 2027,
      motivation: "I want to improve food safety systems.",
      resume_url: "path/to/resume.pdf",
      application_status: "Review",
      created_at: "2026-08-19",
    };
    render(<CandidateDetails candidate={candidate} onClose={vi.fn()} />);
    expect(
      screen.getByRole("dialog", { name: "Jane Doe" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Personal Information")).toBeInTheDocument();
    expect(screen.getByText("Australia")).toBeInTheDocument();
    expect(screen.getByText("12 Apr 2001")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: candidate.linkedin_url }),
    ).toHaveAttribute("href", candidate.linkedin_url);
    fireEvent.click(screen.getByRole("tab", { name: "Application summary" }));
    expect(screen.getByText("Screening")).toBeInTheDocument();
    expect(screen.getByText("RMIT University")).toBeInTheDocument();
    expect(screen.getByText("2027")).toBeInTheDocument();
    expect(
      screen.getByText("I want to improve food safety systems."),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("tab", { name: "Documents" }));
    expect(screen.getByText("Resume PDF on file")).toBeInTheDocument();
    expect(screen.getByText("path/to/resume.pdf")).toBeInTheDocument();
    expect(screen.queryByText("Cover letter")).not.toBeInTheDocument();
  });

  it("changes status from the applicant view only after confirmation", () => {
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

    render(
      <CandidateDetails
        candidate={candidate}
        onClose={vi.fn()}
        onStatusUpdated={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole("tab", { name: "Application summary" }));
    fireEvent.change(
      screen.getByRole("combobox", { name: "Status for Jane Doe" }),
      { target: { value: "Accepted" } },
    );

    expect(
      screen.getByRole("dialog", { name: "Change application status?" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Change Jane Doe's status from Submitted to Accepted/),
    ).toBeInTheDocument();
  });
});
