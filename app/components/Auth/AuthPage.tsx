import { useState, type SubmitEvent } from "react";
import { Link, useNavigate } from "react-router";
import { Input } from "~/components/Input";
import { register, signIn } from "~/lib/auth";

export function AuthPage({ mode }: { mode: "sign-in" | "register" }) {
  const navigate = useNavigate();
  const isRegister = mode === "register";
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setError("");
    if (isRegister && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setPending(true);
    try {
      if (isRegister) {
        await register(email.trim(), password, fullName.trim());
      } else {
        await signIn(email.trim(), password);
      }
      void navigate("/application", { replace: true });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Something went wrong. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 text-slate-900">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-8 block text-center text-xl font-bold tracking-tight text-slate-900">
          FSC Intern Management
        </Link>
        <div className="rounded-xl border border-slate-200 bg-white p-7 shadow-sm sm:p-9">
          <h1 className="text-2xl font-bold">{isRegister ? "Create your account" : "Welcome back"}</h1>
          <p className="mt-2 text-sm text-slate-600">
            {isRegister ? "Register to start your internship application." : "Sign in to continue your application."}
          </p>

          <form onSubmit={handleSubmit} className="mt-7 space-y-4">
            {isRegister && (
              <Input label="Full name" name="fullName" autoComplete="name" required value={fullName}
                onChange={(event) => setFullName(event.target.value)} />
            )}
            <Input label="Email address" name="email" type="email" autoComplete="email" required value={email}
              onChange={(event) => setEmail(event.target.value)} />
            <Input label="Password" name="password" type="password" autoComplete={isRegister ? "new-password" : "current-password"}
              minLength={6} required value={password} onChange={(event) => setPassword(event.target.value)} />
            {isRegister && (
              <Input label="Confirm password" name="confirmPassword" type="password" autoComplete="new-password"
                minLength={6} required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} />
            )}
            {error && <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
            <button type="submit" disabled={pending}
              className="mt-2 w-full rounded-md bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 disabled:cursor-wait disabled:opacity-60">
              {pending ? "Please wait…" : isRegister ? "Create account" : "Sign in"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            {isRegister ? "Already have an account? " : "New here? "}
            <Link className="font-semibold text-slate-900 underline underline-offset-4" to={isRegister ? "/sign-in" : "/register"}>
              {isRegister ? "Sign in" : "Create an account"}
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
