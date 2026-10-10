import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { useToast } from "../lib/toast";
import NavBar from "../components/NavBar";
import Icon from "../components/Icon";
import { Field, SubmitButton } from "../components/AuthScreen";

export default function ChangePassword() {
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", reEnterNewPassword: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value });

  // Same rules as the backend, checked as you type.
  const rules = [
    { ok: form.newPassword.length >= 6, text: "At least 6 characters" },
    { ok: /\d/.test(form.newPassword), text: "At least one number" },
    {
      ok: form.newPassword.length > 0 && form.newPassword === form.reEnterNewPassword,
      text: "Both new passwords match",
    },
  ];
  const ready = form.currentPassword && rules.every((r) => r.ok);

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      // A wrong current password returns 401, which here must not log the user out.
      await api("/ChangePassword/change-password", { method: "POST", body: form, logoutOn401: false });
      toast("Password changed");
      navigate("/account", { replace: true });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <main className="page page--no-tabbar">
      <NavBar backTo="/account" backLabel="Account" />
      <h1 className="large-title" style={{ margin: "4px 0 24px" }}>
        Password
      </h1>
      <form onSubmit={submit} noValidate style={{ display: "grid", gap: 16 }}>
        {error && (
          <p className="notice notice--error" role="alert">
            {error}
          </p>
        )}
        <div className="field-group">
          <Field
            label="Current password"
            name="currentPassword"
            type="password"
            autoComplete="current-password"
            value={form.currentPassword}
            onChange={update}
          />
        </div>
        <div className="field-group">
          <Field
            label="New password"
            name="newPassword"
            type="password"
            autoComplete="new-password"
            value={form.newPassword}
            onChange={update}
          />
          <Field
            label="Repeat new password"
            name="reEnterNewPassword"
            type="password"
            autoComplete="new-password"
            value={form.reEnterNewPassword}
            onChange={update}
          />
        </div>
        <ul style={{ listStyle: "none", margin: 0, padding: "0 4px", display: "grid", gap: 6 }}>
          {rules.map((rule) => (
            <li
              key={rule.text}
              className="footnote"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                color: rule.ok ? "var(--text)" : "var(--text-tertiary)",
              }}
            >
              <Icon name={rule.ok ? "check" : "minus"} size={16} strokeWidth={2.6} />
              {rule.text}
            </li>
          ))}
        </ul>
        <SubmitButton busy={busy} disabled={!ready}>
          Change password
        </SubmitButton>
      </form>
    </main>
  );
}
