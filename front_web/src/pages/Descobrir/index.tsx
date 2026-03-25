import { useEffect, useState } from "react";
import { Footer } from "../../components/Footer";
import { Navbar } from "../../components/Navbar";

import { Link } from "react-router-dom";
import { ICampanhaAlimento } from "../../types/ICampanha";
import { IEstadoCidades } from "../../types/IEstadoCidade";
import api from "../../services/api";
import { toast } from "sonner";

export const Descobrir = () => {
  const [campanhas, setCampanhas] = useState<ICampanhaAlimento[]>([]);
  const [listaEstadosCidades, setListaEstadosCidades] = useState<
    IEstadoCidades[]
  >([]);
  const [listaCidades, setListaCidades] = useState<string[]>([]);
  const [estadoSelecionado, setEstadoSelecionado] = useState<string>("");
  const [cidadeSelecionada, setCidadeSelecionada] = useState<string>("");

  useEffect(() => {
    api
      .get<IEstadoCidades[]>("/api/estadosCidades")
      .then((response) => {
        setListaEstadosCidades(response.data);
      })
      .catch((err) => {
        console.log("Error: " + err);
      });
  }, []);

  useEffect(() => {
    if (listaEstadosCidades.length > 0) {
      const cidades = listaEstadosCidades[0]!.cidades;
      setListaCidades(cidades);
    }
  }, [listaEstadosCidades]);

  useEffect(() => {
    if (listaCidades.length > 0) {
      const cidade = listaCidades[0]!;
      setCidadeSelecionada(cidade);
    }
  }, [listaEstadosCidades]);

  const handleChangeEstadoSelecionado = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selectedEstado = event.target.value;
    setEstadoSelecionado(selectedEstado);

    if (!selectedEstado) {
      setListaCidades([]);
      setCidadeSelecionada("");
      return;
    }

    const estado = listaEstadosCidades.find(
      (estado) => estado.sg_estado === selectedEstado
    )!.cidades;
    if (estado) {
      setListaCidades(estado);
      setCidadeSelecionada("");
    }
  };

  const handleChangeCidadeSelecionada = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setCidadeSelecionada(event.target.value);
  };

  const fetchCampanhas = async (estado?: string, cidade?: string) => {
    try {
      const endpoint =
        estado && cidade
          ? `/api/campanhas/buscar?sg_estado_campanha=${estado}&nm_cidade_campanha=${cidade}`
          : "/api/campanhas";

      const response = await api.get(endpoint);
      setCampanhas(response.data);
    } catch (err) {
      console.log("Erro ao buscar campanhas: " + err);
      setCampanhas([]);
    }
  };

  useEffect(() => {
    fetchCampanhas();
  }, []);

  const handleBuscarCampanhas = (event: React.FormEvent) => {
    event.preventDefault();

    if (!estadoSelecionado || !cidadeSelecionada) {
      toast.error("Por favor, selecione um estado e uma cidade.");
      return;
    }
    fetchCampanhas(estadoSelecionado, cidadeSelecionada);
  };

  const handleLimparFiltros = () => {
    // Reseta os estados dos selects
    setEstadoSelecionado("");
    setCidadeSelecionada("");
    setListaCidades([]); // Limpa a lista de cidades para forçar nova seleção

    // Chama a busca sem filtros para mostrar tudo de novo
    fetchCampanhas();
  };

  useEffect(() => {
    fetchCampanhas();
  }, []);

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

  return (
    campanhas && (
      <>
        <Navbar />
        <main className="pg_descobrir">
          <div className="background">
            <form
              className="filtro-campanhas column"
              action="/descobrir/"
              method="GET"
              onSubmit={handleBuscarCampanhas}
            >
              <h1 className="titulo white">Insira o estado e a cidade</h1>
              <span className="sub titulo white" style={{display: 'block', marginTop: '0.5rem'}}>
                Encontre campanhas de combate à fome perto de você
              </span>
              <div className="row">
                <select
                  name="sg_estado_campanha"
                  className="input-form"
                  id="estadoCampanha"
                  value={estadoSelecionado}
                  onChange={handleChangeEstadoSelecionado}
                >
                  {/* Opção Padrão */}
                  <option value="">Selecione o Estado</option>

                  {listaEstadosCidades.map((estado) => (
                    <option key={estado.sg_estado} value={estado.sg_estado}>
                      {estado.sg_estado}
                    </option>
                  ))}
                </select>

                <select
                  name="nm_cidade_campanha"
                  className="input-form"
                  id="cidadeCampanha"
                  value={cidadeSelecionada}
                  onChange={handleChangeCidadeSelecionada}
                  disabled={!estadoSelecionado}
                >
                  {/* Opção Padrão */}
                  <option value="">Selecione a Cidade</option>

                  {listaCidades.map((cidade) => (
                    <option key={cidade} value={cidade}>
                      {cidade}
                    </option>
                  ))}
                </select>
                <button className="btn yellow" type="submit">
                  Procurar
                </button>

                <button
                  className="btn gray"
                  type="button"
                  onClick={handleLimparFiltros}
                >
                  Limpar
                </button>
              </div>
            </form>
          </div>

          <div className="campanhas-container column">
            {campanhas.length <= 0 && (
              <h1 className="titulo black">
                Nenhuma campanha encontrada para a localização selecionada
              </h1>
            )}
            {campanhas.length > 0 && (
              <h1 className="titulo black">Campanhas mais recentes</h1>
            )}
            <div className="campanhas row">
              {campanhas.map((campanha) => (
                <Link
                  key={campanha.id}
                  className="campanha-link"
                  to={`/campanhas/${campanha.id}`}
                >
                  <div className="campanha">
                    <div className="imagem-campanha">
                      <img
                        src={`/assets/campanhas/${campanha.cd_imagem_campanha}`}
                        alt=""
                      />
                    </div>

                    <div className="informacoes-campanha column">
                      <div className="descricao-campanha">
                        <h1 className="titulo ped">
                          {campanha.nm_titulo_campanha}
                        </h1>

                        <div className="titulo-wrapper row">
                          <h1 className="sub titulo row master">
                            Alimentos:
                          </h1>
                          <span className="sub titulo row titulo-link">
                            {campanha.alimentos.map((alimento, index) => (
                              <span key={index}>
                                {alimento.nm_alimento} -{" "}
                              </span>
                            ))}
                          </span>
                        </div>
                      </div>

                      <div className="progresso-container column">
                        <div className="porcentagem">
                          <div className="progresso-barra">
                            <div
                              style={{
                                width: contarProgresso(
                                  campanha.qt_doacoes_campanha,
                                  campanha.qt_total_campanha
                                ),
                              }}
                              className={`progresso-atual progresso-atual-${campanha.id}`}
                            ></div>
                          </div>
                        </div>
                        <div className="arrecadado">
                          <p>
                            <span className={`arrecadado-${campanha.id}`}>
                              {contarProgresso(
                                campanha.qt_doacoes_campanha,
                                campanha.qt_total_campanha
                              )}
                            </span>{" "}
                            arrecadado
                          </p>
                        </div>
                      </div>

                      <div className="rodape-campanha">
                        <div className="row">
                          <div className="usuario row">
                            <div className="img-wrapper">
                              <img
                                src={`/assets/profile/${campanha.cd_foto_usuario}`}
                                alt="Foto do usuário"
                              />
                            </div>
                            <div className="column">
                              <h2 className="nomeUsuario">
                                {campanha.nm_usuario}
                              </h2>
                              <p className="titulo-gray cidadeEstado">
                                {campanha.nm_cidade_campanha},{" "}
                                {campanha.sg_estado_campanha}
                              </p>
                            </div>
                          </div>

                          <div className="column">
                            <div>
                              <img
                                className="svg-campanha"
                                src="/assets/img/icone_relogio.svg"
                                alt="Icone relógio"
                              />
                              <p className="expiraEm">
                                Expira em: {campanha.dias_restantes} dias
                              </p>
                            </div>

                            <div>
                              <img
                                className="svg-campanha"
                                src="/assets/img/icone_pin.svg"
                                alt="Icone pin"
                              />
                              <p className="cidadeEstado">
                                {campanha.nm_cidade_campanha},{" "}
                                {campanha.sg_estado_campanha}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="numeracao-paginas">
            <ul className="paginas">
              <Link key="1" to={`/descobrir`}>
                <li className="num cont-pagina">1</li>
              </Link>
            </ul>
            <Link to="#">
              <div className="cont-pagina">Seguinte &#62;</div>
            </Link>
          </div>
        </main>

        <Footer></Footer>
      </>
    )
  );
};
