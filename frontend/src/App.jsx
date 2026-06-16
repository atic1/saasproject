import { BrowserRouter as Router } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import { BookingProvider } from "./context/BookingContext";
import AppRoutes from "./routes/AppRoutes";

function App() {
  return (
    <AuthProvider>
      <Router>
        <BookingProvider>
          <AppRoutes />
        </BookingProvider>
      </Router>
    </AuthProvider>
  );
}

export default App;
