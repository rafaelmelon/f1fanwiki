import { lazy } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import App from "./App";
import ErrorBoundary from "./components/ErrorBoundary";

const Home = lazy(() => import("./pages/Home"));
const Seasons = lazy(() => import("./pages/Seasons"));
const Season = lazy(() => import("./pages/Season"));
const Race = lazy(() => import("./pages/Race"));
const CurrentRace = lazy(() => import("./pages/CurrentRace"));
const Drivers = lazy(() => import("./pages/Drivers"));
const Driver = lazy(() => import("./pages/Driver"));
const Compare = lazy(() => import("./pages/Compare"));
const Greatest = lazy(() => import("./pages/Greatest"));
const Circuits = lazy(() => import("./pages/Circuits"));
const NotFound = lazy(() => import("./pages/NotFound"));

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <BrowserRouter>
      <Routes>
        <Route element={<App />}>
          <Route index element={<Home />} />
          <Route path="race" element={<CurrentRace />} />
          <Route path="seasons" element={<Seasons />} />
          <Route path="season/:year" element={<Season />} />
          <Route path="season/:year/race/:round" element={<Race />} />
          <Route path="drivers" element={<Drivers />} />
          <Route path="driver/:driverId" element={<Driver />} />
          <Route path="greatest" element={<Greatest />} />
          <Route path="circuits" element={<Circuits />} />
          <Route path="compare" element={<Compare />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </ErrorBoundary>
);
