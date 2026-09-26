import { Input } from "../../Input";

export function Search({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <Input
      label="Search this page"
      type="search"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder="Name, ID or email"
    />
  );
}
