/** Central route table — one source of truth for URLs across the app. */
export const paths = {
  home: "/",
  catalog: "/catalog",
  project: (id: string) => `/catalog/${id}`,
  afisha: "/afisha",
  event: (id: string) => `/afisha/${id}`,
  announcements: "/announcements",
  about: "/about",
  cabinet: "/cabinet",
  create: "/cabinet/new",
  admin: "/admin",
  login: "/login",
  register: "/register",
  reset: "/reset",
} as const;
