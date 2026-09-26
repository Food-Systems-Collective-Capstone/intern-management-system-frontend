import { AuthPage } from "~/components/Auth/AuthPage";

export function meta() {
  return [{ title: "Register | FSC Intern Management" }];
}

export default function RegisterRoute() {
  return <AuthPage mode="register" />;
}
