Arquivo: src/components/ProtectedRoute.jsx

```jsx
import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    async function loadSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      setSession(session);
      setLoading(false);
    }

    loadSession();
  }, []);

  if (loading) return <div>Carregando...</div>;

  if (!session) return <Navigate to="/login" replace />;

  return children;
}
```

