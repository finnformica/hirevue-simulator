export const paths = {
  root: "/",
  home: "/home",
  profile: "/profile",
  simulator: (id: string) => `/simulator/${id}`,
  review: (id: string) => `/review/${id}`,
  questions: "/questions",
  error: {
    404: "/error/404",
  },
  signIn: "/auth/sign-in",
  createAccount: "/auth/create-account",
  signOut: "/auth/sign-out",
  confirm: "/auth/confirm",
  authCodeError: "/auth/auth-code-error",
};
