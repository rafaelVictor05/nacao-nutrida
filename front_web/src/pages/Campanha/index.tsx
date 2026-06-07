import { useContext, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { Footer } from "../../components/Footer";
import { Navbar } from "../../components/Navbar";

import { ICampanhaAlimento } from "../../types/ICampanha";
import { imagemCampanha } from "../../utils/campanha-imagem";
import { UserContext } from "../../contexts/userContext";
import api from "../../services/api";
import { toast } from "sonner";

export const Campanha = () => {
  const navigate = useNavigate();
  const [campanha, setCampanha] = useState<ICampanhaAlimento | null>(null);
  const user = useContext(UserContext);

  const [refreshData, setRefreshData] = useState(false);

  const { _id } = useParams();
  const url = `/campanhas/${_id}`;

  useEffect(() => {
    if (_id) {
      api
        .get<ICampanhaAlimento>(url)
        .then((response) => {
          let campanhaData = response.data;
          campanhaData.alimentos = Array.isArray(campanhaData.alimentos)
            ? campanhaData.alimentos
            : [campanhaData.alimentos];
          setCampanha(campanhaData);
        })
        .catch((err) => {
          console.log("Error: " + err);
        });
    }
  }, [_id, url, refreshData]);

  const [modalVisible, setModalVisible] = useState(false);
  const [recomendacoes, setRecomendacoes] = useState<string[]>([]);

  const handleCloseModal = () => {
    if (!user.user || !user.user.id || user.user.id === "") {
      toast.error("Por favor, efetue o login na sua conta para doar.");
      navigate("/login");
      return;
    }
    setModalVisible(!modalVisible);
  };

  const fetchRecomendacoesParaDoacao = async (alimentos: string[]) => {
    try {
      const res = await api.post("/mineracao/recomendacoes", {
        alimentos,
        campanhaId: _id,
      });
      const data = res.data.recomendacoes || res.data || [];
      setRecomendacoes(data.map((r: any) => r.alimentoSugerido ?? r));
    } catch (error: any) {
      console.error("Erro ao buscar recomendações:", error);
      toast.error("Não foi possível carregar recomendações no momento.");
      setRecomendacoes([]);
    }
  };

  const replaceSpace = (str: string) => {
    return str.replace(/\s+/g, "");
  };

  function contarProgresso(
    qt_doacoes_campanha: number,
    qt_total_campanha: number
  ) {
    let percentage =
      Math.floor((qt_doacoes_campanha * 100) / qt_total_campanha) || 0;

    if (percentage > 100) {
      return `100%`;
    } else {
      return `${percentage}%`;
    }
  }

  function contarTempoRestante(
    anos: number,
    meses: number,
    dias: number,
    horas: number,
    minutos: number
  ) {
    if (anos > 0) {
      return `Expira em: ${anos} anos`;
    } else if (meses > 0) {
      return `Expira em: ${meses} meses`;
    } else if (dias > 0) {
      return `Expira em: ${dias} dias`;
    } else if (horas > 0) {
      return `Expira em: ${horas} horas`;
    } else if (minutos > 0) {
      return `Expira em: ${minutos} minutos`;
    } else {
      return "Campanha encerrada";
    }
  }

  function handleSubmit(event: any) {
    event.preventDefault();
    if (!user.user.id || user.user.id === "") {
      toast.error("Por favor, efetue o login.");
      navigate("/login");
      return;
    }
    let infos_doacao = {
      usuario_doacao: user.user.id,
      cd_campanha_doacao: _id,
    };

    let lengthAlimentos = campanha?.alimentos?.length || 0;

    let alimentos_doacao = Array.isArray(campanha?.alimentos)
      ? Array.from({ length: lengthAlimentos }, (_, index) => {
          const alimento_id =
            event.target._id[index]?.value || event.target._id.value;
          const qt_alimento_doacao = parseInt(
            event.target.qt_alimento_doacao[index]?.value ||
              event.target.qt_alimento_doacao.value
          );

          if (qt_alimento_doacao > 0) {
            return { alimento_id, qt_alimento_doacao };
          }
          return null;
        }).filter((item) => item !== null)
      : [];

    if (
      !alimentos_doacao ||
      (Array.isArray(alimentos_doacao) && alimentos_doacao.length === 0)
    ) {
      toast.error("Por favor, doe ao menos um alimento.");
      return;
    }

    const dbInsert = async () => {
      try {
        const response = await api.post("/doacoes", {
          infos_doacao: infos_doacao,
          alimentos_doacao: alimentos_doacao,
        });
        return [response.status, response.data];
      } catch (error: any) {
        console.error("Erro na requisição:", error);

        if (error.response) {
          return [error.response.status, error.response.data];
        }

        // Se não for um erro de resposta (ex: rede), retorna um status genérico
        return [500, "Erro interno do cliente"];
      }
    };

    const handleDBInsert = async () => {
      try {
        const [responseStatus, responseData] = await dbInsert();
        if (responseStatus === 401) {
          toast.error("Você precisa estar logado para fazer uma doação.");
          navigate("/login");
        } else if (responseStatus !== 201) {
          toast.error("Erro ao fazer doação, tente novamente mais tarde");
        } else {
          console.log("Sucesso ao salvar dados no banco ", responseData);
          setModalVisible(false);
          const donatedFoodNames = alimentos_doacao
            .map((item: any) =>
              campanha?.alimentos?.find(
                (a: any) => a.alimento_id === item.alimento_id
              )?.nm_alimento
            )
            .filter(Boolean) as string[];

          if (donatedFoodNames.length > 0) {
            await fetchRecomendacoesParaDoacao(donatedFoodNames);
          }
          setRefreshData((prev) => !prev);
          event.target.reset();

          try {
            const campanhaAtualizada = await api.get<ICampanhaAlimento>(url);
            const alimentos = Array.isArray(campanhaAtualizada.data.alimentos)
              ? campanhaAtualizada.data.alimentos
              : [campanhaAtualizada.data.alimentos];
            const campanhaCompleta = alimentos.every(
              (a: any) => a.qt_alimento_doado >= a.qt_alimento_meta
            );
            if (campanhaCompleta) {
              await api.patch(`/campanhas/desativar/${_id}`);
              toast.success(
                "🎉 Sua doação completou a campanha! Muito obrigado por fazer a diferença!",
                { duration: 7000 }
              );
              navigate("/descobrir");
            } else {
              toast.success("Doação realizada com sucesso!");
            }
          } catch {
            toast.success("Doação realizada com sucesso!");
          }
        }
      } catch (error) {
        console.error("Erro ao inserir dados:", error);
      }
    };

    handleDBInsert();
  }

  return (
    campanha &&
    campanha &&
    campanha.alimentos && (
      <>
        <Navbar />

        <div
          className={`lyt_denuncia pg_contribuir campanha ${
            modalVisible ? "visible" : ""
          }`}
        >
          <div className="form-container campanha column">
            <div className="closeWrapper">
              <img
                className="closeModal"
                src="/assets/img/icone_times_black.svg"
                alt=""
                onClick={handleCloseModal}
              />
            </div>
            <p className="sub titulo">Informe a quantidade da doação:</p>
            <form
              className="form-login column"
              method="POST"
              onSubmit={handleSubmit}
            >
              <div className="alimento column">
                <div className="desc row">
                  <label>Alimento</label>
                  <label>Quantidade</label>
                </div>
                <div className="qtdAlimentos">
                  {campanha.alimentos.map((alimento, index) => (
                    <div key={index} className="row">
                      <div className="alimento-campanha">
                        <input
                          className="input-form nmAl"
                          type="text"
                          name={`nm_alimento`}
                          value={alimento.nm_alimento}
                          readOnly
                        />
                      </div>
                      <div className="alimento-quantidade">
                        <div className="qtdAl">
                          <input
                            className="input-form"
                            type="number"
                            name={`qt_alimento_doacao`}
                            min="0"
                          />
                          <input
                            type="hidden"
                            name={`_id`}
                            value={alimento.alimento_id}
                          />
                          <h1 className="sub titulo">
                            {alimento.sg_medida_alimento}
                          </h1>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {recomendacoes.length > 0 && (
                <div style={{margin: "0.8rem 0", padding: "0.9rem 1.2rem", background: "#e3f2fd", borderRadius: 10, border: "1.5px solid #1976d2"}}>
                  <p style={{color: "#1976d2", fontWeight: 700, fontSize: "1.1rem", marginBottom: 8}}>
                    Quem doou estes alimentos também doou:
                  </p>
                  <div style={{display: "flex", flexWrap: "wrap", gap: 8}}>
                    {recomendacoes.map((alimento, i) => (
                      <span key={i} style={{background: "#1976d2", color: "#fff", borderRadius: 16, padding: "3px 12px", fontWeight: 600, fontSize: "1rem"}}>
                        {alimento}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <div className="comentario column">
                <label>Adicione um comentário (opcional)</label>
                <textarea className="input-form" name="descricao"></textarea>
              </div>
              <input className="btn blue" type="submit" value="Enviar" />
            </form>
          </div>
        </div>

        <main className="pg_campanha">
          <div className="container-campanha column">
            <div key={campanha.nm_titulo_campanha}>
              <h1 className="titulo black">{campanha.nm_titulo_campanha}</h1>
              <div className="subcontainer-campanha row">
                <div className="container-descricao">
                  <div className="container-img">
                    <img
                      src={imagemCampanha(_id!, campanha.cd_imagem_campanha)}
                      alt=""
                    />
                  </div>
                  <div className="descricao">
                    <h1 className="sub titulo black">Descrição</h1>
                    <p>{campanha.ds_acao_campanha}</p>
                    <div className="denunciar">
                      <Link className="row" to={`#`}>
                        <img
                          src="/assets/img/icone_denounce_black.svg"
                          alt="Denunciar"
                        />
                        <span>Denunciar campanha</span>
                      </Link>
                    </div>
                  </div>
                </div>
                <div className="container-alimentos column">
                  <header className="header-alimentos row">
                    <div className="usuario row">
                      <div className="img-wrapper">
                        <img
                          src={`/assets/profile/${campanha.cd_foto_usuario}`}
                          alt="Foto do usuário"
                        />
                      </div>
                      <div>
                        <h2>{campanha.nm_usuario}</h2>
                        <p className="titulo-gray cidadeEstado">{`${campanha.nm_cidade_campanha}, ${campanha.sg_estado_campanha}`}</p>
                      </div>
                    </div>
                    <div className="header-campanha">
                      <div>
                        <img src="/assets/img/icone_pin.svg" alt="Icone pin" />
                        <p className="cidadeEstado">{`${campanha.nm_cidade_campanha}, ${campanha.sg_estado_campanha}`}</p>
                      </div>
                      <div>
                        <img
                          src="/assets/img/icone_relogio.svg"
                          alt="Icone relógio"
                        />
                        <p>
                          {contarTempoRestante(
                            campanha.anos_restantes,
                            campanha.meses_restantes,
                            campanha.dias_restantes,
                            campanha.horas_restantes,
                            campanha.minutos_restantes
                          )}
                        </p>
                      </div>
                    </div>
                  </header>
                  <div className="main-alimentos column">
                    <h2 className="titulo black">Alimentos:</h2>
                    <div className="alimento-container column">
                      {campanha.alimentos.map((alimento) => (
                        <div
                          key={alimento.nm_alimento}
                          className="alimento column"
                        >
                          <h2 className="sub titulo">{alimento.nm_alimento}</h2>
                          <div className="progresso-container row">
                            <div className="arrecadado">
                              <p>
                                <span
                                  className={`arrecadado-${replaceSpace(
                                    alimento.nm_alimento
                                  )}`}
                                >
                                  {contarProgresso(
                                    alimento.qt_alimento_doado,
                                    alimento.qt_alimento_meta
                                  )}
                                </span>
                              </p>
                            </div>
                            <div className="porcentagem">
                              <div className="progresso-barra">
                                <div
                                  style={{
                                    width: contarProgresso(
                                      alimento.qt_alimento_doado,
                                      alimento.qt_alimento_meta
                                    ),
                                  }}
                                  className={`progresso-atual progresso-atual-${replaceSpace(
                                    alimento.nm_alimento
                                  )}`}
                                ></div>
                              </div>
                            </div>
                          </div>
                          <div className="meta row">
                            <p>{`Arrecadado: ${alimento.qt_alimento_doado} ${alimento.sg_medida_alimento}`}</p>
                            <p>{`Meta: ${alimento.qt_alimento_meta} ${alimento.sg_medida_alimento}`}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button
                      className="btn blue-light2 openModal"
                      onClick={handleCloseModal}
                    >
                      Doar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        <Footer></Footer>
      </>
    )
  );
};
