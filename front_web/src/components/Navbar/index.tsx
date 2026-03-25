import React, { useContext, useState } from "react";
// 1. Importe o useNavigate para fazer o redirecionamento
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../../contexts/userContext";
import { AuthContext } from "../../contexts/authContext";

interface HeaderProps {
  page?: string;
}

export const Navbar: React.FC<HeaderProps> = ({ page }) => {
  const [toggledMenu, setToggledMenu] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  // 2. Destruture os valores e setters dos contextos para facilitar o uso
  const { user, setUser } = useContext(UserContext);
  const { authenticated, setAuthenticated } = useContext(AuthContext);

  // 3. Inicialize o hook de navegação
  const navigate = useNavigate();

  const handleToggleMenu = () => {
    setToggledMenu(!toggledMenu);
  };

  // 4. Atualize a função de logout com a lógica completa
  const handleLogout = () => {
    // Limpa o armazenamento local
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");

    // Reseta o estado global da aplicação
    setAuthenticated(false);
    setUser(null as any);

    // Redireciona para a página de login
    navigate("/login");
  };

  return (
    <header>
      <nav className="nav-bar">
        <Link to="/" className="nav-logo">
          <img
            src="/assets/img/logos/logo-nacao-nutrida-white.svg"
            className="logo"
            alt="Logo Nação Nutrida"
          />
        </Link>
        <div className={`nav-menu ${toggledMenu ? "toggled" : ""}`}>
          {authenticated ? ( // 5. Simplificado para usar a variável booleana diretamente
            <>
              <ul className="row nav-list">
                <>
                  <Link to="/descobrir" className="nav-link">
                    <li>Descobrir</li>
                  </Link>
                  <Link to="/campanhas/criar" className="nav-link">
                    <li>Criar</li>
                  </Link>
                  <li className="nav-link" style={{cursor: 'pointer'}} onClick={() => setShowAbout(true)}>
                    Sobre nós
                  </li>
      {showAbout && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.7)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }} onClick={() => setShowAbout(false)}>
            <div style={{
              background: '#fff',
              borderRadius: 24,
              padding: '4rem 3rem',
              width: '90vw',
              maxWidth: 900,
              minHeight: '60vh',
              boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
              textAlign: 'center',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }} onClick={e => e.stopPropagation()}>
              <h2 style={{fontSize: '3rem', color: '#1976d2', marginBottom: 24, fontWeight: 700}}>Sobre nós</h2>
              <p style={{fontSize: '1.7rem', color: '#222', marginBottom: 32, lineHeight: 1.7, maxWidth: 700}}>
                O projeto <strong>Nação Nutrida</strong> nasceu para conectar pessoas, ONGs e empresas em prol do combate à fome e à insegurança alimentar no Brasil. Nosso objetivo é facilitar doações, promover campanhas solidárias e criar uma rede de apoio que transforma vidas.<br /><br />
                Aqui, você pode criar campanhas, doar alimentos, acompanhar o progresso das ações e conversar diretamente com quem está fazendo a diferença. Junte-se a nós e faça parte dessa corrente do bem!
              </p>
              <button style={{
                background: '#1976d2',
                color: '#fff',
                border: 'none',
                borderRadius: 10,
                padding: '16px 48px',
                fontSize: '1.5rem',
                fontWeight: 700,
                cursor: 'pointer',
                marginTop: 12,
                boxShadow: '0 4px 16px rgba(25, 118, 210, 0.10)',
                letterSpacing: '0.5px',
              }} onClick={() => setShowAbout(false)}>
                Fechar
              </button>
            </div>
          </div>
      )}
                </>
              </ul>
              <div className="row nav-profile" onClick={handleToggleMenu}>
                <div className="img-wrapper">
                  <img
                    // Adicionado uma verificação para o caso do usuário ser nulo temporariamente
                    key={`${user?.cd_foto_usuario}`}
                    src={`/assets/profile/${user?.cd_foto_usuario}`}
                    className="img-profile"
                    alt="Foto de perfil"
                  />
                </div>
                <img
                  className="seta"
                  src="/assets/img/arrow-down.svg"
                  alt="Icone de seta"
                />
              </div>
              <div className="toggle-menu header">
                <ul>
                  <>
                    <li className="toggle-link">
                      <Link to="/painel" className="sub titulo">
                        Painel
                      </Link>
                    </li>
                    <li className="toggle-link">
                      <Link to="/chat" className="sub titulo">
                        Chat
                      </Link>
                    </li>
                    <li className="toggle-link">
                      <Link to="/perfil" className="sub titulo">
                        Meus dados
                      </Link>
                    </li>
                  </>
                  <li className="toggle-link logout">
                    {/* 6. Removido o 'to' do Link e usando apenas o onClick.
                           O redirecionamento agora é feito pela função handleLogout. */}
                    <div
                      onClick={handleLogout}
                      className="sub titulo logout-button"
                    >
                      Logout
                      <img src="/assets/img/icone_logout.svg" alt="Logout" />
                    </div>
                  </li>
                </ul>
              </div>
            </>
          ) : page === "Login" ? (
            <>
              <p className="nav-link">
                Não tem conta?
                <Link to="/cadastro" className="nav-link titulo-link">
                  Cadastrar-se
                </Link>
              </p>
            </>
          ) : (
            <>
              <p className="nav-link">
                Já tem conta?
                <Link to="/login" className="nav-link titulo-link">
                  Faça o login
                </Link>
              </p>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};
