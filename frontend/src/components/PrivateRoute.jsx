import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const PrivateRoute = ({ children, requiredRole }) => {
    const { user, token } = useContext(AuthContext);

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    if (requiredRole && (!user || user.role !== requiredRole)) {
        return <Navigate to="/" replace />; // Or a specific unauthorized page
    }

    return children;
};

export default PrivateRoute;