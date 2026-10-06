/** Clerk element overrides shared by sign-in and sign-up: flat card with a hairline, no shadow. */
export const authAppearance = {
  elements: {
    rootBox: "w-full",
    cardBox: "w-full shadow-none border border-line rounded-lg",
    card: "shadow-none",
    headerTitle: "text-lg font-semibold tracking-[-0.01em]",
    formButtonPrimary: "h-9 shadow-none text-sm font-medium",
    // `shadow-none` removes the box-shadow Clerk draws as the button's border, so the border has to be
    // explicit (width + color) or "Continuar con Google" reads as plain text.
    socialButtonsBlockButton: "h-9 border border-line bg-white shadow-none hover:bg-[#FAFAFB]",
    formFieldInput: "h-9 shadow-none border border-line focus:border-primary",
    footer: "bg-[#FAFAFB] border-t border-line",
  },
};
