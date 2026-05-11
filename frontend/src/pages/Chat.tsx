import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.tsx';
import { createChat, getChat, getChats, sendChatMessage } from '../services/api';

type ChatSummary = {
  _id: string;
  otherUserName: string;
  otherUserPhotoURL?: string | null;
  listingId?: string;
  listingTitle?: string;
  lastMessage?: string;
  updatedAt: string;
};

type ChatMessage = {
  _id: string;
  fromUid: string;
  text: string;
  createdAt: string;
};

type ChatDetail = {
  _id: string;
  otherUserName: string;
  otherUserPhotoURL?: string | null;
  listingId?: string;
  listingTitle?: string;
  messages: ChatMessage[];
};

const Chat = () => {
  const { user } = useAuth();
  const location = useLocation();
  const preselectedListingId = (location.state as { listingId?: string })?.listingId;

  const [chats, setChats] = useState<ChatSummary[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [activeChat, setActiveChat] = useState<ChatDetail | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadChats() {
      try {
        const data = await getChats();
        setChats(data);
        if (preselectedListingId) {
          const match = data.find(chat => chat.listingId === preselectedListingId);
          if (match) {
            setActiveChatId(match._id);
            return;
          }
        }
        setActiveChatId(data.length > 0 ? data[0]._id : null);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadChats();
  }, [preselectedListingId]);

  useEffect(() => {
    async function loadActiveChat() {
      if (!activeChatId) {
        setActiveChat(null);
        return;
      }
      try {
        const data = await getChat(activeChatId);
        setActiveChat(data);
      } catch (err) {
        console.error(err);
      }
    }
    loadActiveChat();
  }, [activeChatId]);

  const active = activeChat;

  const otherUserName = useMemo(() => active?.otherUserName ?? '', [active]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim() || !activeChatId) return;
    try {
      await sendChatMessage(activeChatId, newMessage.trim());
      setNewMessage('');
      const updated = await getChat(activeChatId);
      setActiveChat(updated);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="chat-page">
      <div className="chat-sidebar">
        <h3>My Conversations</h3>
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton-row">
              <div className="skeleton skeleton-avatar" />
              <div style={{ flex: 1 }}>
                <div className="skeleton skeleton-text short" />
                <div className="skeleton skeleton-text long" style={{ marginBottom: 0 }} />
              </div>
            </div>
          ))
        ) : chats.length === 0 ? (
          <p className="chat-empty-sidebar">
            No conversations yet. Browse the marketplace and message a seller to get started.
          </p>
        ) : (
          chats.map(chat => (
            <div
              key={chat._id}
              className={`chat-thread ${activeChatId === chat._id ? 'active' : ''}`}
              onClick={() => setActiveChatId(chat._id)}
            >
              <div className="chat-thread-avatar">
                {chat.otherUserPhotoURL ? (
                  <img src={chat.otherUserPhotoURL} alt={chat.otherUserName} className="avatar-image" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <span>{chat.otherUserName?.[0] || '?'}</span>
                )}
              </div>
              <div className="chat-thread-content">
                <div className="chat-thread-name">{chat.otherUserName}</div>
                {chat.listingTitle && <div className="chat-thread-listing">Re: {chat.listingTitle}</div>}
                <div className="chat-thread-preview">{chat.lastMessage || 'No messages yet'}</div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="chat-main">
        {!active ? (
          <div className="chat-placeholder">
            <p>Select a conversation to start chatting</p>
          </div>
        ) : (
          <>
            <div className="chat-header">
              <div className="chat-header-info">
                <strong>{otherUserName}</strong>
                {active.listingTitle && (
                  <span className="chat-header-listing">Re: {active.listingTitle}</span>
                )}
              </div>
              {active.listingId && (
                <Link to={`/listing/${active.listingId}`} className="chat-view-listing">
                  View Product
                </Link>
              )}
            </div>
            <div className="chat-messages">
              {active.messages.length === 0 ? (
                <div className="chat-placeholder">
                  <p>No messages yet. Ask about the product!</p>
                </div>
              ) : (
                active.messages.map(msg => {
                  const isMe = msg.fromUid === user?.id;
                  return (
                    <div key={msg._id} className={`chat-msg ${isMe ? 'msg-me' : 'msg-them'}`}>
                      {!isMe && (
                        <div className="msg-avatar">
                          {active.otherUserPhotoURL ? (
                            <img src={active.otherUserPhotoURL} alt={active.otherUserName} className="avatar-image" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
                          ) : (
                            <span>{active.otherUserName?.[0] || '?'}</span>
                          )}
                        </div>
                      )}
                      <div className="msg-content">
                        <div className="msg-sender">{isMe ? 'You' : active.otherUserName}</div>
                        <div className="msg-bubble">{msg.text}</div>
                        <div className="msg-time">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <form className="chat-input-bar" onSubmit={handleSend}>
              <input
                type="text"
                className="chat-input"
                placeholder="Type a message..."
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
              />
              <button type="submit" className="chat-send-btn">Send</button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default Chat;
