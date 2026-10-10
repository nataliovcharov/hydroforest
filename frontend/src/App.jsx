import { Navigate, Route, Routes } from "react-router-dom";
import { GuestOnly, RequireAuth, TabLayout } from "./components/Layouts";
import Home from "./pages/Home";
import Forest from "./pages/Forest";
import History from "./pages/History";
import Friends from "./pages/Friends";
import Leaderboard from "./pages/Leaderboard";
import Account from "./pages/Account";
import ChangeEmail from "./pages/ChangeEmail";
import ChangePassword from "./pages/ChangePassword";
import About from "./pages/About";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <Routes>
      <Route element={<GuestOnly />}>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Route>

      <Route element={<RequireAuth />}>
        <Route element={<TabLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/forest" element={<Forest />} />
          <Route path="/calendar" element={<History />} />
          <Route path="/social" element={<Friends />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
        </Route>
        <Route path="/account" element={<Account />} />
        <Route path="/change-email" element={<ChangeEmail />} />
        <Route path="/change-password" element={<ChangePassword />} />
      </Route>

      <Route path="/about" element={<About />} />

      {/* Old addresses from the first version of the app */}
      <Route path="/aboutus" element={<Navigate to="/about" replace />} />
      <Route path="/forgotpassword" element={<Navigate to="/forgot-password" replace />} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
