import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./components/Navbar";
import Loader from "./components/Loader";

export default function App() {
  return (
    <div className="min-h-screen bg-f1-bg text-f1-text">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <Suspense fallback={<Loader />}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
}
