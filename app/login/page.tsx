"use client";

import { LoginForm } from "@/components/login/login-form";
import { useLocale } from "@/lib/i18n/locale-provider";

export default function LoginPage() {
  const { t } = useLocale();

  return (
    <main className="relative flex min-h-dvh flex-1 items-center justify-center overflow-hidden bg-slate-950 px-4 py-10 sm:px-6">
      <div
        className="absolute inset-0 bg-[url('/celiaLogin.jfif')] bg-cover bg-center"
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-slate-950/60" aria-hidden="true" />

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 flex justify-center">
        </div>

        <div className="rounded-2xl border border-white/10 bg-card/95 p-8 shadow-2xl backdrop-blur-sm sm:p-10">
          <div className="mb-8 space-y-1.5">
            <h2 className="text-2xl font-extrabold text-foreground">{t.login.title}</h2>
            <p className="text-sm text-muted-foreground">{t.login.subtitle}</p>
          </div>

          <LoginForm />
        </div>
      </div>
    </main>
  );
}
