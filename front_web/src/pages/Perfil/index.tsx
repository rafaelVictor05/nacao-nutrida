import React, { useEffect, useState, useContext, useRef } from "react";
import { UserContext } from "../../contexts/userContext";
import api from "../../services/api";
import { Navbar } from "../../components/Navbar";
import "./perfil.scss";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import formatDate from "../../utils/format-date";
import { IEstadoCidades } from "../../types/IEstadoCidade";
import { formatarCelular } from "../../utils/format-celular";

interface PerfilData {
  nm_usuario: string;
  cd_email_usuario?: string;
  ch_cpf_usuario?: string;
  ch_cnpj_usuario?: string;
  cd_foto_usuario?: string;
  nr_celular_usuario?: string;
  sg_estado_usuario?: string;
  nm_cidade_usuario?: string;
  dt_nascimento_usuario?: string;
}

const Perfil: React.FC = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [perfil, setPerfil] = useState<PerfilData | null>(null);
  const [editando, setEditando] = useState(false);
  const [form, setForm] = useState<PerfilData>({
    nm_usuario: "",
    cd_foto_usuario: "",
    nr_celular_usuario: "",
    sg_estado_usuario: "",
    nm_cidade_usuario: "",
  });
  const [fotoPreview, setFotoPreview] = useState<string>("");

  const [listaEstadosCidades, setListaEstadosCidades] = useState<
    IEstadoCidades[]
  >([]);
  const [listaCidades, setListaCidades] = useState<string[]>([]);

  const isRedirectingRef = useRef(false);

  useEffect(() => {
    if (isRedirectingRef.current) {
      return;
    }

    if (!user) {
      isRedirectingRef.current = true;
      toast.warning("Você precisa estar logado para acessar esta página.");
      navigate("/login");
      return;
    }

    async function fetchPerfil() {
      try {
        const res = await api.get(`/api/perfil`);
        if (res.data.nr_celular_usuario) {
          res.data.nr_celular_usuario = formatarCelular(
            res.data.nr_celular_usuario
          );
        }
        setPerfil(res.data);
        setForm(res.data);
        setFotoPreview(res.data.cd_foto_usuario || "");
      } catch (error: any) {
        if (error.response && error.response.status === 401) {
          if (!isRedirectingRef.current) {
            isRedirectingRef.current = true;
            toast.warning(
              "Sua sessão é inválida. Por favor, faça login novamente."
            );
            navigate("/login");
          }
        } else {
          console.error("Falha ao buscar dados do perfil:", error);
          toast.error("Não foi possível carregar seus dados.");
        }
      }
    }
    fetchPerfil();
  }, [user, navigate]);

  useEffect(() => {
    api
      .get<IEstadoCidades[]>("/api/estadosCidades")
      .then((response) => {
        setListaEstadosCidades(response.data);
      })
      .catch((err) => {
        console.error("Erro ao buscar estados e cidades:", err);
        toast.error("Não foi possível carregar a lista de estados.");
      });
  }, []);

  useEffect(() => {
    if (form.sg_estado_usuario && listaEstadosCidades.length > 0) {
      const estadoAtual = listaEstadosCidades.find(
        (e) => e.sg_estado === form.sg_estado_usuario
      );

      if (estadoAtual) {
        setListaCidades(estadoAtual.cidades);
      }
    }
  }, [form.sg_estado_usuario, listaEstadosCidades]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name === "nr_celular_usuario") {
      const valorFormatado = formatarCelular(value);
      setForm((prevForm) => ({ ...prevForm, [name]: valorFormatado }));
      return;
    }

    setForm((prevForm) => ({ ...prevForm, [name]: value }));

    // Se o usuário mudou o estado...
    if (name === "sg_estado_usuario") {
      if (!value) {
        // Se selecionou "Selecione o Estado"
        setListaCidades([]);
        setForm((prevForm) => ({ ...prevForm, nm_cidade_usuario: "" }));
        return;
      }
      const estado = listaEstadosCidades.find((e) => e.sg_estado === value);
      if (estado) {
        setListaCidades(estado.cidades);
        // Reseta a cidade no formulário
        setForm((prevForm) => ({ ...prevForm, nm_cidade_usuario: "" }));
      }
    }
  };

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFotoPreview(URL.createObjectURL(file));
      setForm({ ...form, cd_foto_usuario: file.name });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.nm_usuario.trim() === "") {
      toast.error("O campo 'Nome' não pode ficar vazio.");
      return; // Para a execução
    }

    // Limpa a máscara do celular para enviar só os dígitos
    const digitosCelular = form.nr_celular_usuario
      ? form.nr_celular_usuario.replace(/\D/g, "")
      : "";

    // Validação de celular (10 = fixo, 11 = celular)
    if (
      digitosCelular &&
      (digitosCelular.length < 10 || digitosCelular.length > 11)
    ) {
      toast.error("Por favor, preencha um número de celular válido com DDD.");
      return;
    }

    const userUpdatedInfos = {
      nm_usuario: form.nm_usuario.trim(),
      nr_celular_usuario: digitosCelular,
      sg_estado_usuario: form.sg_estado_usuario,
      nm_cidade_usuario: form.nm_cidade_usuario,
      cd_foto_usuario: form.cd_foto_usuario,
    };

    try {
      const res = await api.patch(`/api/usuario/${user!.id}`, userUpdatedInfos);

      const perfilAtualizado = {
        ...res.data,
        nr_celular_usuario: formatarCelular(res.data.nr_celular_usuario || ""),
      };

      setPerfil(perfilAtualizado);
      setForm(perfilAtualizado);
      setFotoPreview(perfilAtualizado.cd_foto_usuario || "");

      setEditando(false);

      toast.success("Perfil atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar o perfil:", error);
      toast.error("Não foi possível atualizar seus dados.");
    }
  };

  if (!perfil) return <div>Carregando...</div>;
  return (
    <div>
      <Navbar page="perfil" />
      <div className="perfil-container">
        <h2>Meus dados</h2>
        <div className="perfil-grid">
          <div className="perfil-foto">
            {fotoPreview && fotoPreview !== "default.png" ? (
              <img src={fotoPreview} alt="Foto de perfil" />
            ) : (
              <div
                style={{
                  width: "180px",
                  height: "180px",
                  borderRadius: "50%",
                  background: "#eee",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "3rem",
                  color: "#1976d2",
                  fontWeight: 700,
                }}
              >
                {form.nm_usuario
                  ? form.nm_usuario
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                  : "?"}
              </div>
            )}
            {editando && (
              <>
                <input
                  type="file"
                  name="cd_foto_usuario"
                  accept="image/*"
                  onChange={handleFotoChange}
                />
                <button
                  type="button"
                  style={{marginTop:8, background:'#e53935', color:'#fff', border:'none', borderRadius:8, padding:'6px 16px', fontWeight:600, cursor:'pointer'}}
                  onClick={() => {
                    setFotoPreview("");
                    setForm((prev) => ({ ...prev, cd_foto_usuario: "" }));
                  }}
                >Remover imagem</button>
              </>
            )}
          </div>
          <form onSubmit={handleSubmit} className="perfil-form">
            <label>
              Nome:
              <input
                type="text"
                name="nm_usuario"
                value={form.nm_usuario}
                onChange={handleChange}
                disabled={!editando}
              />
            </label>
            <label>
              {perfil.ch_cpf_usuario ? "CPF" : "CNPJ"}:
              <input
                type="text"
                value={perfil.ch_cpf_usuario || perfil.ch_cnpj_usuario}
                disabled
              />
            </label>
            <label>
              Email:
              <input
                type="email"
                name="cd_email_usuario"
                value={perfil.cd_email_usuario}
                onChange={handleChange}
                disabled
              />
            </label>
            <label>
              Celular:
              <input
                type="tel"
                name="nr_celular_usuario"
                value={form.nr_celular_usuario || ""}
                onChange={handleChange}
                maxLength={15}
                placeholder="(XX) XXXXX-XXXX"
                disabled={!editando}
              />
            </label>
            <label>
              Estado:
              <select
                name="sg_estado_usuario"
                value={form.sg_estado_usuario || ""}
                onChange={handleChange}
                disabled={!editando}
              >
                <option value="">Selecione o Estado</option>
                {listaEstadosCidades.map((estado) => (
                  <option key={estado.sg_estado} value={estado.sg_estado}>
                    {estado.sg_estado}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Cidade:
              <select
                name="nm_cidade_usuario"
                value={form.nm_cidade_usuario || ""}
                onChange={handleChange}
                disabled={!editando || !form.sg_estado_usuario}
              >
                <option value="">Selecione a Cidade</option>
                {listaCidades.map((cidade) => (
                  <option key={cidade} value={cidade}>
                    {cidade}
                  </option>
                ))}
              </select>
            </label>
            {!perfil.ch_cnpj_usuario && (
              <label>
                Data de Nascimento:
                <input
                  type="text"
                  name="dt_nascimento_usuario"
                  value={
                    perfil.dt_nascimento_usuario
                      ? formatDate(new Date(perfil.dt_nascimento_usuario))
                      : ""
                  }
                  onChange={handleChange}
                  disabled
                />
              </label>
            )}
          </form>
        </div>
        <div className="perfil-botao">
          {editando ? (
            <button type="submit" form="perfil-form" onClick={handleSubmit}>
              Salvar
            </button>
          ) : (
            <button type="button" onClick={() => setEditando(true)}>
              Editar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Perfil;
