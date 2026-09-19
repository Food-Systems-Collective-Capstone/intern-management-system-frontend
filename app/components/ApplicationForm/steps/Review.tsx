import type { ApplicationData } from "~/components/ApplicationForm/Form.tsx";

type ReviewProps = {
  data: ApplicationData;
  onEdit: (step: number) => void;
};

export function Review({ data, onEdit }: ReviewProps) {
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

        <button onClick={() => onEdit(0)}>Edit</button>
      </section>

      <section>
        <h3>Application Details</h3>

        <p>{data.university}</p>
        <p>{data.degree}</p>
        <p>{data.graduationYear}</p>
        <p>{data.motivation}</p>

        <button onClick={() => onEdit(1)}>Edit</button>
      </section>

      <section>
        <h3>Documents</h3>

        <p>{data.resume?.name ?? "No resume selected"}</p>

        <button onClick={() => onEdit(2)}>Edit</button>
      </section>
    </div>
  );
}
