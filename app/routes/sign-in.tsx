import { AuthPage } from "~/components/Auth/AuthPage";

export function meta() {
  return [{ title: "Sign in | FSC Intern Management" }];
}

export default function SignInRoute() {
  return <AuthPage mode="sign-in" />;
}
