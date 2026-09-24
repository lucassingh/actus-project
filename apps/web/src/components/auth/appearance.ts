/** Clerk element overrides shared by sign-in and sign-up: flat card with a hairline, no shadow. */
export const authAppearance = {
  elements: {
    rootBox: "w-full",
    cardBox: "w-full shadow-none border border-line rounded-lg",
    card: "shadow-none",
    headerTitle: "text-lg font-semibold tracking-[-0.01em]",
    formButtonPrimary: "h-9 shadow-none text-sm font-medium",
    socialButtonsBlockButton: "h-9 border-line shadow-none",
    formFieldInput: "h-9 shadow-none border border-line focus:border-primary",
    footer: "bg-[#FAFAFB] border-t border-line",
  },
};
