import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createApplication,
  fetchApplications,
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
});
