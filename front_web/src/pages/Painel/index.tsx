import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { Navbar } from "../../components/Navbar";
import { Footer } from "../../components/Footer";
import "./painel.scss";
import { imagemCampanha } from "../../utils/campanha-imagem";

interface Campanha {
  id: string;
  nm_titulo_campanha: string;
  ds_acao_campanha: string;
  cd_imagem_campanha: string;
  alimentos: { nm_alimento: string }[];
  dias_restantes?: number;
}

interface DoacaoCampanha {
  id_doacao: string;
  quantidade_doada: number;
  doador: {
    nome: string;
    foto: string;
    cidade: string;
    estado: string;
  };
  alimento: {
    nome: string;
  };
}


// Estrutura compatível com o backend: cada "doação" é um agrupamento por campanha, contendo alimentos_doados (cada um com id do alimento, nome e quantidade)
interface Doacao {
  campanha: {
    id: string;
    nome: string;
    cidade: string;
    estado: string;
  };
  alimentos_doados: {
    alimento: {
      id: string;
      nome: string;
      sg_medida?: string;
    };
    quantidade: number;
    id_doacao?: string;
  }[];
}

const Painel: React.FC = () => {
  const [aba, setAba] = useState<'campanhas' | 'doacoes'>("campanhas");
  const [campanhas, setCampanhas] = useState<Campanha[]>([]);
  const [doacoes, setDoacoes] = useState<Doacao[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [modalCampanha, setModalCampanha] = useState<Campanha | null>(null);
  const [doacoesCampanha, setDoacoesCampanha] = useState<DoacaoCampanha[]>([]);
  const [loadingDoacoes, setLoadingDoacoes] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [recomendacoes, setRecomendacoes] = useState<string[]>([]);

  useEffect(() => {
    api.get("/perfil").then(res => setIsAdmin(res.data.fg_admin === 1));
    api.get(isAdmin ? "/campanhas" : "/campanhas/minhas")
      .then(res => setCampanhas(res.data));
    api.get("/doacoes/minhas")
      .then(res => {
        const data: Doacao[] = res.data;
        setDoacoes(data);

        const alimentosDoados = data.flatMap(d =>
          d.alimentos_doados.map(a => a.alimento.nome)
        );
        const alimentosUnicos = [...new Set(alimentosDoados)];

        if (alimentosUnicos.length > 0) {
          api.post("/mineracao/recomendacoes", { alimentos: alimentosUnicos })
            .then(recRes => {
              const data = recRes.data.recomendacoes || recRes.data || [];
              const sugeridos: string[] = data.map((r: any) => r.alimentoSugerido ?? r);
              const unicos = [...new Set(sugeridos)].filter(
                s => !alimentosUnicos.includes(s)
              );
              setRecomendacoes(unicos);
            })
            .catch(() => setRecomendacoes([]));
        }
      });
  }, [isAdmin]);

  function handleOpenModal(camp: Campanha) {
    setModalCampanha(camp);
    setLoadingDoacoes(true);
    api.get(`/campanhas/${camp.id}/doacoes`)
      .then(res => setDoacoesCampanha(res.data))
      .catch(() => setDoacoesCampanha([]))
      .finally(() => setLoadingDoacoes(false));
  }

  function handleCloseModal() {
    setModalCampanha(null);
    setDoacoesCampanha([]);
  }

  const handleExcluirCampanha = async () => {
    if (!modalCampanha) return;
    setExcluindo(true);
    try {
      await api.patch(`/campanhas/desativar/${modalCampanha.id}`);
      setCampanhas(campanhas.filter((c: Campanha) => c.id !== modalCampanha.id));
      handleCloseModal();
    } catch (err) {
      alert("Erro ao excluir campanha");
    }
    setExcluindo(false);
  };

  return (
    <>
      <Navbar page="painel" />
      <main className="painel-main">
        <div className="painel-container">
          <h1>Painel</h1>
          <div className="painel-abas">
            <button className={aba === "campanhas" ? "active" : ""} onClick={() => setAba("campanhas")}>Minhas campanhas</button>
            <button className={aba === "doacoes" ? "active" : ""} onClick={() => setAba("doacoes")}>Minhas doações</button>
          </div>
          {aba === "doacoes" && recomendacoes.length > 0 && (
            <div className="painel-recomendacoes">
              <div className="painel-recomendacoes-header">
                <h3>Recomendado para você</h3>
              </div>
              <p>Com base nas suas doações anteriores, considere também doar:</p>
              <div className="painel-recomendacoes-tags">
                {recomendacoes.map((alimento, i) => (
                  <span key={i} className="painel-recomendacoes-tag">{alimento}</span>
                ))}
              </div>
              <a href="/descobrir" className="painel-recomendacoes-link">Encontrar campanhas →</a>
            </div>
          )}
          {aba === "campanhas" ? (
            <div className="painel-cards">
              {campanhas.length === 0 ? <p>Nenhuma campanha encontrada.</p> : campanhas.map((camp: Campanha) => (
                <div className="painel-card" key={camp.id}>
                  <img src={imagemCampanha(camp.id, camp.cd_imagem_campanha)} alt={camp.nm_titulo_campanha} />
                  <div className="painel-card-body">
                    <h3>{camp.nm_titulo_campanha}</h3>
                    <p>{camp.ds_acao_campanha}</p>
                    <div className="painel-card-tags">
                      {camp.alimentos.map((a) => (
                        <span key={a.nm_alimento} className="painel-card-tag">{a.nm_alimento}</span>
                      ))}
                    </div>
                  </div>
                  <div className="painel-card-footer">
                    <button onClick={() => handleOpenModal(camp)}>Gerenciar campanha</button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="painel-cards">
              {doacoes.length === 0 ? <p>Nenhuma doação encontrada.</p> : doacoes.map((doa: Doacao) => (
                <div className="painel-card-doacao" key={doa.campanha.id}>
                  <h3>{doa.campanha.nome}</h3>
                  <p className="painel-doacao-local">
                    <img src="/assets/img/icone_pin.svg" alt="Localização" />
                    {doa.campanha.cidade}, {doa.campanha.estado}
                  </p>
                  <span className="painel-doacao-label">Alimentos doados:</span>
                  <ul>
                    {doa.alimentos_doados.map((a) => (
                      <li key={a.alimento.id}>
                        {a.alimento.nome}
                        <span>{a.quantidade}{a.alimento.sg_medida ? ` ${a.alimento.sg_medida}` : " un."}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      {/* Modal de detalhes da campanha */}
      {modalCampanha && (
        <div style={{position: "fixed", top:0, left:0, width:"100vw", height:"100vh", background:"rgba(0,0,0,0.4)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000}}>
          <div style={{background:"#fff", borderRadius:16, padding:32, minWidth:340, maxWidth:480, width:"100%", boxShadow:"0 4px 32px rgba(0,0,0,0.18)", position:"relative"}}>
            <button style={{position:"absolute", top:12, right:16, fontSize:22, background:"none", border:"none", cursor:"pointer"}} onClick={handleCloseModal}>&times;</button>
            <h2>{modalCampanha.nm_titulo_campanha}</h2>
            <img src={imagemCampanha(modalCampanha.id, modalCampanha.cd_imagem_campanha)} alt={modalCampanha.nm_titulo_campanha} style={{width:"100%", maxWidth:220, height:140, objectFit:"cover", borderRadius:12, marginBottom:12}} />
            <p><strong>Descrição:</strong> {modalCampanha.ds_acao_campanha}</p>
            <p><strong>Dias restantes:</strong> {modalCampanha.dias_restantes ?? "-"}</p>
            <p><strong>Alimentos:</strong> {modalCampanha.alimentos.map((a: { nm_alimento: string }) => a.nm_alimento).join(", ")}</p>
            <hr style={{margin:"16px 0"}}/>
            <h3>Doações nesta campanha</h3>
            {loadingDoacoes ? <p>Carregando doações...</p> : (
              doacoesCampanha.length === 0 ? <p>Nenhuma doação registrada.</p> : (
                <ul style={{maxHeight:120, overflowY:"auto", paddingLeft:16}}>
                  {doacoesCampanha.map((d: DoacaoCampanha) => (
                    <li key={d.id_doacao} style={{marginBottom:8}}>
                      <span style={{fontWeight:600}}>{d.doador.nome}</span> - {d.alimento.nome} ({d.quantidade_doada})
                    </li>
                  ))}
                </ul>
              )
            )}
            <button onClick={handleExcluirCampanha} disabled={excluindo} style={{marginTop:18, background:'#e53935', color:'#fff', border:'none', borderRadius:8, padding:'10px 24px', fontWeight:700, cursor:'pointer'}}>
              {excluindo ? 'Excluindo...' : 'Excluir campanha'}
            </button>
          </div>
        </div>
      )}
      <Footer />
    </>
  );
};

export default Painel;