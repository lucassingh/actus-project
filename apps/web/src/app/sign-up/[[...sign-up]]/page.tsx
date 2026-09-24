import { SignUp } from "@clerk/nextjs";
import { AuthShell } from "@/components/auth/AuthShell";
import { authAppearance } from "@/components/auth/appearance";

export default function SignUpPage() {
  return (
    <AuthShell>
      <SignUp appearance={authAppearance} />
    </AuthShell>
  );
}
