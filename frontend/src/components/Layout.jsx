import { useEffect } from "react";

import Header from "./Header";
import Sidebar from "./Sidebar";

export default function Layout({ children }) {

  useEffect(() => {

    const isLogin = localStorage.getItem("isLogin");

    if (!isLogin) {
      window.location.href = "/login";
    }

  }, []);

  return (
    <div>
      <Header />

      <div style={{ display: "flex" }}>
        <Sidebar />

        <main style={{ flexGrow: 1 }} className="p-4">
          {children}
        </main>
      </div>
    </div>
  );
}