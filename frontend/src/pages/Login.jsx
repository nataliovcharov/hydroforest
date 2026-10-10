import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { useSession } from "../lib/session";
import { AuthScreen, Field, SubmitButton } from "../components/AuthScreen";
import styles from "../components/AuthScreen.module.css";

export default function Login() {
  const { login } = useSession();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value });

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const data = await api("/auth/login", {
        method: "POST",
        body: { username: form.username.trim(), password: form.password },
        logoutOn401: false,
      });
      // Saving the token re-renders <GuestOnly>, which sends the user on to where they were going.
      login(data.token);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <AuthScreen
      title="Welcome back"
      subtitle="Log in to water your forest."
      footer={
        <>
          New to HydroForest? <Link to="/signup">Create an account</Link>
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
            required
          />
          <Field
            label="Password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={form.password}
            onChange={update}
            required
          />
        </div>
        <div className={styles["link-row"]}>
          <Link to="/forgot-password">Forgot password?</Link>
        </div>
        <SubmitButton busy={busy} disabled={!form.username.trim() || !form.password}>
          Log in
        </SubmitButton>
      </form>
    </AuthScreen>
  );
}
