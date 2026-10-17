import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createApplication,
  fetchApplications,
  promoteApplicant,
  updateApplicantStatus,
  uploadResume,
} from "../lib/applications";
import type { ApplicationData } from "../components/ApplicationForm/formValidation";

vi.mock("../lib/auth", () => ({
  getAccessToken: vi.fn(async () => "jwt-token"),
  signOut: vi.fn(),
}));

describe("application API contract", () => {
  beforeEach(() => vi.stubEnv("VITE_API_URL", "https://backend.example.com/"));
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("creates a profile with the backend DTO and uploads a PDF in a second authenticated multipart request", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify([{ person_id: "person-123" }]), {
          status: 201,
        }),
      )
      .mockResolvedValueOnce(new Response("{}", { status: 201 }));
    vi.stubGlobal("fetch", fetchMock);
    const resume = new File(["%PDF-1.4"], "resume.pdf", {
      type: "application/pdf",
    });
    const data = {
      fullName: "Jane Doe",
      email: "jane@example.com",
      phone: "0400000000",
      country: "Australia",
      dateOfBirth: "2001-04-12",
      linkedinUrl: "https://www.linkedin.com/in/jane-doe",
      address: "1 Street",
      city: "Melbourne",
      state: "VIC",
      postcode: "3000",
      university: "RMIT",
      internshipProgram: "Food safety",
      graduationYear: "2027",
      motivation: "Interested",
      resume,
      coverLetter: null,
      privacyAccepted: true,
    } as ApplicationData;

    const id = await createApplication(data);
    await uploadResume(id, resume);

    expect(fetchMock).toHaveBeenCalledTimes(2);
    const [profileUrl, profileInit] = fetchMock.mock.calls[0] as [
      string,
      RequestInit,
    ];
    expect(profileUrl).toBe("https://backend.example.com/api/applications");
    expect(profileInit.headers).toMatchObject({
      Authorization: "Bearer jwt-token",
      "Content-Type": "application/json",
    });
    expect(JSON.parse(profileInit.body as string)).toMatchObject({
      firstname: "Jane",
      lastname: "Doe",
      degree: "Food safety",
      graduation_year: 2027,
      post_code: "3000",
      country: "Australia",
      date_of_birth: "2001-04-12",
      linkedin_url: "https://www.linkedin.com/in/jane-doe",
    });
    const [resumeUrl, resumeInit] = fetchMock.mock.calls[1] as [
      string,
      RequestInit,
    ];
    expect(resumeUrl).toBe(
      "https://backend.example.com/api/applications/resume/person-123",
    );
    expect(resumeInit.headers).toEqual({ Authorization: "Bearer jwt-token" });
    expect(resumeInit.body).toBeInstanceOf(FormData);
    expect((resumeInit.body as FormData).get("file")).toBe(resume);
  });

  it("requests the admin page with the backend status parameter", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify({ data: [], total: 0 })));
    vi.stubGlobal("fetch", fetchMock);
    await fetchApplications(2, "Review");
    expect(fetchMock.mock.calls[0][0]).toBe(
      "https://backend.example.com/api/applications?page=2&limit=6&status=Review",
    );
    expect(fetchMock.mock.calls[0][1].headers).toEqual({
      Authorization: "Bearer jwt-token",
    });
  });

  it("promotes an accepted candidate through the protected backend endpoint", async () => {
    const promoted = {
      person_id: "person-123",
      firstname: "Jane",
      lastname: "Doe",
      promoted_at: "2026-10-03T01:00:00.000Z",
    };
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify(promoted)));
    vi.stubGlobal("fetch", fetchMock);

    await expect(promoteApplicant("person-123")).resolves.toMatchObject(
      promoted,
    );
    expect(fetchMock).toHaveBeenCalledWith(
      "https://backend.example.com/api/applications/person-123/promote",
      expect.objectContaining({
        method: "PATCH",
        headers: { Authorization: "Bearer jwt-token" },
      }),
    );
  });

  it("updates an applicant status through the existing PATCH endpoint", async () => {
    const updated = {
      person_id: "person-123",
      application_status: "Accepted",
    };
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify(updated)));
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      updateApplicantStatus("person-123", "Accepted"),
    ).resolves.toMatchObject(updated);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://backend.example.com/api/applications/person-123/status",
      expect.objectContaining({
        method: "PATCH",
        headers: {
          Authorization: "Bearer jwt-token",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "Accepted" }),
      }),
    );
  });

  it("normalizes the deployed endpoint's array response", async () => {
    const updated = {
      person_id: "person-123",
      application_status: "Rejected",
    };
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(JSON.stringify([updated]))),
    );

    await expect(
      updateApplicantStatus("person-123", "Rejected"),
    ).resolves.toEqual(updated);
  });
});
