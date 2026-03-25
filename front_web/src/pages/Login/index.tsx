import { Navbar } from "../../components/Navbar";

import { Link, useNavigate } from "react-router-dom";

import { useContext, useState } from "react";
import { AuthContext } from "../../contexts/authContext";
import { UserContext } from "../../contexts/userContext";
import { IUsuario } from "../../types/IUsuario";
import axios from "axios";
import api from "../../services/api";
import { toast } from "sonner";

export const Login = () => {
  const [visiblePass, setVisiblePass] = useState(false);
  const { authenticated, setAuthenticated } = useContext(AuthContext);
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();

  type responseUserData = {
    user: IUsuario;
    token: string;
    authenticated: Boolean;
    message: String;
  };

  type responseLogin = {
    data: responseUserData;
    status: Number;
  };

  const handleSubmit = (event: any) => {
    event.preventDefault();

    const user_email = event.target.email.value;
    const user_password = event.target.password.value;

    if (!user_email || !user_password) {
      toast.error("Por favor preencha todos os campos");
      return;
    }
    const userLogin = async () => {
      try {
        const response = await api.post<responseUserData>("/api/usuarioLogin", {
          user_email: user_email,
          user_password: user_password,
        });
        const responseLogin: responseLogin = {
          status: response.status,
          data: {
            user: response.data.user,
            token: response.data.token,
            authenticated: response.data.authenticated,
            message: response.data.message,
          },
        };
        return responseLogin;
      } catch (error) {
        console.error("Erro:", error);
        throw error;
      }
    };

    const handleUserLogin = async () => {
      try {
        const { status, data } = await userLogin();
        if (status !== 200) {
          console.log("Erro ao fazer login");
        } else {
          if (data.authenticated) {
            console.log("Login realizado com sucesso", data);

            // Armazena o token e os dados do usuário
            localStorage.setItem("authToken", data.token);
            localStorage.setItem("userData", JSON.stringify(data.user));
            localStorage.setItem("userId", data.user.id);
            // Se for admin, salva adminId também
            if (data.user.fg_admin === 1) {
              localStorage.setItem("adminId", data.user.id);
            } else {
              localStorage.removeItem("adminId");
            }

            setAuthenticated(true);
            setUser(data.user);
            navigate("/descobrir");
          } else {
            toast.error(
              "Usuario ou senha inválidos. Por favor, tente novamente."
            );
          }
        }
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          const errorMessage = error.response.data.message;
          toast.error(errorMessage || "Ocorreu um erro desconhecido.");
        } else {
          toast.error(
            "Não foi possível conectar ao servidor. Tente novamente."
          );
          console.error("Erro inesperado:", error);
        }
      }
    };

    handleUserLogin();

    event.target.reset();
  };

  function showPassword() {
    setVisiblePass(!visiblePass);
  }

  return (
    <>
      <Navbar page="Login" />

      <main className="lyt_forms pg_login">
        <div className="form-container column">
          <p className="sub titulo">Login</p>
          <form
            className="form-login column"
            method="POST"
            onSubmit={handleSubmit}
          >
            <label htmlFor="">Email</label>
            <input className="input-form" type="email" name="email" />
            <div className="chkbx-container exibir row" id="">
              <input
                className="checkbox-form"
                type="checkbox"
                name=""
                id="ckbExibir"
                onChange={showPassword}
              />
              <label className="" htmlFor="ckbExibir">
                Exibir senha
              </label>
            </div>
            <label htmlFor="">Senha</label>
            <input
              className="input-form pass"
              type={visiblePass ? "text" : "password"}
              name="password"
            />
            <Link className="titulo-link" to="#">
              Esqueci minha senha
            </Link>
            <input className="btn btn blue" type="submit" value="Entrar" />
          </form>
        </div>
      </main>
    </>
  );
};
