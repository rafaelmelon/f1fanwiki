import { Link } from "react-router-dom";
import { usePageTitle } from "../lib/usePageTitle";

export default function NotFound() {
  usePageTitle("Not Found");
  return (
    <div className="py-20 text-center">
      <h1 className="text-3xl font-bold">404</h1>
      <p className="mt-2 text-f1-text-muted">This page doesn't exist.</p>
      <Link to="/" className="mt-6 inline-block text-f1-red hover:underline">
        Back to Home
      </Link>
    </div>
  );
}
