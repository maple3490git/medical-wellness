"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, ArrowLeft, ShieldCheck, Loader2 } from "lucide-react";
import { useToast } from "@/context/ToastContext";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 900);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[rgb(var(--bg-app))]">
      <div className="w-full max-w-md animate-fade-in-up">
        <div className="card p-6 sm:p-8">
          {sent ? (
            <div className="text-center py-2">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 text-emerald-500 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4">
                <ShieldCheck size={26} />
              </div>
              <h2 className="font-display text-xl font-bold">E-mail envoyé</h2>
              <p className="text-sm text-[rgb(var(--text-muted))] mt-2">
                Si un compte existe pour <strong className="text-[rgb(var(--text))]">{email}</strong>,
                vous recevrez un lien de réinitialisation dans quelques instants.
              </p>
              <div className="flex flex-col gap-2 mt-6">
                <button
                  onClick={() => {
                    setSent(false);
                    setEmail("");
                  }}
                  className="btn-outline w-full justify-center"
                >
                  Envoyer à nouveau
                </button>
                <button onClick={() => showToast("Lien de réinitialisation reçu (démo).", "success")} className="btn-gold w-full justify-center">
                  J'ai reçu le lien
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-6">
                <button onClick={() => router.push("/login")} className="p-2 rounded-xl border border-[rgb(var(--border))] text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text))]">
                  <ArrowLeft size={16} />
                </button>
                <h2 className="font-display text-xl font-bold">Réinitialiser le mot de passe</h2>
              </div>
              <p className="text-sm text-[rgb(var(--text-muted))]">
                Saisissez votre e-mail professionnel, nous vous enverrons un lien sécurisé pour définir un nouveau mot de passe.
              </p>
              <form onSubmit={submit} className="mt-6 space-y-4">
                <div>
                  <label className="input-label">E-mail professionnel</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[rgb(var(--text-muted))]" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="vous@medical-wellness.ma"
                      className="input pl-10"
                    />
                  </div>
                </div>
                <button type="submit" disabled={loading} className="btn-gold w-full justify-center">
                  {loading && <Loader2 size={16} className="animate-spin" />}
                  Envoyer le lien
                </button>
              </form>
              <p className="text-xs text-[rgb(var(--text-muted))] text-center mt-5">
                <Link href="/login" className="text-gold-600 dark:text-gold-300 font-medium hover:underline">
                  ← Retour à la connexion
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}