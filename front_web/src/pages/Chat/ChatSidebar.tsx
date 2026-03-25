import React, { useEffect, useState } from "react";

import api from "../../services/api";

const ChatSidebar = ({ conversations, selected, onSelect }: any) => {
  const [userNames, setUserNames] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const userId = String(localStorage.getItem("userId") || "");
    if (!userId || conversations.length === 0) return;
    const fetchNames = async () => {
      // Para cada conversa, pega o outro participante (que não é o userId logado)
      const ids = conversations.map((conv: any) => conv.users.find((id: string) => String(id) !== userId));
      const uniqueIds = Array.from(new Set(ids.filter(Boolean)));
      const names: { [key: string]: string } = {};
      await Promise.all(uniqueIds.map(async (id) => {
        const idStr = String(id);
        try {
          const res = await api.get(`/api/usuario/nome/${idStr}`);
          names[idStr] = res.data.nome;
        } catch {
          names[idStr] = idStr;
        }
      }));
      setUserNames(names);
    };
    fetchNames();
  }, [conversations]);

  // Função para excluir conversa
  const handleDelete = async (convId: string) => {
    const userId = localStorage.getItem("userId");
    if (!window.confirm("Tem certeza que deseja excluir este chat?")) return;
    try {
      await api.delete(`/api/chat/conversations/${convId}?userId=${userId}`);
      // Remove da lista local
      if (typeof onSelect === 'function' && selected?.id === convId) onSelect(null);
      // Atualiza lista (ideal: refetch, mas aqui filtra local)
      if (typeof window !== 'undefined') window.location.reload();
    } catch (e) {
      alert("Erro ao excluir chat");
    }
  };

  return (
    <aside className="chat-sidebar">
      <input className="chat-search" placeholder="Procurar mensagens" />
      <ul>
        {conversations.map((conv: any) => {
          const userId = String(localStorage.getItem("userId") || "");
          const adminId = String(localStorage.getItem("adminId") || "");
          let otherUserId = conv.users.find((id: string) => String(id) !== userId);
          // Se admin está logado, mostra sempre o usuário (que não é adminId), mesmo que haja duplicidade
          if (userId === adminId) {
            // Busca o primeiro id diferente do adminId
            otherUserId = conv.users.find((id: string) => String(id) !== adminId);
            // Se não encontrar, mostra vazio
            if (!otherUserId) otherUserId = "";
          }
          let displayName = userNames[otherUserId] || (otherUserId && otherUserId !== adminId ? otherUserId : "Usuário");
          // Se o nome do admin aparecer, substitui por 'Nação Nutrida'
          if (
            (userNames[otherUserId] && userNames[otherUserId].toLowerCase() === 'admin') ||
            (otherUserId === adminId && (!userNames[otherUserId] || userNames[otherUserId].toLowerCase() === 'admin'))
          ) {
            displayName = 'Nação Nutrida';
          }
          return (
            <li
              key={conv.id}
              className={selected?.id === conv.id ? "active" : ""}
              style={{position: 'relative', cursor: 'pointer'}}
              onClick={() => onSelect(conv)}
              onMouseDown={e => e.button === 2 && e.preventDefault()} // previne menu do botão direito
            >
              <img src={"/assets/profile/default.png"} alt="Chat" className="avatar" />
              <div style={{display: 'flex', flexDirection: 'column'}}>
                <strong>{displayName}</strong>
                <span style={{marginTop: 2, color: '#555', fontSize: '1.2rem', fontWeight: 500}}>{conv.lastMessage || ""}</span>
              </div>
              <span className="chat-time">{conv.updatedAt ? new Date(conv.updatedAt).toLocaleTimeString() : ""}</span>
              <button
                title="Excluir chat"
                style={{
                  position: 'absolute',
                  right: 8,
                  top: 8,
                  width: 36,
                  height: 36,
                  background: 'rgba(255,255,255,0.95)',
                  border: '2px solid #d32f2f',
                  borderRadius: '50%',
                  color: '#d32f2f',
                  fontSize: 26,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'none',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 0.2s',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                }}
                className="delete-chat-btn"
                onClick={e => { e.stopPropagation(); handleDelete(conv.id); }}
                onMouseDown={e => e.stopPropagation()}
              >
                &#128465;
              </button>
            </li>
          );
        })}
      </ul>
      <style>{`
        .chat-sidebar li:hover .delete-chat-btn {
          display: block !important;
        }
      `}</style>
    </aside>
  );
};

export default ChatSidebar;
