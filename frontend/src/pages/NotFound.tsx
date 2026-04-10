import { useLocation, Navigate } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  // Handle redirects for old URLs
  const redirectMap: { [key: string]: string } = {
    '/home-v2': '/',
    '/home': '/',
    '/templates': '/all-framer-templates',
    '/lovable-templates': '/all-framer-templates',
    '/saas': '/saas-templates'
  };

  const redirectPath = redirectMap[location.pathname];
  
  if (redirectPath) {
    return <Navigate to={redirectPath} replace />;
  }

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-4">Oops! Page not found</p>
        <a href="/" className="text-blue-500 hover:text-blue-700 underline">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
