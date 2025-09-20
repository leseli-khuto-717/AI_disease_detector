import { ReactNode } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function LayoutClient({ children }: { children: ReactNode }) {

  return (
    <>
    <Navbar />
      <main className="flex-grow p-4">{children}</main>
      <Footer />
    </>
  );
}
