import { createContext, useState, useEffect } from 'react';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const getInitialState = () => {
    const authString = sessionStorage.getItem('fusempraut');
    try {
      const authDetails = JSON.parse(authString);
      return authDetails || { success: false };
    } catch (error) {
      console.log(error);
      return { success: false };
    }
  };

  const [auth, setAuth] = useState(getInitialState);

  const [notifCount, setNotifCount] = useState(() => {
    const storedCount = sessionStorage.getItem("ranotlf");
    return storedCount || 0;
  });

  const [query, setQuery] = useState(() => {
    const storedQuery = sessionStorage.getItem("reqrsluy");
    return storedQuery || "";
  });

  const [focused, setFocused] = useState(() => {
    const storedQuery = sessionStorage.getItem("rslcusof");
    return storedQuery === "true" || false;
  });

  useEffect(() => {
    sessionStorage.setItem("fusempraut", JSON.stringify(auth));
    // sessionStorage.setItem('isopisrslt', isPoints);
    sessionStorage.setItem("ranotlf", notifCount);
    sessionStorage.setItem("reqrsluy", query);
    sessionStorage.setItem("rslcusof", String(focused));
  }, [auth, notifCount, query, focused]);

  return (
    <AuthContext.Provider
      value={{
        auth,
        setAuth,
        notifCount,
        setNotifCount,
        query,
        setQuery,
        focused,
        setFocused,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
