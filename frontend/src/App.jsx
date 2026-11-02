import EventCreate from "./pages/EventCreate";
import OrganizerDashboard from "./pages/OrganizerDashboard";
import { Route, Routes } from "react-router";

import Layout from "./components/layout/Layout";

import Home from "./pages/Home";
import Events from "./pages/Events";
import EventDetails from "./pages/EventDetails";
import Login from "./pages/Login";
import Register from "./pages/Register";
import BookingConfirmation from "./pages/BookingConfirmation";

function App() {
  return (
    <Routes>
      
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />

        <Route path="/events" element={<Events />} />

        <Route
          path="/events/:id"
          element={<EventDetails />}
        />

        <Route
          path="/booking-confirmation/:id"
          element={<BookingConfirmation />}
        />
        <Route
          path="/organizer/dashboard"
          element={<OrganizerDashboard />}
        />
        <Route
        path="/organizer/events/create"
        element={<EventCreate />}
        />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route
        path="/organizer/events/create"
        element={<EventCreate />}
        />
      </Route>
    </Routes>
  );
}

export default App;