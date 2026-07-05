/** Central route table — one source of truth for URLs across the app. */
export const paths = {
  home: "/",
  catalog: "/catalog",
  project: (id: string) => `/catalog/${id}`,
  afisha: "/afisha",
  announcements: "/announcements",
  about: "/about",
  cabinet: "/cabinet",
  create: "/cabinet/new",
  admin: "/admin",
  login: "/login",
  register: "/register",
} as const;
