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
    confirm: "/auth/confirm",
    confirmationSuccess: "/auth/confirmation-success",
    createAccount: "/auth/create-account",
    error: "/auth/error",
    signIn: "/auth/sign-in",
  }
};
