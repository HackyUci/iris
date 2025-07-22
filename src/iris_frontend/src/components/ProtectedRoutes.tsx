import React, { useState, useEffect, ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { authService } from "../services/auth.service";
import Layout from "../layout";

interface ProtectedRouteProps {
  children: ReactNode;
  requireRole?: "Customer" | "Merchant";
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireRole,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [userRole, setUserRole] = useState<"Customer" | "Merchant" | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await authService.init();
        const isAuth = await authService.isAuthenticated();
        setIsAuthenticated(isAuth);

        if (isAuth) {
          let profile = await authService.getUserProfile();
          if (!profile && location.pathname !== "/select-role") {
            console.log("Profile not found, retrying after 1 second...");
            await new Promise((resolve) => setTimeout(resolve, 1000));
            profile = await authService.getUserProfile();
          }
          console.log("Final profile:", profile);
          setUserRole(profile?.role || null);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        setIsAuthenticated(false);
        setUserRole(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [location.pathname]);

  if (loading || isAuthenticated === null) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#f8fafc",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: "32px",
              height: "32px",
              border: "2px solid #e5e7eb",
              borderTop: "2px solid #3b82f6",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto",
            }}
          ></div>
          <p style={{ color: "#6b7280", marginTop: "16px" }}>
            Checking authentication...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log("Not authenticated, redirecting to /login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!userRole && location.pathname !== "/select-role") {
    console.log("No user role, redirecting to /select-role");
    return <Navigate to="/select-role" state={{ from: location }} replace />;
  }

  if (requireRole && userRole !== requireRole) {
    console.log(
      `Role mismatch: required ${requireRole}, got ${userRole}, redirecting to /unauthorized`
    );
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }

  return (
    <Layout userRole={userRole} isAuthenticated={isAuthenticated}>
      {children}
    </Layout>
  );
};

export default ProtectedRoute;
