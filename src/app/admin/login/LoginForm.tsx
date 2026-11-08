"use client";

import { useActionState } from "react";
import { login, type LoginState } from "@/app/actions/auth";

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});
  return (
    <form action={action} className="mt-8 space-y-5" key={state.n ?? 0}>
      <div>
        <label htmlFor="email" className="field-label">
          Email
        </label>
        <input id="email" name="email" type="email" autoComplete="username" required defaultValue={state.email ?? ""} className="field" />
      </div>
      <div>
        <label htmlFor="password" className="field-label">
          Password
        </label>
        <input id="password" name="password" type="password" autoComplete="current-password" required autoFocus={!!state.error} className="field" />
      </div>
      {state.error && (
        <p role="alert" className="rounded-xl bg-danger/10 px-4 py-3 text-sm font-medium text-danger">
          {state.error}
        </p>
      )}
      <button type="submit" disabled={pending} className="btn btn-primary w-full">
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
