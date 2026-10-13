"use client";

import { useClerk } from "@clerk/nextjs";

/** Ends the Clerk session and lands on `redirectUrl`. Styled by the caller, like any button. */
export function SignOutButton({
  redirectUrl = "/",
  className,
  children,
}: {
  redirectUrl?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const { signOut } = useClerk();
  return (
    <button type="button" onClick={() => signOut({ redirectUrl })} className={className}>
      {children}
    </button>
  );
}
