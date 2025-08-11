export const paths = {
  root: "/",
  home: "/home",
  profile: "/profile",
  pricing: "/pricing",
  simulator: (id: string) => `/simulator/${id}`,
  review: (id: string) => `/review/${id}`,
  questions: "/questions",
  error: {
    404: "/error/404",
  },
  auth: {
    authCodeError: "/auth/auth-code-error",
    confirm: "/auth/confirm",
    confirmationSuccess: "/auth/confirmation-success",
    createAccount: "/auth/create-account",
    signIn: "/auth/sign-in",
  }
};
