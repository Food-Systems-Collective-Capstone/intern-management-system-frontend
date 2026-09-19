import type { ApplicationData } from "~/components/ApplicationForm/Form.tsx";

type PersonalInfoProps = {
  data: ApplicationData;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

export function PersonalInfo({ data, onChange }: PersonalInfoProps) {
  return (
    <div>
      <h2>Personal Information</h2>

      <div>
        <label htmlFor="firstName">First name</label>

        <input
          id="firstName"
          name="firstName"
          value={data.firstName}
          onChange={onChange}
        />
      </div>

      <div>
        <label htmlFor="lastName">Last name</label>

        <input
          id="lastName"
          name="lastName"
          value={data.lastName}
          onChange={onChange}
        />
      </div>

      <div>
        <label htmlFor="email">Email</label>

        <input
          id="email"
          name="email"
          type="email"
          value={data.email}
          onChange={onChange}
        />
      </div>

      <div>
        <label htmlFor="phone">Phone</label>

        <input id="phone" name="phone" value={data.phone} onChange={onChange} />
      </div>
    </div>
  );
}
