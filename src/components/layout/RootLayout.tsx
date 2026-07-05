import { Outlet, ScrollRestoration, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import Header from "../Header";
import Footer from "../Footer";
import { pageTransition } from "../../lib/motion";

/** App shell: sticky header, routed page in <Outlet/> with soft transitions, footer. */
export default function RootLayout() {
  const location = useLocation();
  return (
    <div className="min-h-screen bg-canvas flex flex-col overflow-x-hidden">
      <Header />
      <main className="flex-grow">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location.pathname}
            initial={pageTransition.initial}
            animate={pageTransition.animate}
            exit={pageTransition.exit}
            transition={pageTransition.transition}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
      <ScrollRestoration />
    </div>
  );
}
