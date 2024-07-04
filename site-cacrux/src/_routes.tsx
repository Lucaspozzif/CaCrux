import { DevlogPage } from "./Pages/devlog/devlog";
import { Home } from "./Pages/home/home";
import { SchedulePage } from "./Pages/schedule-page/schedule-page";

export const routes = [
  { path: "/", element: <Home /> },
  { path: "/coastro", element: <SchedulePage /> },
  { path: "/devlog", element: <DevlogPage /> },
];
