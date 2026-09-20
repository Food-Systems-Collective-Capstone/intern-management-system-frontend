import type { ApplicationFormData } from "../formValidation";

type ReviewProps = {
  data: ApplicationFormData;
};

export function Review({ data }: ReviewProps) {
  return (
    <div>
      <h2>Review & Submit</h2>

      <p>Please review your application before submitting.</p>

      <section>
        <h3>Personal Information</h3>

        <p>Full Name: {data.fullName}</p>
        <p>Email Address: {data.email}</p>
        <p>Phone Number: {data.phone}</p>
        <p>Address: {data.address}</p>
        <p>City: {data.city}</p>
        <p>State: {data.state}</p>
        <p>Post Code: {data.postcode}</p>
      </section>

      <section>
        <h3>Application Details</h3>

        <p>Internship Program: {data.internshipProgram}</p>
        <p>University / Institute: {data.university}</p>
        <p>Expected Graduation Year: {data.graduationYear}</p>
        <p>Motivation: {data.motivation}</p>
      </section>

      <section>
        <h3>Documents</h3>

        <p>Resume / CV: {data.resume?.name ?? "No resume selected"}</p>

        <p>Cover Letter: {data.coverLetter?.name ?? "Not provided"}</p>
      </section>
    </div>
  );
}
