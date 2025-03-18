import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import { VideoRoom } from "./pages/VideoRoom.tsx";
import "./index.css";
import { SocketProvider } from "./components/providers/SocketProvider.tsx";
import { RoomSelectPage } from "./pages/RoomSelectPage.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SocketProvider>
      <BrowserRouter>
        <Routes>
          <Route index element={<RoomSelectPage />} />
          <Route path="/room/:id" element={<VideoRoom />} />
        </Routes>
      </BrowserRouter>
    </SocketProvider>
  </StrictMode>
);
