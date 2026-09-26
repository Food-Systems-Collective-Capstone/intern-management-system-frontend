import { apiFetch } from "./api";
import type { ApplicationData } from "~/components/ApplicationForm/formValidation";

export type Candidate = {
  person_id: string;
  firstname: string;
  lastname: string;
  email: string;
  phone?: string;
  university?: string;
  address?: string;
  city?: string;
  state?: string;
  post_code?: string;
  graduation_year?: number;
  motivation?: string;
  degree: string;
  resume_url: string | null;
  cover_letter_url?: string | null;
  application_status: string;
  created_at: string;
};

export async function createApplication(
  data: ApplicationData,
): Promise<string> {
  const names = data.fullName.trim().split(/\s+/);
  const firstname = names.shift()!;
  const lastname = names.join(" ") || firstname;
  const response = await apiFetch("/api/applications", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      firstname,
      lastname,
      phone: data.phone,
      email: data.email,
      university: data.university,
      // The current backend has no internship_program field
      degree: data.internshipProgram,
      address: data.address,
      city: data.city,
      state: data.state,
      post_code: data.postcode,
      graduation_year: Number(data.graduationYear),
      motivation: data.motivation,
    }),
  });
  // Nest currently returns TypeORM's raw query result (an array of rows).
  const result: Candidate | Candidate[] = await response.json();
  const id = (Array.isArray(result) ? result[0] : result)?.person_id;
  if (!id)
    throw new Error(
      "Application saved, but the API returned no profile ID for the resume upload.",
    );
  return id;
}

export async function uploadResume(personId: string, file: File) {
  const payload = new FormData();
  payload.append("file", file);
  await apiFetch(`/api/applications/resume/${encodeURIComponent(personId)}`, {
    method: "POST",
    body: payload,
  });
}

export async function fetchApplications(
  page: number,
  status: string,
  signal?: AbortSignal,
) {
  const params = new URLSearchParams({ page: String(page), limit: "6" });
  if (status) params.set("status", status);
  const response = await apiFetch(`/api/applications?${params}`, { signal });
  return response.json() as Promise<{ data: Candidate[]; total: number }>;
}
