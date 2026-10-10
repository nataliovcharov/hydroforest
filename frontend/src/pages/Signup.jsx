import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { useSession } from "../lib/session";
import { AuthScreen, Field, SubmitButton } from "../components/AuthScreen";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Same rule as the backend (routes/auth.js).
const USERNAME = /^[a-zA-Z0-9_.-]{3,32}$/;

export default function Signup() {
  const { login } = useSession();
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value });

  const problem = !USERNAME.test(form.username.trim())
    ? "Usernames are 3 to 32 letters, numbers, dots, dashes or underscores."
    : !EMAIL.test(form.email.trim())
      ? "Enter a valid email address."
      : form.password.length < 6
        ? "Use at least 6 characters for your password."
        : null;

  const submit = async (event) => {
    event.preventDefault();
    if (problem) {
      setError(problem);
      return;
    }
    setBusy(true);
    setError("");
    try {
      const data = await api("/auth/signup", {
        method: "POST",
        body: { username: form.username.trim(), email: form.email.trim(), password: form.password },
        logoutOn401: false,
      });
      // The API logs you in right away, so skip the extra login step.
      // Saving the token re-renders <GuestOnly>, which opens the app.
      login(data.token);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <AuthScreen
      title="Grow your forest"
      subtitle="Every glass of water helps a tree grow."
      footer={
        <>
          Already have an account? <Link to="/login">Log in</Link>
        </>
      }
    >
      <form onSubmit={submit} noValidate>
        {error && (
          <p className="notice notice--error" role="alert">
            {error}
          </p>
        )}
        <div className="field-group">
          <Field
            label="Username"
            name="username"
            autoComplete="username"
            autoCapitalize="none"
            value={form.username}
            onChange={update}
          />
          <Field label="Email" name="email" type="email" autoComplete="email" value={form.email} onChange={update} />
          <Field
            label="Password"
            name="password"
            type="password"
            autoComplete="new-password"
            value={form.password}
            onChange={update}
          />
        </div>
        <p className="footnote" style={{ margin: "-6px 4px 0" }}>
          Passwords need at least 6 characters.
        </p>
        <SubmitButton busy={busy}>Create account</SubmitButton>
      </form>
    </AuthScreen>
  );
}
