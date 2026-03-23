/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import NProgress from "nprogress";
import Loading from "./components/skeletons/Loading";
import PublicRoute from "./routes/PublicRoute";
import PrivateRoute from "./routes/PrivateRoute";
import HomePage from "./pages/Home";
import HospitalLogin from "./pages/HospitalLogin";
import HospitalRegister from "./pages/HospitalRegister";
import HospitalDashboard from "./pages/HospitalDashboard";
import PublicSearch from "./pages/PublicSearch";

function App() {
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  // const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    NProgress.start();
    setLoading(true);

    const timeout = setTimeout(() => {
      NProgress.done();
      setLoading(false);
    }, 5);

    return () => clearTimeout(timeout);
  }, [location.pathname]);

  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <Routes>
          <Route path="/" element={<PublicRoute />}>
            <Route path="" element={<HomePage />} />
            <Route path="portal" element={<HospitalLogin />} />
            <Route path="portal/new" element={<HospitalRegister />} />
            <Route path="search" element={<PublicSearch />} />
            {/* <Route path="create-account" element={<Register />} />
            <Route path="verify" element={<VerifyOtp />} /> */}
          </Route>
          {/* <Route path="/dashboard" element={<PrivateRoute />}> */}
          <Route path="/dashboard" element={<HospitalDashboard />} />
          {/* </Route> */}
        </Routes>
      )}
    </>
  );
}

export default App;
