import type { ApplicationData } from "~/components/ApplicationForm/Form.tsx";

type ApplicationDetailsProps = {
  data: ApplicationData;
  onChange: (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
};

export function ApplicationDetails({
  data,
  onChange,
}: ApplicationDetailsProps) {
  return (
    <div>
      <h2>Application Details</h2>

      <div>
        <label htmlFor="university">University</label>

        <input
          id="university"
          name="university"
          value={data.university}
          onChange={onChange}
        />
      </div>

      <div>
        <label htmlFor="degree">Degree</label>

        <input
          id="degree"
          name="degree"
          value={data.degree}
          onChange={onChange}
        />
      </div>

      <div>
        <label htmlFor="graduationYear">Graduation year</label>

        <input
          id="graduationYear"
          name="graduationYear"
          value={data.graduationYear}
          onChange={onChange}
        />
      </div>

      <div>
        <label htmlFor="motivation">Why are you interested?</label>

        <textarea
          id="motivation"
          name="motivation"
          value={data.motivation}
          onChange={onChange}
        />
      </div>
    </div>
  );
}
