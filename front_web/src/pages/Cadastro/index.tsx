import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "../../components/Navbar";
import axios from "axios";
import { IEstadoCidades } from "../../types/IEstadoCidade";
import api from "../../services/api";
import { toast } from "sonner";
import { formatarCelular } from "../../utils/format-celular";

const formatCPF = (value: string) => {
  if (!value) return "";
  value = value.replace(/\D/g, "");
  value = value.replace(/(\d{3})(\d)/, "$1.$2");
  value = value.replace(/(\d{3})(\d)/, "$1.$2");
  value = value.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  return value.slice(0, 14); // Limita o tamanho
};

/**
 * Formata um valor de string para um formato de CNPJ XX.XXX.XXX/XXXX-XX.
 */
const formatCNPJ = (value: string) => {
  if (!value) return "";
  value = value.replace(/\D/g, "");
  value = value.replace(/^(\d{2})(\d)/, "$1.$2");
  value = value.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3");
  value = value.replace(/\.(\d{3})(\d)/, ".$1/$2");
  value = value.replace(/(\d{4})(\d)/, "$1-$2");
  return value.slice(0, 18); // Limita o tamanho
};

export const Cadastro = () => {
  const [tipo_usuario, setTipoUsuario] = useState<string>("pf");
  const [nm_usuario, setNmUsuario] = useState<string>("");
  const [ch_documento_usuario, setChDocumentoUsuario] = useState<string>("");
  const [cd_email_usuario, setCdEmailUsuario] = useState<string>("");
  const [nr_celular_usuario, setNrCelularUsuario] = useState<string>("");
  const [dt_nascimento_usuario, setDtNascimentoUsuario] = useState<string>("");
  const [cd_senha_usuario, setCdSenhaUsuario] = useState<string>("");
  const [cd_senha_usuario_confirmacao, setCdSenhaUsuarioConfirmacao] =
    useState<string>("");
  const [sg_estado_usuario, setSgEstadoUsuario] = useState<string>("");
  const [nm_cidade_usuario, setNmCidadeUsuario] = useState<string>("");

  const navigate = useNavigate();
  const [listaEstadosCidades, setListaEstadosCidades] = useState<
    IEstadoCidades[]
  >([]);
  const [listaCidades, setListaCidades] = useState<string[]>([]);
  const [cidadeSelecionada, setCidadeSelecionada] = useState<string>("");

  const [documentoMascarado, setDocumentoMascarado] = useState<string>("");
  const [celularMascarado, setCelularMascarado] = useState<string>("");

  useEffect(() => {
    api
      .get("/api/estadosCidades")
      .then((response) => {
        setListaEstadosCidades(response.data);
      })
      .catch((err) => {
        console.log("Error: " + err);
      });
  }, []);

  const handleChangeEstadoSelecionado = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selectedEstado = event.target.value;
    const estado = listaEstadosCidades.find(
      (estado) => estado.sg_estado === selectedEstado
    )!.cidades;
    setListaCidades(estado);
    setSgEstadoUsuario(selectedEstado);
  };

  const handleChangeCidadeSelecionada = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selectCidade = event.target.value;
    setCidadeSelecionada(selectCidade);
    setNmCidadeUsuario(selectCidade);
  };

  const handleDocumentoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, "");
    setChDocumentoUsuario(rawValue);

    if (tipo_usuario === "pf") {
      setDocumentoMascarado(formatCPF(rawValue));
    } else {
      setDocumentoMascarado(formatCNPJ(rawValue));
    }
  };

  const handleCelularChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, "");
    setNrCelularUsuario(rawValue);

    setCelularMascarado(formatarCelular(rawValue));
  };

  const handleTipoUsuarioChange = (value: string) => {
    setTipoUsuario(value);
    setChDocumentoUsuario(""); // Limpa o valor real
    setDocumentoMascarado(""); // Limpa o valor visual
  };

  const validateForm = (event: any, tipo_usuario: string) => {
    if (!nm_usuario) {
      toast.error("Nome é obrigatório");
      return false;
    }

    if (!ch_documento_usuario) {
      toast.error(
        tipo_usuario === "pf" ? "CPF é obrigatório" : "CNPJ é obrigatório"
      );
      return false;
    }

    if (!cd_email_usuario) {
      toast.error("Email é obrigatório");
      return false;
    }

    if (!nr_celular_usuario) {
      toast.error("Celular é obrigatório");
      return false;
    }

    if (!cd_senha_usuario) {
      toast.error("Senha é obrigatória");
      return false;
    }

    if (!cd_senha_usuario_confirmacao) {
      toast.error("Confirme sua senha");
      return false;
    }

    if (cd_senha_usuario_confirmacao !== cd_senha_usuario) {
      toast.error("A confirmação da senha deve ser igual à senha");
      return false;
    }

    if (!sg_estado_usuario) {
      toast.error("Estado é obrigatório");
      return false;
    }

    if (!nm_cidade_usuario) {
      toast.error("Cidade é obrigatória");
      return false;
    }

    return true;
  };
  let user_infos = {};
  const handleSubmit = (event: any) => {
    event.preventDefault();

    const tipo_usuario = event.target.tipo_usuario.value;

    if (!validateForm(event, tipo_usuario)) {
      return;
    }

    if (tipo_usuario === "pf") {
      user_infos = {
        tipo_usuario: tipo_usuario,
        nm_usuario: nm_usuario,
        ch_cpf_usuario: ch_documento_usuario,
        cd_email_usuario: cd_email_usuario,
        nr_celular_usuario: nr_celular_usuario,
        dt_nascimento_usuario: new Date(dt_nascimento_usuario),
        cd_senha_usuario: cd_senha_usuario,
        sg_estado_usuario: sg_estado_usuario,
        nm_cidade_usuario: nm_cidade_usuario,
        cd_foto_usuario: "default.png",
        fg_admin: 0,
        qt_advertencias_usuario: 0,
        fg_usuario_deletado: 0,
      };
    } else {
      user_infos = {
        tipo_usuario: tipo_usuario,
        nm_usuario: nm_usuario,
        ch_cnpj_usuario: ch_documento_usuario,
        cd_email_usuario: cd_email_usuario,
        nr_celular_usuario: nr_celular_usuario,
        cd_senha_usuario: cd_senha_usuario,
        sg_estado_usuario: sg_estado_usuario,
        nm_cidade_usuario: nm_cidade_usuario,
        cd_foto_usuario: "default.png",
        fg_admin: 0,
        qt_advertencias_usuario: 0,
        fg_usuario_deletado: 0,
      };
    }

    const handleDBInsert = async () => {
      try {
        const response = await api.post("/api/usuarioCadastro", {
          user_infos: user_infos,
        });

        const successMessage = response.data.message;
        toast.success(successMessage || "Cadastro realizado com sucesso!");

        navigate("/login");
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          const responseData = error.response.data;
          if (responseData.errors && responseData.errors.user_infos) {
            const specificError = responseData.errors.user_infos[0];
            toast.error(specificError);
          } else if (responseData.message) {
            toast.error(responseData.message);
          } else {
            toast.error(
              "Não foi possível realizar o cadastro. Tente novamente."
            );
          }
        } else {
          toast.error("Erro de conexão. Tente novamente mais tarde.");
          console.error("Erro inesperado:", error);
        }
      }
    };

    handleDBInsert();
  };

  return (
    <>
      <Navbar page="Cadastro" />
      <main className="lyt_forms pg_cadastro">
        <div className="form-container column">
          <p className="sub titulo">Cadastrar-se</p>
          <form
            className="form-login column"
            method="POST"
            onSubmit={handleSubmit}
          >
            <div className="row cpfj">
              <div className="row">
                <input
                  type="radio"
                  name="tipo_usuario"
                  id="pf"
                  value="pf"
                  checked={tipo_usuario === "pf"}
                  onChange={() => handleTipoUsuarioChange("pf")} // ATUALIZADO
                />
                <label htmlFor="pf">Pessoa Física</label>
              </div>
              <div className="row">
                <input
                  type="radio"
                  name="tipo_usuario"
                  id="pj"
                  value="pj"
                  checked={tipo_usuario === "pj"}
                  onChange={() => handleTipoUsuarioChange("pj")} // ATUALIZADO
                />
                <label htmlFor="pj">Pessoa Jurídica</label>
              </div>
            </div>
            <label className="lblNome" htmlFor="">
              {tipo_usuario === "pf" ? "Nome completo" : "Nome da instituição"}
            </label>
            <input
              className="input-form"
              type="text"
              name="nm_usuario"
              value={nm_usuario}
              onChange={(e) => setNmUsuario(e.target.value)}
            />

            <label className="lblCpf" htmlFor="">
              {tipo_usuario === "pf" ? "CPF" : "CNPJ"}
            </label>
            <input
              className="input-form"
              type="text" // Manter como 'text' para máscaras
              name="ch_documento_usuario"
              value={documentoMascarado} // ATUALIZADO: usa estado visual
              onChange={handleDocumentoChange} // ATUALIZADO: usa novo handler
              maxLength={tipo_usuario === "pf" ? 14 : 18} // Limita o input
            />

            <label htmlFor="">Email</label>
            <input
              className="input-form"
              type="email"
              name="cd_email_usuario"
              placeholder="exemplo@email.com"
              value={cd_email_usuario}
              onChange={(e) => setCdEmailUsuario(e.target.value)}
            />

            <label htmlFor="">Celular</label>
            <input
              className="input-form"
              type="tel" // 'tel' é bom para semântica em mobile
              name="nr_celular_usuario"
              value={celularMascarado} // ATUALIZADO: usa estado visual
              onChange={handleCelularChange} // ATUALIZADO: usa novo handler
              maxLength={15} // (XX) XXXXX-XXXX
            />

            {tipo_usuario === "pf" && (
              <div className="column nascWrapper">
                <label className="lblDtNasc" htmlFor="">
                  Data de nascimento
                </label>
                <input
                  className="input-form"
                  type="date"
                  name="dt_nascimento_usuario"
                  value={dt_nascimento_usuario}
                  onChange={(e) => setDtNascimentoUsuario(e.target.value)}
                />
              </div>
            )}

            <div className="column passWrapper">
              <label htmlFor="">Senha</label>
              <input
                className="input-form"
                type="password"
                name="cd_senha_usuario"
                value={cd_senha_usuario}
                onChange={(e) => setCdSenhaUsuario(e.target.value)}
              />
            </div>

            <label htmlFor="">Confirme sua senha</label>
            <input
              className="input-form"
              type="password"
              name="cd_senha_usuario_confirmacao"
              value={cd_senha_usuario_confirmacao}
              onChange={(e) => setCdSenhaUsuarioConfirmacao(e.target.value)}
            />

            <div className="row">
              <div className="column">
                <label htmlFor="">Estado</label>
                <select
                  name="sg_estado_usuario"
                  className="input-form"
                  id="estadoCampanha"
                  value={sg_estado_usuario}
                  onChange={handleChangeEstadoSelecionado}
                >
                  <option value="0" disabled={true}>
                    Selecione o Estado
                  </option>
                  {listaEstadosCidades.map((estado, index) => (
                    <option key={index} value={estado.sg_estado}>
                      {estado.sg_estado}
                    </option>
                  ))}
                </select>
              </div>
              <div className="column">
                <label htmlFor="">Cidade</label>
                <select
                  name="nm_cidade_usuario"
                  className="input-form"
                  id="cidadeCampanha"
                  value={nm_cidade_usuario}
                  onChange={handleChangeCidadeSelecionada}
                >
                  <option value="0" disabled={true}>
                    Selecione a Cidade
                  </option>
                  {listaCidades.map((cidade, index) => (
                    <option key={index} value={cidade}>
                      {cidade}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <input className="btn btn blue" type="submit" value="Cadastrar" />
          </form>
        </div>
      </main>
    </>
  );
};

export default Cadastro;