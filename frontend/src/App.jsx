import AppRoutes from "./routes/AppRoutes";
import { AuthProvider } from "./contexts/AuthContext";
import { UserProvider } from "./contexts/UserContext";
import { EventProvider } from "./contexts/EventContext";

function App() {
  return (
    <AuthProvider>
      <UserProvider>
        <EventProvider>
          <AppRoutes />
        </EventProvider>
      </UserProvider>
    </AuthProvider>
  );
}

export default App;
