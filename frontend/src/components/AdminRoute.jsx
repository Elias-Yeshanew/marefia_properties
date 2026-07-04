import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const AdminRoute = ({ children }) => {
    const { user, token } = useContext(AuthContext);

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // Check if user exists and has 'admin' or 'broker' role
    if (!user || (!['admin', 'broker'].includes(user.role))) {
        return <Navigate to="/" replace />; // Redirect to home if not authorized
    }

    return children;
};

export default AdminRoute;