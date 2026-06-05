import { BrowserRouter as Router } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import { BookingProvider } from "./context/BookingContext";
import Navbar from "./components/Navbar";
import AppRoutes from "./routes/AppRoutes";

function App() {
  return (
    <AuthProvider>
      <Router>
        <BookingProvider>
          <Navbar />
          <AppRoutes />
        </BookingProvider>
      </Router>
    </AuthProvider>
  );
}

export default App;