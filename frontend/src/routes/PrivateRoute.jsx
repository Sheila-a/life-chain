import { Navigate } from "react-router-dom";
// import Dashboard from "../layout/Dashboard";
import useAuth from "../hooks/useAuth";

const PrivateRoute = ({ isExpanded, onClick }) => {
  const { auth } = useAuth();

  // return <Dashboard isExpanded={isExpanded} onClick={onClick} />;
  return auth?.success ? (
    <>dd</>
  ) : (
    // <Dashboard isExpanded={isExpanded} onClick={onClick} />
    <Navigate to="/" replace />
  );
};

export default PrivateRoute;
