import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { useSession } from "../lib/session";
import { useToast } from "../lib/toast";
import NavBar from "../components/NavBar";
import { Field, SubmitButton } from "../components/AuthScreen";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ChangeEmail() {
  const navigate = useNavigate();
  const toast = useToast();
  const { user, refreshUser } = useSession();
  const [form, setForm] = useState({ currentEmail: "", newEmail: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value });
  const ready = EMAIL.test(form.currentEmail.trim()) && EMAIL.test(form.newEmail.trim());

  const submit = async (event) => {
    event.preventDefault();
    if (form.currentEmail.trim() === form.newEmail.trim()) {
      setError("The new email is the same as the current one.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await api("/ChangeEmail/change-email", {
        method: "POST",
        body: { currentEmail: form.currentEmail.trim(), newEmail: form.newEmail.trim() },
      });
      await refreshUser().catch(() => {});
      toast("Email updated");
      navigate("/account", { replace: true });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <main className="page page--no-tabbar">
      <NavBar backTo="/account" backLabel="Account" />
      <h1 className="large-title" style={{ margin: "4px 0 8px" }}>
        Email
      </h1>
      <p className="subhead" style={{ marginBottom: 24 }}>
        {user?.email ? `You use ${user.email} to sign in.` : "Change the email on your account."}
      </p>
      <form onSubmit={submit} noValidate style={{ display: "grid", gap: 16 }}>
        {error && (
          <p className="notice notice--error" role="alert">
            {error}
          </p>
        )}
        <div className="field-group">
          <Field
            label="Current email"
            name="currentEmail"
            type="email"
            autoComplete="email"
            value={form.currentEmail}
            onChange={update}
          />
          <Field label="New email" name="newEmail" type="email" autoComplete="off" value={form.newEmail} onChange={update} />
        </div>
        <SubmitButton busy={busy} disabled={!ready}>
          Update email
        </SubmitButton>
      </form>
    </main>
  );
}
