import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useStore } from '../context/StoreContext';

const PROMPT_SUGGESTIONS = [
  '🎧 Noise cancelling headphones under ₹30,000',
  '👗 Best summer dresses and fashion deals',
  '💻 High performance laptops for gaming',
  '📱 Flagship 5G smartphones with great camera',
];

const AiAssistantWidget = ({ isOpen, onToggle }) => {
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: 'Hello! I am your AI Shopping Assistant powered by Groq & Llama 3.3. How can I help you find the perfect product today?',
      products: [],
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const { addToCart } = useStore();
  const navigate = useNavigate();
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen, loading]);

  const handleSend = async (textToSend) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    if (!textToSend) setInput('');
    setMessages((prev) => [...prev, { sender: 'user', text: query }]);
    setLoading(true);

    try {
      const res = await api.post('/discovery/chat', { message: query });
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: res.answer,
          products: res.products || [],
          mode: res.mode,
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: 'Sorry, I ran into an error connecting to the AI discovery service. Please try again!',
          products: [],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1060,
          background: 'linear-gradient(135deg, #131921 0%, #2874F0 100%)',
          color: '#fff',
          border: '2px solid #FF9F00',
          borderRadius: '999px',
          padding: '12px 22px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontWeight: 700,
          fontSize: '0.92rem',
          transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-3px) scale(1.04)';
          e.currentTarget.style.boxShadow = '0 12px 30px rgba(40,116,240,0.4)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0) scale(1)';
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.3)';
        }}
      >
        <span
          style={{
            background: 'var(--grad-accent)',
            borderRadius: '50%',
            width: 28,
            height: 28,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#111',
          }}
        >
          <i className="fa-solid fa-sparkles" style={{ fontSize: '0.85rem' }}></i>
        </span>
        <span>Ask AI Assistant</span>
        <span
          style={{
            background: '#FF9F00',
            color: '#111',
            fontSize: '0.62rem',
            fontWeight: 800,
            padding: '2px 7px',
            borderRadius: 999,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          Groq
        </span>
      </button>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 1060,
        width: 'min(420px, calc(100vw - 32px))',
        height: 'min(580px, calc(100vh - 100px))',
        background: '#ffffff',
        borderRadius: 18,
        boxShadow: '0 20px 50px rgba(0,0,0,0.25)',
        border: '1.5px solid rgba(40,116,240,0.3)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        animation: 'slideDown 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {/* ── Header ── */}
      <div
        style={{
          background: 'linear-gradient(135deg, #131921 0%, #232f3e 60%, #2874F0 100%)',
          color: '#fff',
          padding: '14px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '2px solid #FF9F00',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #FF9F00, #FF6B35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#111',
            }}
          >
            <i className="fa-solid fa-robot" style={{ fontSize: '1rem' }}></i>
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: 6 }}>
              Smart AI Assistant
              <span
                style={{
                  background: 'rgba(255,159,0,0.25)',
                  color: '#FF9F00',
                  border: '1px solid rgba(255,159,0,0.4)',
                  borderRadius: 4,
                  fontSize: '0.62rem',
                  padding: '1px 6px',
                  fontWeight: 700,
                }}
              >
                Llama 3.3
              </span>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.65)' }}>
              Online • Powered by Groq AI
            </div>
          </div>
        </div>
        <button
          onClick={onToggle}
          style={{
            background: 'rgba(255,255,255,0.12)',
            border: 'none',
            color: '#fff',
            width: 32,
            height: 32,
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.9rem',
            transition: 'background 0.2s ease',
          }}
        >
          <i className="fa-solid fa-xmark"></i>
        </button>
      </div>

      {/* ── Chat Messages ── */}
      <div
        style={{
          flex: 1,
          padding: '16px',
          overflowY: 'auto',
          background: '#F9FAFB',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        {messages.map((m, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: m.sender === 'user' ? 'flex-end' : 'flex-start',
            }}
          >
            {/* Bubble */}
            <div
              style={{
                maxWidth: '88%',
                padding: '10px 14px',
                borderRadius: m.sender === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                background: m.sender === 'user' ? 'linear-gradient(135deg, #2874F0, #1a5dc7)' : '#ffffff',
                color: m.sender === 'user' ? '#ffffff' : '#0F1111',
                fontSize: '0.86rem',
                lineHeight: 1.5,
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                border: m.sender === 'user' ? 'none' : '1px solid #E2E8F0',
                whiteSpace: 'pre-line',
              }}
            >
              {m.text}
            </div>

            {/* Recommended Products Carousel inside Chat */}
            {m.products && m.products.length > 0 && (
              <div
                style={{
                  marginTop: 10,
                  width: '100%',
                  display: 'flex',
                  gap: 8,
                  overflowX: 'auto',
                  paddingBottom: 6,
                  scrollbarWidth: 'none',
                }}
              >
                {m.products.map((p) => {
                  const discountPrice = p.price_after_discount || Math.round(p.price - (p.price * p.discount) / 100);
                  const imgUrl = p.image
                    ? p.image.startsWith('http')
                      ? p.image
                      : `/Images/${p.image}`
                    : '/Images/product.png';

                  return (
                    <div
                      key={p.pid}
                      style={{
                        minWidth: 150,
                        maxWidth: 150,
                        background: '#ffffff',
                        border: '1px solid #E2E8F0',
                        borderRadius: 10,
                        padding: 8,
                        boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
                        display: 'flex',
                        flexDirection: 'column',
                        flexShrink: 0,
                      }}
                    >
                      <img
                        src={imgUrl}
                        alt={p.name}
                        style={{ height: 80, objectFit: 'contain', width: '100%', cursor: 'pointer', marginBottom: 4 }}
                        onClick={() => navigate(`/product/${p.pid}`)}
                        onError={(e) => { e.target.src = '/Images/product.png'; }}
                      />
                      <div
                        style={{
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          color: '#0F1111',
                          lineHeight: 1.2,
                          height: 28,
                          overflow: 'hidden',
                          cursor: 'pointer',
                          marginBottom: 4,
                        }}
                        onClick={() => navigate(`/product/${p.pid}`)}
                        title={p.name}
                      >
                        {p.name}
                      </div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#2874F0', marginBottom: 6 }}>
                        ₹{discountPrice.toLocaleString()}
                      </div>
                      <button
                        onClick={() => addToCart(p)}
                        style={{
                          background: 'linear-gradient(to bottom, #f7dfa5, #f0c14b)',
                          border: '1px solid #a88734',
                          borderRadius: 4,
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          padding: '4px 0',
                          cursor: 'pointer',
                          color: '#111',
                          width: '100%',
                        }}
                      >
                        + Add to Cart
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}

        {/* Loading Indicator */}
        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#64748B', fontSize: '0.8rem' }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: '#eef2ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#2874F0',
              }}
            >
              <i className="fa-solid fa-robot fa-spin"></i>
            </div>
            <span>AI is searching catalog &amp; generating recommendation...</span>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* ── Prompt Suggestions (if few messages) ── */}
      {messages.length <= 2 && !loading && (
        <div
          style={{
            padding: '8px 12px',
            background: '#ffffff',
            borderTop: '1px solid #F0F0F0',
            display: 'flex',
            gap: 6,
            overflowX: 'auto',
            scrollbarWidth: 'none',
          }}
        >
          {PROMPT_SUGGESTIONS.map((sug, i) => (
            <button
              key={i}
              onClick={() => handleSend(sug)}
              style={{
                background: '#F1F5F9',
                border: '1px solid #E2E8F0',
                borderRadius: 999,
                fontSize: '0.72rem',
                fontWeight: 600,
                color: '#334155',
                padding: '4px 10px',
                whiteSpace: 'nowrap',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#2874F0';
                e.currentTarget.style.color = '#fff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#F1F5F9';
                e.currentTarget.style.color = '#334155';
              }}
            >
              {sug}
            </button>
          ))}
        </div>
      )}

      {/* ── Input Box ── */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        style={{
          padding: '10px 12px',
          background: '#ffffff',
          borderTop: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <input
          type="text"
          placeholder="Ask AI anything about products, deals..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
          style={{
            flex: 1,
            border: '1px solid #CBD5E1',
            borderRadius: 8,
            padding: '9px 12px',
            fontSize: '0.86rem',
            outline: 'none',
          }}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          style={{
            background: loading || !input.trim() ? '#CBD5E1' : '#FF9F00',
            color: '#111',
            border: 'none',
            borderRadius: 8,
            width: 38,
            height: 38,
            cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.95rem',
            fontWeight: 800,
            transition: 'all 0.2s ease',
          }}
        >
          <i className="fa-solid fa-paper-plane"></i>
        </button>
      </form>
    </div>
  );
};

export default AiAssistantWidget;
