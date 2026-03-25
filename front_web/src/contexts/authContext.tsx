import {
  createContext,
  ReactNode,
  useState,
  useEffect,
  useContext,
} from "react";
import { UserContext } from "./userContext";

type Props = {
  children?: ReactNode;
};

type IAuthContext = {
  authenticated: boolean;
  setAuthenticated: (newState: boolean) => void;
};

const initialValue = {
  authenticated: false,
  setAuthenticated: () => {},
};

const AuthContext = createContext<IAuthContext>(initialValue);

const AuthProvider = ({ children }: any) => {
  const [authenticated, setAuthenticated] = useState(
    initialValue.authenticated
  );

  //Pega a função setUser do UserContext
  const { setUser } = useContext(UserContext);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const userData = localStorage.getItem("userData");

    if (token && userData) {
      setAuthenticated(true);
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error("Failed to parse user data from localStorage", error);
        localStorage.removeItem("userData");
        setUser(null as any);
        setAuthenticated(false);
      }
    } else {
      setAuthenticated(false);
      setUser(null as any);
    }
  }, [setUser]);

  return (
    <AuthContext.Provider value={{ authenticated, setAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
