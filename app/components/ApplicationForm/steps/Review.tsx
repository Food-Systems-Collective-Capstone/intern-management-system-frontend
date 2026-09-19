import type { ApplicationData } from "~/components/ApplicationForm/Form.tsx";

type ReviewProps = {
  data: ApplicationData;
};

export function Review({ data }: ReviewProps) {
  return (
    <div>
      <h2>Review Application</h2>

      <section>
        <h3>Personal Information</h3>

        <p>
          {data.firstName} {data.lastName}
        </p>

        <p>{data.email}</p>
        <p>{data.phone}</p>
      </section>

      <section>
        <h3>Application Details</h3>

        <p>{data.university}</p>
        <p>{data.degree}</p>
        <p>{data.graduationYear}</p>
        <p>{data.motivation}</p>
      </section>

      <section>
        <h3>Documents</h3>

        <p>{data.resume?.name ?? "No resume selected"}</p>
      </section>
    </div>
  );
}
