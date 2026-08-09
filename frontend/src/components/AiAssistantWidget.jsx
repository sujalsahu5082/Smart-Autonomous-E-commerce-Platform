import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useStore } from '../context/StoreContext';

const PROMPT_SUGGESTIONS = [
  '🎧 Noise cancelling headphones under ₹30,000',
  '👗 Best summer dresses and fashion deals',
  '💻 High performance laptops for gaming',
  '📱 Flagship 5G smartphones with great camera',
  '🏷️ Show me active coupons & discounts',
  '⚡ What are today\'s best sellers?',
];

const QUICK_ACTIONS = [
  { label: '🔥 Hot Deals', query: 'Show me products with highest discounts' },
  { label: '🎧 Audio & Earbuds', query: 'Recommend wireless earbuds and audio devices' },
  { label: '👗 Fashion Trends', query: 'Show stylish clothing and fashion items' },
  { label: '🚚 Shipping & Returns', query: 'What is your shipping, delivery time and return policy?' },
];

const INITIAL_MESSAGE = {
  sender: 'ai',
  text: 'Hello! I am your AI Shopping Assistant powered by Groq & Llama 3.3. How can I help you find the perfect product today?',
  products: [],
};

const AiAssistantWidget = ({ isOpen, onToggle }) => {
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);

  // Dragging state
  const [pos, setPos] = useState({ x: null, y: null });
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  const { addToCart } = useStore();
  const navigate = useNavigate();
  const chatEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Auto-scroll
  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, loading]);

  // Handle Dragging
  const handleMouseDown = (e) => {
    // Only drag when clicking header background or title
    if (e.target.closest('button') || e.target.closest('input')) return;
    isDraggingRef.current = true;
    const widget = e.currentTarget.parentElement;
    const rect = widget.getBoundingClientRect();
    dragStartRef.current = {
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e) => {
    if (!isDraggingRef.current) return;
    const newX = Math.max(10, Math.min(window.innerWidth - 380, e.clientX - dragStartRef.current.offsetX));
    const newY = Math.max(10, Math.min(window.innerHeight - 300, e.clientY - dragStartRef.current.offsetY));
    setPos({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  // Voice Input (Speech Recognition)
  const toggleSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in your browser. Try Chrome or Edge!');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
    };

    recognition.start();
  };

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

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const copyToClipboard = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const clearChat = () => {
    setMessages([INITIAL_MESSAGE]);
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
            background: '#FF9F00',
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

  // Calculate dynamic position (custom pos if dragged, or default fixed bottom-right)
  const widgetStyle = pos.x !== null && pos.y !== null
    ? { left: `${pos.x}px`, top: `${pos.y}px` }
    : { right: '24px', bottom: '24px' };

  return (
    <div
      style={{
        position: 'fixed',
        ...widgetStyle,
        zIndex: 1060,
        width: 'min(440px, calc(100vw - 32px))',
        height: isExpanded ? 'min(720px, calc(100vh - 40px))' : 'min(580px, calc(100vh - 100px))',
        background: '#ffffff',
        borderRadius: 18,
        boxShadow: '0 20px 50px rgba(0,0,0,0.28)',
        border: '1.5px solid rgba(40,116,240,0.35)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        transition: 'height 0.25s ease',
      }}
    >
      {/* ── Movable / Draggable Header ── */}
      <div
        onMouseDown={handleMouseDown}
        style={{
          background: 'linear-gradient(135deg, #131921 0%, #232f3e 60%, #2874F0 100%)',
          color: '#fff',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '2px solid #FF9F00',
          cursor: 'grab',
          userSelect: 'none',
        }}
        title="Click and drag to move chat window"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #FF9F00, #FF6B35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#111',
            }}
          >
            <i className="fa-solid fa-robot" style={{ fontSize: '0.95rem' }}></i>
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: 6 }}>
              Smart AI Assistant
              <span
                style={{
                  background: 'rgba(255,159,0,0.25)',
                  color: '#FF9F00',
                  border: '1px solid rgba(255,159,0,0.4)',
                  borderRadius: 4,
                  fontSize: '0.6rem',
                  padding: '1px 5px',
                  fontWeight: 700,
                }}
              >
                Llama 3.3
              </span>
            </div>
            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.65)' }}>
              <i className="fa-solid fa-grip-dots-vertical me-1" style={{ color: '#FF9F00' }}></i>
              Drag to move • Powered by Groq
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {/* Clear Chat */}
          <button
            onClick={clearChat}
            title="Clear Chat History"
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              color: 'rgba(255,255,255,0.85)',
              width: 30,
              height: 30,
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.8rem',
            }}
          >
            <i className="fa-solid fa-trash-can"></i>
          </button>

          {/* Expand / Minimize height */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? 'Collapse Height' : 'Expand Height'}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              color: 'rgba(255,255,255,0.85)',
              width: 30,
              height: 30,
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.8rem',
            }}
          >
            <i className={`fa-solid ${isExpanded ? 'fa-compress' : 'fa-expand'}`}></i>
          </button>

          {/* Reset position if moved */}
          {pos.x !== null && (
            <button
              onClick={() => setPos({ x: null, y: null })}
              title="Reset Window Position"
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                color: 'rgba(255,255,255,0.85)',
                width: 30,
                height: 30,
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.8rem',
              }}
            >
              <i className="fa-solid fa-arrow-rotate-left"></i>
            </button>
          )}

          {/* Close Widget */}
          <button
            onClick={onToggle}
            title="Close Assistant"
            style={{
              background: 'rgba(255,255,255,0.15)',
              border: 'none',
              color: '#fff',
              width: 30,
              height: 30,
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.85rem',
            }}
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
      </div>

      {/* ── Quick Action Pills Bar ── */}
      <div
        style={{
          background: '#F8FAFC',
          padding: '8px 12px',
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          gap: 6,
          overflowX: 'auto',
          scrollbarWidth: 'none',
        }}
      >
        {QUICK_ACTIONS.map((qa, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(qa.query)}
            disabled={loading}
            style={{
              background: '#ffffff',
              border: '1px solid #CBD5E1',
              borderRadius: 999,
              fontSize: '0.72rem',
              fontWeight: 700,
              color: '#1E293B',
              padding: '4px 11px',
              whiteSpace: 'nowrap',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#2874F0';
              e.currentTarget.style.color = '#2874F0';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#CBD5E1';
              e.currentTarget.style.color = '#1E293B';
            }}
          >
            {qa.label}
          </button>
        ))}
      </div>

      {/* ── Chat Messages Thread ── */}
      <div
        style={{
          flex: 1,
          padding: '14px',
          overflowY: 'auto',
          background: '#F1F5F9',
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
              position: 'relative',
            }}
          >
            {/* Message Bubble Container */}
            <div style={{ position: 'relative', maxWidth: '88%' }}>
              <div
                style={{
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

              {/* Copy Button for AI responses */}
              {m.sender === 'ai' && (
                <button
                  onClick={() => copyToClipboard(m.text, idx)}
                  title="Copy AI response"
                  style={{
                    position: 'absolute',
                    top: 6,
                    right: 6,
                    background: 'rgba(241,245,249,0.8)',
                    border: 'none',
                    borderRadius: 4,
                    fontSize: '0.65rem',
                    color: copiedIdx === idx ? '#16a34a' : '#64748b',
                    padding: '2px 6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 3,
                  }}
                >
                  <i className={`fa-solid ${copiedIdx === idx ? 'fa-check' : 'fa-copy'}`}></i>
                  {copiedIdx === idx ? 'Copied' : ''}
                </button>
              )}
            </div>

            {/* Recommended Products Carousel */}
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
                        minWidth: 155,
                        maxWidth: 155,
                        background: '#ffffff',
                        border: '1px solid #E2E8F0',
                        borderRadius: 10,
                        padding: 8,
                        boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                        display: 'flex',
                        flexDirection: 'column',
                        flexShrink: 0,
                      }}
                    >
                      <img
                        src={imgUrl}
                        alt={p.name}
                        style={{ height: 85, objectFit: 'contain', width: '100%', cursor: 'pointer', marginBottom: 4 }}
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
                      <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#2874F0', marginBottom: 6 }}>
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

      {/* ── Prompt Suggestions (when few messages) ── */}
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

      {/* ── Text Input Toolbar & Multiline Input ── */}
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
          flexDirection: 'column',
          gap: 6,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
          {/* Multiline auto-expanding textarea */}
          <textarea
            ref={textareaRef}
            rows={1}
            maxLength={500}
            placeholder={isListening ? 'Listening... Speak now...' : 'Ask AI about products, prices, deals (Enter to send)...'}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            style={{
              flex: 1,
              border: isListening ? '1.5px solid #ef4444' : '1px solid #CBD5E1',
              borderRadius: 10,
              padding: '8px 12px',
              fontSize: '0.86rem',
              outline: 'none',
              resize: 'none',
              minHeight: 38,
              maxHeight: 90,
              lineHeight: 1.4,
              fontFamily: 'inherit',
              transition: 'border-color 0.2s',
            }}
          />

          {/* Voice Input Microphone Button */}
          <button
            type="button"
            onClick={toggleSpeechRecognition}
            title={isListening ? 'Stop Listening' : 'Voice Input (Speak your prompt)'}
            style={{
              background: isListening ? '#ef4444' : '#F1F5F9',
              color: isListening ? '#ffffff' : '#475569',
              border: isListening ? 'none' : '1px solid #CBD5E1',
              borderRadius: 10,
              width: 38,
              height: 38,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.9rem',
              transition: 'all 0.2s ease',
              flexShrink: 0,
            }}
          >
            <i className={`fa-solid ${isListening ? 'fa-microphone-slash fa-pulse' : 'fa-microphone'}`}></i>
          </button>

          {/* Send Button */}
          <button
            type="submit"
            disabled={loading || !input.trim()}
            title="Send Message (Enter)"
            style={{
              background: loading || !input.trim() ? '#CBD5E1' : '#FF9F00',
              color: '#111',
              border: 'none',
              borderRadius: 10,
              width: 38,
              height: 38,
              cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.95rem',
              fontWeight: 800,
              transition: 'all 0.2s ease',
              flexShrink: 0,
            }}
          >
            <i className="fa-solid fa-paper-plane"></i>
          </button>
        </div>

        {/* Input Footer: Character Counter & Shortcut Tip */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#94A3B8', padding: '0 4px' }}>
          <span>Tip: Press <strong>Enter</strong> to send, <strong>Shift+Enter</strong> for new line</span>
          <span>{input.length}/500</span>
        </div>
      </form>
    </div>
  );
};

export default AiAssistantWidget;
