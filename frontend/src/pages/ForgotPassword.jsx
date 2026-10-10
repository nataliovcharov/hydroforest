import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { AuthScreen, Field, SubmitButton } from "../components/AuthScreen";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState({ busy: false, sent: false, error: "" });

  const submit = async (event) => {
    event.preventDefault();
    setStatus({ busy: true, sent: false, error: "" });
    try {
      await api("/auth/forgot-password", { method: "POST", body: { email: email.trim() }, logoutOn401: false });
      setStatus({ busy: false, sent: true, error: "" });
    } catch (err) {
      setStatus({ busy: false, sent: false, error: err.message });
    }
  };

  return (
    <AuthScreen
      title="Reset password"
      subtitle="Enter your email and we'll send you a link to reset it."
      footer={<Link to="/login">Back to log in</Link>}
    >
      {status.sent ? (
        <p className="notice notice--success" role="status">
          If an account uses {email.trim()}, a reset link is on its way. Check your inbox.
        </p>
      ) : (
        <form onSubmit={submit} noValidate>
          {status.error && (
            <p className="notice notice--error" role="alert">
              {status.error}
            </p>
          )}
          <div className="field-group">
            <Field
              label="Email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <SubmitButton busy={status.busy} disabled={!email.includes("@")}>
            Send reset link
          </SubmitButton>
        </form>
      )}
    </AuthScreen>
  );
}
