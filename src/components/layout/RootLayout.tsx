import { Outlet, ScrollRestoration } from "react-router-dom";
import Header from "../Header";
import Footer from "../Footer";

/** App shell: sticky header, routed page in <Outlet/>, footer. */
export default function RootLayout() {
  return (
    <div className="min-h-screen bg-canvas flex flex-col overflow-x-hidden">
      <Header />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
      <ScrollRestoration />
    </div>
  );
}
