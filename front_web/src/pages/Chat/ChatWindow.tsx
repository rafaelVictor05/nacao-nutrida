import React, { useState } from "react";

const ChatWindow = ({ messages, onSend, selected, onStartChat, otherUserName }: any) => {
  const [text, setText] = useState("");
  if (!selected) {
    return (
      <div className="chat-window chat-empty" style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 'calc(100vh - 8rem)',
        height: '100%',
        background: '#fff',
      }}>
        <div style={{flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: '100%'}}>
          <h2 style={{fontSize: '2rem', color: '#222', marginBottom: 16}}>Inicie uma conversa</h2>
          <button
            className="chat-start-btn"
            style={{
              padding: '16px 32px',
              fontSize: '1.3rem',
              borderRadius: 8,
              background: '#1976d2',
              color: '#fff',
              border: 'none',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(25, 118, 210, 0.08)',
              marginTop: 24
            }}
            onClick={onStartChat}
          >
            Iniciar chat
          </button>
        </div>
      </div>
    );
  }
  // Descobre o userId para diferenciar enviada/recebida
  const userId = localStorage.getItem("userId") || "";
  return (
    <div className="chat-window" style={{
      width: '100vw',
      maxWidth: '100vw',
      minHeight: 'calc(100vh - 8rem)',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: '#f3f6fa',
    }}>
      {/* Header do chat com nome do usuário */}
      {selected && otherUserName && (
        <div style={{
          width: '100%',
          height: 56,
          background: '#1976d2',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          paddingLeft: 24,
          fontSize: '1.7rem',
          fontWeight: 600,
          borderTopLeftRadius: 8,
          borderTopRightRadius: 8,
          letterSpacing: 0.5,
          boxShadow: '0 2px 8px rgba(25, 118, 210, 0.06)'
        }}>
          {otherUserName}
        </div>
      )}
      <div className="chat-messages" style={{
        flex: 1,
        overflowY: 'auto',
        padding: '32px 24px',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: messages.length === 0 ? 'center' : 'flex-start',
      }}>
        {messages.length === 0 && (
          <div style={{textAlign: 'center', color: '#888', fontSize: '1.5rem'}}>Nenhuma mensagem ainda</div>
        )}
        {messages.map((msg: any, i: number) => {
          const isSent = msg.senderId === userId;
          return (
            <div
              key={i}
              className={`chat-msg ${isSent ? "sent" : "received"}`}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: isSent ? 'flex-end' : 'flex-start',
                marginBottom: 16,
                width: '100%',
              }}
            >
              <span
                style={{
                  background: isSent ? '#b3d4fc' : '#e8eaf6',
                  color: '#222',
                  padding: '18px 32px',
                  borderRadius: 20,
                  minWidth: '40%',
                  maxWidth: '70%',
                  fontSize: '1.7rem',
                  fontWeight: 600,
                  boxShadow: isSent ? '0 2px 8px rgba(25, 118, 210, 0.06)' : '0 2px 8px rgba(160,160,160,0.06)',
                  marginLeft: isSent ? 'auto' : 0,
                  marginRight: isSent ? 0 : 'auto',
                  wordBreak: 'break-word',
                  alignSelf: isSent ? 'flex-end' : 'flex-start',
                  justifyContent: isSent ? 'flex-end' : 'flex-start',
                }}
              >
                {msg.text}
              </span>
              <small style={{fontSize: '1.1rem', color: '#888', marginTop: 4, alignSelf: isSent ? 'flex-end' : 'flex-start'}}>{msg.time}</small>
            </div>
          );
        })}
      </div>
      <form
        className="chat-form"
        style={{
          width: '100%',
          display: 'flex',
          padding: '16px',
          boxSizing: 'border-box',
          background: '#fafafa',
          borderTop: '1px solid #eee',
          position: 'sticky',
          bottom: 0,
          left: 0,
          zIndex: 2,
        }}
        onSubmit={e => {
          e.preventDefault();
          if (text.trim()) {
            onSend(text);
            setText("");
          }
        }}
      >
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Digite sua mensagem..."
          style={{flex: 1, fontSize: '1.5rem', padding: '12px 16px', borderRadius: 8, border: '1px solid #ccc', marginRight: 12}}
        />
        <button type="submit" style={{fontSize: '1.3rem', padding: '12px 24px', borderRadius: 8, background: '#1976d2', color: '#fff', border: 'none', fontWeight: 600}}>Enviar</button>
      </form>
    </div>
  );
};

export default ChatWindow;
