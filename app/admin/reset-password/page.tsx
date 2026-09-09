"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, LockKeyhole, ShieldCheck, X } from "lucide-react";
import { createClient } from "../../../lib/supabase-browser";

export default function ResetPasswordPage() {
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setReady(!!data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) setReady(true);
    });
    return () => listener.subscription.unsubscribe();
  }, [supabase]);

  async function updatePassword(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setMessage("");
    if (password.length < 8) { setError("Use at least 8 characters."); return; }
    if (password !== confirm) { setError("The passwords do not match."); return; }
    setSaving(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) setError(updateError.message);
    else setMessage("Password updated. You can now return to the admin area and sign in.");
    setSaving(false);
  }

  return (
    <main className="reset-page">
      <div className="reset-card">
        <div className="reset-icon"><LockKeyhole size={22} /></div>
        <span className="reset-kicker">PRIVATE ADMIN AREA</span>
        <h1>Set a new password</h1>
        <p>Choose a new password for your Renovation Discovery admin account.</p>
        {!ready && <div className="reset-message"><ShieldCheck size={15} /> Open this page from the password-reset email.</div>}
        <form onSubmit={updatePassword}>
          <label>New password<input type="password" minLength={8} value={password} onChange={e => setPassword(e.target.value)} autoComplete="new-password" disabled={!ready || saving} required /></label>
          <label>Confirm password<input type="password" minLength={8} value={confirm} onChange={e => setConfirm(e.target.value)} autoComplete="new-password" disabled={!ready || saving} required /></label>
          {error && <div className="reset-error"><X size={15} />{error}</div>}
          {message && <div className="reset-success"><CheckCircle2 size={15} />{message}</div>}
          <button disabled={!ready || saving}>{saving ? "Updating…" : "Update password"}</button>
        </form>
        <a href="/admin">Return to admin sign in</a>
      </div>
      <style jsx global>{`
        .reset-page{min-height:100vh;background:#061016;color:#eef5f7;display:grid;place-items:center;padding:24px;font-family:Inter,ui-sans-serif,system-ui,sans-serif}.reset-card{width:min(430px,100%);padding:34px;border:1px solid rgba(255,255,255,.1);background:#0a171f;border-radius:18px;box-shadow:0 30px 80px rgba(0,0,0,.35)}.reset-icon{width:44px;height:44px;display:grid;place-items:center;border-radius:12px;background:rgba(111,224,194,.08);color:#6fe0c2;margin-bottom:20px}.reset-kicker{font-size:9px;letter-spacing:.12em;color:#71858d;font-weight:800}.reset-card h1{font-size:27px;margin:8px 0}.reset-card>p{color:#81949d;font-size:11px;line-height:1.6;margin:0 0 22px}.reset-card form{display:grid;gap:13px}.reset-card label{display:grid;gap:6px;color:#8da0a8;font-size:10px}.reset-card input{background:#07131a;border:1px solid rgba(255,255,255,.1);border-radius:9px;padding:11px;color:#fff;outline:0;font-size:12px}.reset-card input:focus{border-color:rgba(111,224,194,.4)}.reset-card button{border:0;border-radius:9px;padding:12px;background:#6fe0c2;color:#061016;font-weight:800;cursor:pointer}.reset-card button:disabled{opacity:.45;cursor:not-allowed}.reset-card a{display:block;text-align:center;color:#6f858e;font-size:10px;margin-top:17px}.reset-message,.reset-error,.reset-success{display:flex;gap:7px;align-items:flex-start;padding:10px;border-radius:8px;font-size:10px;line-height:1.45;margin-bottom:13px}.reset-message{background:rgba(111,224,194,.05);color:#81969e;border:1px solid rgba(111,224,194,.1)}.reset-error{background:rgba(255,127,135,.07);color:#ff9aa0;border:1px solid rgba(255,127,135,.13)}.reset-success{background:rgba(111,224,194,.07);color:#79e4c7;border:1px solid rgba(111,224,194,.13)}
      `}</style>
    </main>
  );
}
