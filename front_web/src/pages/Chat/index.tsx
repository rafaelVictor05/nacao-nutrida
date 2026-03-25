
import React, { useEffect, useState } from "react";
import ChatSidebar from "./ChatSidebar";
import ChatWindow from "./ChatWindow";
import api from "../../services/api";
import { Navbar } from "../../components/Navbar";
import "./chat.scss";

const ChatPage: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [otherUserName, setOtherUserName] = useState<string>("");

  // Supondo que userId e adminId estão disponíveis via contexto ou localStorage
  const userId = localStorage.getItem("userId") || "";
  const adminId = localStorage.getItem("adminId") || "admin";

  useEffect(() => {
    if (userId) {
      api.get(`/api/chat/conversations?userId=${userId}`).then(res => setConversations(res.data));
    }
  }, [userId]);

  useEffect(() => {
    if (selected) {
  api.get(`/api/chat/messages?conversationId=${selected.id}&userId=${userId}`).then(res => setMessages(res.data));
      // Buscar nome do outro usuário para exibir no topo
      if (userId && adminId && selected.users) {
        if (userId === adminId) {
          // admin logado, mostra nome do outro usuário
          const found = selected.users.find((id: string) => id !== adminId);
          if (found) {
            api.get(`/api/usuario/nome/${found}`).then(res => setOtherUserName(res.data.nome)).catch(() => setOtherUserName("Usuário"));
          }
        } else {
          // usuário comum, não mostra nada no topo
          setOtherUserName("");
        }
      }
    }
  }, [selected, userId, adminId]);

  const handleSend = async (text: string) => {
    if (!selected) return;
    const res = await api.post("/api/chat/messages", {
      conversationId: selected.id,
      senderId: userId,
      text,
    });
    setMessages([...messages, res.data]);
  };

  const handleStartChat = async () => {
    // Cria nova conversa persistente com admin
    if (!userId || !adminId) {
      window.alert("Usuário ou admin não definido. Faça login ou defina o adminId.");
      return;
    }
    const res = await api.post("/api/chat/conversations", {
      userId,
      adminId
    });
    setConversations([...conversations, res.data]);
    setSelected(res.data);
    setMessages([]);
  };

  return (
    <>
      <Navbar page="chat" />
      <div className="chat-page">
        <ChatSidebar
          conversations={conversations}
          selected={selected}
          onSelect={setSelected}
        />
        <ChatWindow
          messages={messages}
          onSend={handleSend}
          selected={selected}
          onStartChat={handleStartChat}
          otherUserName={otherUserName}
        />
      </div>
    </>
  );
};

  type Conversation = {
    id: string;
    users: string[];
    lastMessage?: string;
    updatedAt?: string;
  };
export default ChatPage;
