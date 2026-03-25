import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { Navbar } from "../../components/Navbar";
import { Footer } from "../../components/Footer";
import "./painel.scss";

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
    };
    quantidade: number;
    // Adicionar id_doacao se backend retornar
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

  useEffect(() => {
    api.get("/api/perfil").then(res => setIsAdmin(res.data.fg_admin === 1));
    api.get(isAdmin ? "/api/campanhas" : "/api/campanhas/minhas")
      .then(res => setCampanhas(res.data));
    api.get("/api/doacoes/minhas")
      .then(res => setDoacoes(res.data));
  }, [isAdmin]);

  function handleOpenModal(camp: Campanha) {
    setModalCampanha(camp);
    setLoadingDoacoes(true);
    api.get(`/api/campanhas/${camp.id}/doacoes`)
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
      await api.patch(`/api/campanhas/desativar/${modalCampanha.id}`);
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
          {aba === "campanhas" ? (
            <div className="painel-cards">
              {campanhas.length === 0 ? <p>Nenhuma campanha encontrada.</p> : campanhas.map((camp: Campanha) => (
                <div className="painel-card" key={camp.id}>
                  <img src={`/assets/campanhas/${camp.cd_imagem_campanha}`} alt={camp.nm_titulo_campanha} />
                  <h3>{camp.nm_titulo_campanha}</h3>
                  <p>{camp.ds_acao_campanha}</p>
                  <p><strong>Alimentos:</strong> {camp.alimentos.map((a: { nm_alimento: string }) => a.nm_alimento).join(", ")}</p>
                  <button onClick={() => handleOpenModal(camp)}>Gerenciar campanha</button>
                </div>
              ))}
            </div>
          ) : (
            <div className="painel-cards">
            {doacoes.length === 0 ? <p>Nenhuma doação encontrada.</p> : doacoes.map((doa: Doacao, idx: number) => (
              <div className="painel-card" key={doa.campanha.id} style={{padding:'1.2rem 1.2rem', minWidth:200, maxWidth:340, boxShadow:'0 2px 12px rgba(25,118,210,0.13)', border:'2px solid #1976d2'}}>
                <h3 style={{fontSize:'1.7rem', color:'#1976d2', marginBottom:6, fontWeight:800, letterSpacing:1}}>{doa.campanha.nome}</h3>
                <p style={{fontSize:'1.22rem', color:'#333', marginBottom:4}}><strong>Cidade:</strong> {doa.campanha.cidade} - {doa.campanha.estado}</p>
                <div style={{marginTop:10, width:'100%'}}>
                  <span style={{fontWeight:700, color:'#1976d2', fontSize:'1.25rem'}}>Alimentos doados:</span>
                  <ul style={{paddingLeft:20, margin:'10px 0', fontSize:'1.18rem'}}>
                    {doa.alimentos_doados.map((a, i) => (
                      <li key={a.alimento.id} style={{marginBottom:4, fontWeight:600, color:'#1256a3', fontSize:'1.15rem'}}>
                        {a.alimento.nome} <span style={{color:'#333', fontWeight:500}}>- {a.quantidade}</span> {a.id_doacao && (<span style={{color:'#1976d2', fontWeight:400}}> (ID: {a.id_doacao})</span>)}
                      </li>
                    ))}
                  </ul>
                </div>
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
            <img src={`/assets/campanhas/${modalCampanha.cd_imagem_campanha}`} alt={modalCampanha.nm_titulo_campanha} style={{width:"100%", maxWidth:220, height:140, objectFit:"cover", borderRadius:12, marginBottom:12}} />
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