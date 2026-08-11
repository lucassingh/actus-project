import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import { Zap, ArrowLeft } from "lucide-react";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-[#0A2463] via-[#0d2e7a] to-[#051e41] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
      {/* Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#F97316] rounded-full opacity-10 blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md flex flex-col items-center">
        {/* Back link */}
        <Link
          href="/"
          className="self-start mb-6 flex items-center gap-1.5 text-blue-300 hover:text-white text-sm transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Volver al inicio
        </Link>

        {/* Logo + tagline */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center gap-2.5 mb-4">
            <div className="w-11 h-11 bg-white/10 border border-white/20 rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-[#F97316]" fill="#F97316" />
            </div>
            <span className="text-3xl font-bold text-white">Actus</span>
          </div>
          <p className="text-blue-300 text-sm">Gestión de incidentes industriales</p>
        </div>

        {/* Clerk SignIn */}
        <SignIn
          appearance={{
            variables: {
              colorPrimary: "#0A2463",
              colorBackground: "#ffffff",
              colorDanger: "#EF4444",
              borderRadius: "0.75rem",
              fontFamily: "inherit",
              fontSize: "14px",
            },
            elements: {
              card: "shadow-2xl border-0 rounded-2xl",
              headerTitle: "text-xl font-bold text-[#0A2463]",
              headerSubtitle: "text-[#5A6B7C] text-sm",
              formButtonPrimary:
                "bg-[#0A2463] hover:bg-[#051e41] text-white font-semibold rounded-xl py-2.5 transition-colors",
              formFieldInput:
                "border-gray-200 focus:border-[#0A2463] focus:ring-[#0A2463]/20 rounded-xl",
              footerActionLink: "text-[#0A2463] hover:text-[#051e41] font-semibold",
              identityPreviewEditButton: "text-[#0A2463]",
              dividerLine: "bg-gray-100",
              socialButtonsBlockButton:
                "border-gray-200 hover:bg-gray-50 rounded-xl font-medium",
              socialButtonsBlockButtonText: "text-gray-700",
            },
          }}
        />

        <p className="mt-6 text-blue-400 text-xs text-center">
          ¿No tenés cuenta?{" "}
          <Link href="/sign-up" className="text-[#F97316] hover:text-orange-300 font-semibold transition-colors">
            Registrate gratis
          </Link>
        </p>
      </div>
    </div>
  );
}
