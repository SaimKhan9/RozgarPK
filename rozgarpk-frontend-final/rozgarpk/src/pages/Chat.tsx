import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { chatAPI } from '../api/services';
import { getSocket, joinRoom, setTyping } from '../services/socket';
import type { ChatRoom, Message } from '../types';
import { useAuth } from '../context/AuthContext';

interface Props { showToast: (msg: string) => void; }

const formatRoomTimestamp = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
};

export default function Chat({ showToast }: Props) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [rooms, setRooms]                   = useState<ChatRoom[]>([]);
  const [activeRoomId, setActiveRoomId]     = useState<string | null>(null);
  const [input, setInput]                   = useState('');
  const [isTyping, setIsTyping]             = useState(false);
  const [isLoading, setIsLoading]           = useState(true);
  const [isSending, setIsSending]           = useState(false);
  const [isContactOptionsOpen, setIsContactOptionsOpen] = useState(false);
  const [isDeleteChatModalOpen, setIsDeleteChatModalOpen] = useState(false);
  const [roomToDelete, setRoomToDelete]     = useState<ChatRoom | null>(null);
  const [isDeletingChat, setIsDeletingChat] = useState(false);
  const [isUnsending, setIsUnsending]       = useState(false);
  const [search, setSearch]                 = useState('');

  // Hold / Long-press context menu states (WhatsApp style)
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [selectedRoom, setSelectedRoom]       = useState<ChatRoom | null>(null);

  const msgsRef = useRef<HTMLDivElement>(null);
  const typingTimer = useRef<number | null>(null);
  const holdTimerRef = useRef<number | null>(null);
  const isHoldTriggered = useRef<boolean>(false);

  const activeRoom = rooms.find(room => room.id === activeRoomId) || null;

  useEffect(() => {
    let mounted = true;
    chatAPI.getRooms().then(res => {
      if (!mounted) return;
      const loadedRooms: ChatRoom[] = res.data?.data || [];
      const requestedRoom = location.state?.roomId as string | undefined;
      setRooms(loadedRooms);
      setActiveRoomId(loadedRooms.find(room => room.id === requestedRoom)?.id || loadedRooms[0]?.id || null);
    }).catch(() => {
      if (mounted) showToast('Could not load conversations. Please try again.');
    }).finally(() => {
      if (mounted) setIsLoading(false);
    });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    const requestedRoom = location.state?.roomId as string | undefined;
    if (requestedRoom && rooms.some(room => room.id === requestedRoom)) setActiveRoomId(requestedRoom);
  }, [location.state, rooms]);

  useEffect(() => {
    if (!activeRoomId) return;
    let mounted = true;
    chatAPI.getMessages(activeRoomId).then(res => {
      if (!mounted) return;
      const messages = res.data?.data || [];
      setRooms(prev => prev.map(room => room.id === activeRoomId ? { ...room, messages, unread: 0 } : room));
    }).catch(() => showToast('Could not load messages for this conversation.'));
    return () => { mounted = false; };
  }, [activeRoomId]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket || !activeRoomId) return;

    joinRoom(activeRoomId);

    const handleMessage = (msg: Message) => {
      setRooms(prev => prev.map(room => room.id === msg.roomId ? {
        ...room,
        messages: room.messages.some(message => message.id === msg.id) ? room.messages : [...room.messages, msg],
        lastMessage: msg.text,
        lastMessageAt: msg.sentAt,
      } : room));
    };

    const handleMessageDeleted = ({ messageId, roomId }: { messageId: string; roomId: string }) => {
      setRooms(prev => prev.map(room => {
        if (room.id !== roomId) return room;
        const filtered = room.messages.filter(m => m.id !== messageId);
        const last = filtered[filtered.length - 1];
        return {
          ...room,
          messages: filtered,
          lastMessage: last ? last.text : '',
          lastMessageAt: last ? last.sentAt : room.lastMessageAt,
        };
      }));
    };

    const handleChatDeleted = ({ roomId }: { roomId: string }) => {
      setRooms(prev => prev.filter(r => r.id !== roomId));
      setActiveRoomId(prev => (prev === roomId ? null : prev));
      showToast('This conversation was deleted.');
    };

    const handleTyping = ({ isTyping: typing }: { userId: string; isTyping: boolean }) => {
      setIsTyping(typing);
    };

    socket.on('receive_message', handleMessage);
    socket.on('message_deleted', handleMessageDeleted);
    socket.on('chat_deleted', handleChatDeleted);
    socket.on('user_typing', handleTyping);

    return () => {
      socket.off('receive_message', handleMessage);
      socket.off('message_deleted', handleMessageDeleted);
      socket.off('chat_deleted', handleChatDeleted);
      socket.off('user_typing', handleTyping);
    };
  }, [activeRoomId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (msgsRef.current) msgsRef.current.scrollTop = msgsRef.current.scrollHeight;
  }, [activeRoom?.messages]);

  const handleInputChange = (val: string) => {
    setInput(val);
    const socket = getSocket();
    if (socket && activeRoomId) {
      setTyping(activeRoomId, true);
      if (typingTimer.current) clearTimeout(typingTimer.current);
      typingTimer.current = window.setTimeout(() => setTyping(activeRoomId, false), 1500);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !activeRoomId || isSending) return;
    const text = input.trim();
    setIsSending(true);
    setInput('');
    try {
      const res = await chatAPI.sendMessage(activeRoomId, text);
      const message: Message = res.data.data;
      if (message.senderId !== user?.id) {
        showToast('Your account changed in another tab. Reloading to sync your session.');
        window.location.reload();
        return;
      }
      setRooms(prev => prev.map(room => room.id === activeRoomId ? {
        ...room,
        messages: room.messages.some(existing => existing.id === message.id) ? room.messages : [...room.messages, message],
        lastMessage: message.text,
        lastMessageAt: message.sentAt,
      } : room));
    } catch {
      setInput(text);
      showToast('Message could not be sent. Check your connection and try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleUnsendMessage = async (messageId: string) => {
    if (isUnsending) return;
    setIsUnsending(true);
    try {
      await chatAPI.unsendMessage(messageId);
      const socket = getSocket();
      if (socket) {
        socket.emit('unsend_message', { messageId });
      }
      setRooms(prev => prev.map(room => {
        if (room.id !== activeRoomId) return room;
        const filtered = room.messages.filter(m => m.id !== messageId);
        const last = filtered[filtered.length - 1];
        return {
          ...room,
          messages: filtered,
          lastMessage: last ? last.text : '',
          lastMessageAt: last ? last.sentAt : room.lastMessageAt,
        };
      }));
      setSelectedMessage(null);
      showToast('Message unsent successfully.');
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Could not unsend message.');
    } finally {
      setIsUnsending(false);
    }
  };

  const confirmDeleteRoom = (room: ChatRoom) => {
    setRoomToDelete(room);
    setIsDeleteChatModalOpen(true);
    setSelectedRoom(null);
  };

  const handleDeleteChat = async () => {
    const targetRoomId = roomToDelete?.id || activeRoomId;
    if (!targetRoomId || isDeletingChat) return;
    setIsDeletingChat(true);
    try {
      await chatAPI.deleteRoom(targetRoomId);
      const socket = getSocket();
      if (socket) {
        socket.emit('delete_room', { roomId: targetRoomId });
      }
      setRooms(prev => prev.filter(r => r.id !== targetRoomId));
      if (activeRoomId === targetRoomId) {
        setActiveRoomId(null);
      }
      setIsDeleteChatModalOpen(false);
      setRoomToDelete(null);
      showToast('Conversation deleted successfully.');
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Could not delete conversation.');
    } finally {
      setIsDeletingChat(false);
    }
  };

  // ─── HOLD / LONG PRESS HANDLERS ─────────────────────────────────
  const startHoldMessage = (msg: Message) => {
    isHoldTriggered.current = false;
    holdTimerRef.current = window.setTimeout(() => {
      isHoldTriggered.current = true;
      setSelectedMessage(msg);
    }, 450);
  };

  const cancelHoldMessage = () => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  };

  const startHoldRoom = (room: ChatRoom) => {
    isHoldTriggered.current = false;
    holdTimerRef.current = window.setTimeout(() => {
      isHoldTriggered.current = true;
      setSelectedRoom(room);
    }, 450);
  };

  const cancelHoldRoom = () => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  };

  const copyMessageText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast('Message text copied to clipboard.');
      setSelectedMessage(null);
    } catch {
      showToast('Could not copy message text.');
    }
  };

  const filteredRooms = rooms.filter(room =>
    `${room.workerName} ${room.jobTitle} ${room.lastMessage}`.toLowerCase().includes(search.toLowerCase())
  );

  const phoneNumber = activeRoom?.otherUserPhone || '';
  const telephoneLink = phoneNumber.replace(/[^\d+]/g, '');
  const whatsappNumber = phoneNumber.replace(/\D/g, '').replace(/^0/, '92');

  const copyPhoneNumber = async () => {
    if (!phoneNumber) return;
    try {
      await navigator.clipboard.writeText(phoneNumber);
      showToast('Phone number copied.');
    } catch {
      showToast('Copy is unavailable here. Select the number to copy it.');
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(240px, 320px) minmax(0, 1fr)', height: 'calc(100vh - var(--nav-height))' }}>
      {/* Sidebar */}
      <div style={{ background: 'white', borderRight: '1.5px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: 18, borderBottom: '1.5px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)', margin: 0 }}>Messages</h3>
            <span style={{ fontSize: 11, color: 'var(--ink-soft)' }}>Hold chat for options</span>
          </div>
          <input type="search" className="form-input" value={search} onChange={event => setSearch(event.target.value)} placeholder="Search conversations..." style={{ fontSize: 13 }} />
        </div>
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {isLoading ? (
            <div style={{ padding: 20, color: 'var(--ink-soft)' }}>Loading conversations...</div>
          ) : filteredRooms.length === 0 ? (
            <div style={{ padding: 20, color: 'var(--ink-soft)' }}>No conversations yet. Start one from a worker or job listing.</div>
          ) : filteredRooms.map(room => (
            <div
              key={room.id}
              onClick={() => {
                if (isHoldTriggered.current) return;
                setActiveRoomId(room.id);
              }}
              onContextMenu={e => {
                e.preventDefault();
                setSelectedRoom(room);
              }}
              onTouchStart={() => startHoldRoom(room)}
              onTouchEnd={cancelHoldRoom}
              onTouchMove={cancelHoldRoom}
              onMouseDown={() => startHoldRoom(room)}
              onMouseUp={cancelHoldRoom}
              onMouseLeave={cancelHoldRoom}
              style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
                cursor: 'pointer', borderBottom: '1px solid var(--surface)',
                background: activeRoomId === room.id ? 'var(--green-pale)' : 'white',
                transition: 'background 0.12s', userSelect: 'none', position: 'relative'
              }}
              title="Click to open or Hold/Right-click for options"
            >
              <div style={{
                width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                background: 'linear-gradient(135deg, var(--green), var(--green-light))',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
                color: 'white', fontWeight: 700, overflow: 'hidden'
              }}>
                {room.workerAvatar && (room.workerAvatar.startsWith('http') || room.workerAvatar.startsWith('data:')) ? (
                  <img src={room.workerAvatar} alt={room.workerName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  room.workerAvatar || room.workerName.charAt(0).toUpperCase()
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)', marginBottom: 3 }}>{room.workerName}</div>
                <div style={{ fontSize: 12, color: 'var(--ink-soft)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {room.lastMessage || 'No messages yet'}
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                <div style={{ fontSize: 11, color: 'var(--ink-soft)' }}>{formatRoomTimestamp(room.lastMessageAt)}</div>
                {room.unread > 0 && <span style={{ background: 'var(--green)', color: 'white', fontSize: 11, fontWeight: 700, borderRadius: 10, padding: '2px 7px' }}>{room.unread}</span>}
                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation();
                    setSelectedRoom(room);
                  }}
                  style={{
                    background: 'none', border: 'none', color: '#9ca3af',
                    cursor: 'pointer', fontSize: 14, padding: '0 2px'
                  }}
                  title="Chat options"
                >
                  ⋮
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat main */}
      <div style={{ display: 'flex', flexDirection: 'column', background: 'var(--surface)' }}>
        {activeRoom ? (
          <>
            {/* Active Header */}
            <div style={{ padding: '14px 20px', background: 'white', borderBottom: '1.5px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: 'linear-gradient(135deg, var(--green), var(--green-light))',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
                color: 'white', fontWeight: 700, overflow: 'hidden'
              }}>
                {activeRoom.workerAvatar && (activeRoom.workerAvatar.startsWith('http') || activeRoom.workerAvatar.startsWith('data:')) ? (
                  <img src={activeRoom.workerAvatar} alt={activeRoom.workerName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  activeRoom.workerAvatar || activeRoom.workerName.charAt(0).toUpperCase()
                )}
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)' }}>{activeRoom.workerName}</div>
                <div style={{ fontSize: 12, color: isTyping ? 'var(--amber)' : 'var(--ink-soft)', fontWeight: 500 }}>
                  {isTyping ? 'Typing...' : activeRoom.jobTitle}
                </div>
              </div>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
                <button
                  type="button"
                  title={activeRoom.otherUserPhone ? `Call or contact ${activeRoom.workerName}` : 'Phone number unavailable'}
                  onClick={() => setIsContactOptionsOpen(true)}
                  disabled={!activeRoom.otherUserPhone}
                  style={{
                    width: 36, height: 36, borderRadius: 8, border: '1.5px solid var(--border)',
                    background: 'white', cursor: activeRoom.otherUserPhone ? 'pointer' : 'not-allowed',
                    opacity: activeRoom.otherUserPhone ? 1 : 0.5, fontSize: 16
                  }}
                >
                  📞
                </button>
                {activeRoom.otherUserRole === 'worker' && (
                  <button
                    type="button"
                    title="Open worker profile"
                    onClick={() => navigate(`/worker/${activeRoom.otherUserId}`)}
                    style={{
                      width: 36, height: 36, borderRadius: 8, border: '1.5px solid var(--border)',
                      background: 'white', cursor: 'pointer', fontSize: 16
                    }}
                  >
                    👤
                  </button>
                )}
                {/* Delete entire chat */}
                <button
                  type="button"
                  title="Delete conversation"
                  onClick={() => confirmDeleteRoom(activeRoom)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '6px 12px', borderRadius: 8,
                    border: '1.5px solid #fecaca', background: '#fef2f2',
                    color: '#dc2626', cursor: 'pointer', fontSize: 13, fontWeight: 600,
                    transition: 'all 0.15s'
                  }}
                >
                  <span>🗑️</span>
                  <span>Delete Chat</span>
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div ref={msgsRef} style={{ flex: 1, padding: 20, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {(activeRoom.messages || []).length === 0 ? (
                <div style={{ textAlign: 'center', margin: 'auto', color: 'var(--ink-soft)', fontSize: 14 }}>
                  No messages yet. Send a message to start the conversation!
                </div>
              ) : (
                (activeRoom.messages || []).map(msg => {
                  const isMine = msg.senderId === user?.id;
                  const isSelected = selectedMessage?.id === msg.id;

                  return (
                    <div
                      key={msg.id}
                      style={{ maxWidth: '70%', alignSelf: isMine ? 'flex-end' : 'flex-start', position: 'relative' }}
                    >
                      {/* Message Bubble — Touch & Mouse Hold Enabled */}
                      <div
                        onContextMenu={e => {
                          e.preventDefault();
                          setSelectedMessage(msg);
                        }}
                        onTouchStart={() => startHoldMessage(msg)}
                        onTouchEnd={cancelHoldMessage}
                        onTouchMove={cancelHoldMessage}
                        onMouseDown={() => startHoldMessage(msg)}
                        onMouseUp={cancelHoldMessage}
                        onMouseLeave={cancelHoldMessage}
                        style={{
                          padding: '10px 14px', borderRadius: 16, fontSize: 14, lineHeight: 1.45,
                          cursor: 'pointer', userSelect: 'none', transition: 'transform 0.1s, box-shadow 0.15s',
                          boxShadow: isSelected ? '0 0 0 3px #f87171' : 'none',
                          ...(isMine
                            ? { background: 'var(--green)', color: 'white', borderBottomRightRadius: 4 }
                            : { background: 'white', border: '1.5px solid var(--border)', color: 'var(--ink)', borderBottomLeftRadius: 4 })
                        }}
                        title="Hold or Right-click for options (Unsend, Copy)"
                      >
                        {msg.text}
                      </div>

                      {/* Timestamp & Options trigger */}
                      <div style={{
                        fontSize: 11, color: 'var(--ink-soft)', marginTop: 4,
                        display: 'flex', alignItems: 'center', gap: 8,
                        justifyContent: isMine ? 'flex-end' : 'flex-start'
                      }}>
                        <span>{new Date(msg.sentAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</span>
                        <button
                          type="button"
                          onClick={() => setSelectedMessage(msg)}
                          style={{
                            background: 'none', border: 'none', padding: '0 2px',
                            color: '#9ca3af', cursor: 'pointer', fontSize: 12
                          }}
                          title="Message options"
                        >
                          ⋮
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Message Input */}
            <div style={{ padding: '14px 20px', background: 'white', borderTop: '1.5px solid var(--border)', display: 'flex', gap: 10, alignItems: 'center' }}>
              <input
                type="text"
                value={input}
                onChange={e => handleInputChange(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                placeholder="Type a message... (Hold sent message to unsend)"
                style={{
                  flex: 1, padding: '10px 16px', border: '1.5px solid var(--border)',
                  borderRadius: 24, fontSize: 14, outline: 'none', fontFamily: 'inherit',
                  background: 'var(--surface)'
                }}
              />
              <button
                className="btn btn-primary"
                disabled={isSending || !input.trim()}
                style={{
                  borderRadius: '50%', width: 42, height: 42, padding: 0,
                  justifyContent: 'center', opacity: isSending || !input.trim() ? 0.6 : 1
                }}
                onClick={sendMessage}
              >
                {isSending ? '…' : '➤'}
              </button>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: 'grid', placeItems: 'center', padding: 24, color: 'var(--ink-soft)', textAlign: 'center' }}>
            {isLoading ? 'Loading conversations...' : 'Select a conversation to read and send messages.'}
          </div>
        )}

        {/* ─── WHATSAPP-STYLE MESSAGE OPTIONS MODAL ────────────────────────── */}
        {selectedMessage && (
          <div
            onClick={() => setSelectedMessage(null)}
            style={{
              position: 'fixed', inset: 0, zIndex: 250,
              background: 'rgba(15, 23, 18, 0.45)', backdropFilter: 'blur(2px)',
              display: 'grid', placeItems: 'center', padding: 20
            }}
          >
            <div
              role="dialog"
              onClick={e => e.stopPropagation()}
              style={{
                width: 'min(100%, 340px)', background: 'white', borderRadius: 16,
                padding: 20, boxShadow: '0 20px 50px rgba(0,0,0,0.25)', animation: 'scaleIn 0.15s ease'
              }}
            >
              {/* Message snippet preview */}
              <div style={{
                padding: '10px 14px', borderRadius: 12, background: 'var(--surface)',
                border: '1px solid var(--border)', fontSize: 13, color: 'var(--ink)',
                maxHeight: 90, overflowY: 'auto', marginBottom: 16, fontStyle: 'italic'
              }}>
                "{selectedMessage.text}"
              </div>

              <div style={{ display: 'grid', gap: 8 }}>
                {/* Copy action */}
                <button
                  type="button"
                  onClick={() => copyMessageText(selectedMessage.text)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 14px', borderRadius: 10, border: '1.5px solid var(--border)',
                    background: 'white', color: 'var(--ink)', cursor: 'pointer',
                    fontSize: 14, fontWeight: 600, width: '100%', textAlign: 'left'
                  }}
                >
                  <span style={{ fontSize: 18 }}>📋</span>
                  <span>Copy Message Text</span>
                </button>

                {/* Unsend action (only if sent by current user) */}
                {selectedMessage.senderId === user?.id ? (
                  <button
                    type="button"
                    onClick={() => handleUnsendMessage(selectedMessage.id)}
                    disabled={isUnsending}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '12px 14px', borderRadius: 10, border: '1.5px solid #fecaca',
                      background: '#fef2f2', color: '#dc2626', cursor: 'pointer',
                      fontSize: 14, fontWeight: 700, width: '100%', textAlign: 'left'
                    }}
                  >
                    <span style={{ fontSize: 18 }}>↩️</span>
                    <span>{isUnsending ? 'Unsending...' : 'Unsend Message (Delete)'}</span>
                  </button>
                ) : (
                  <div style={{ fontSize: 12, color: 'var(--ink-soft)', padding: '4px 6px' }}>
                    You can only unsend messages sent by yourself.
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setSelectedMessage(null)}
                  style={{
                    padding: '10px 14px', borderRadius: 10, border: 'none',
                    background: 'var(--surface)', color: 'var(--ink-soft)', cursor: 'pointer',
                    fontSize: 13, fontWeight: 600, width: '100%', marginTop: 4
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─── WHATSAPP-STYLE ROOM OPTIONS MODAL (ON HOLDING CHAT) ───────── */}
        {selectedRoom && (
          <div
            onClick={() => setSelectedRoom(null)}
            style={{
              position: 'fixed', inset: 0, zIndex: 250,
              background: 'rgba(15, 23, 18, 0.45)', backdropFilter: 'blur(2px)',
              display: 'grid', placeItems: 'center', padding: 20
            }}
          >
            <div
              role="dialog"
              onClick={e => e.stopPropagation()}
              style={{
                width: 'min(100%, 360px)', background: 'white', borderRadius: 16,
                padding: 22, boxShadow: '0 20px 50px rgba(0,0,0,0.25)'
              }}
            >
              {/* Room Header Info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 12,
                  background: 'linear-gradient(135deg, var(--green), var(--green-light))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
                  color: 'white', fontWeight: 700, overflow: 'hidden'
                }}>
                  {selectedRoom.workerAvatar && (selectedRoom.workerAvatar.startsWith('http') || selectedRoom.workerAvatar.startsWith('data:')) ? (
                    <img src={selectedRoom.workerAvatar} alt={selectedRoom.workerName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    selectedRoom.workerAvatar || selectedRoom.workerName.charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 16, color: 'var(--ink)' }}>{selectedRoom.workerName}</h3>
                  <div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>{selectedRoom.jobTitle}</div>
                </div>
              </div>

              <div style={{ display: 'grid', gap: 8 }}>
                {/* Delete Entire Chat */}
                <button
                  type="button"
                  onClick={() => confirmDeleteRoom(selectedRoom)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 14px', borderRadius: 10, border: '1.5px solid #fecaca',
                    background: '#fef2f2', color: '#dc2626', cursor: 'pointer',
                    fontSize: 14, fontWeight: 700, width: '100%', textAlign: 'left'
                  }}
                >
                  <span style={{ fontSize: 18 }}>🗑️</span>
                  <span>Delete Entire Chat</span>
                </button>

                {/* View Profile */}
                {selectedRoom.otherUserRole === 'worker' && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRoom(null);
                      navigate(`/worker/${selectedRoom.otherUserId}`);
                    }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '12px 14px', borderRadius: 10, border: '1.5px solid var(--border)',
                      background: 'white', color: 'var(--ink)', cursor: 'pointer',
                      fontSize: 14, fontWeight: 600, width: '100%', textAlign: 'left'
                    }}
                  >
                    <span style={{ fontSize: 18 }}>👤</span>
                    <span>View Worker Profile</span>
                  </button>
                )}

                {/* Contact phone */}
                {selectedRoom.otherUserPhone && (
                  <a
                    href={`tel:${selectedRoom.otherUserPhone.replace(/[^\d+]/g, '')}`}
                    onClick={() => setSelectedRoom(null)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none',
                      padding: '12px 14px', borderRadius: 10, border: '1.5px solid var(--border)',
                      background: 'white', color: 'var(--ink)', cursor: 'pointer',
                      fontSize: 14, fontWeight: 600, width: '100%', textAlign: 'left'
                    }}
                  >
                    <span style={{ fontSize: 18 }}>📞</span>
                    <span>Call ({selectedRoom.otherUserPhone})</span>
                  </a>
                )}

                <button
                  type="button"
                  onClick={() => setSelectedRoom(null)}
                  style={{
                    padding: '10px 14px', borderRadius: 10, border: 'none',
                    background: 'var(--surface)', color: 'var(--ink-soft)', cursor: 'pointer',
                    fontSize: 13, fontWeight: 600, width: '100%', marginTop: 4
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Contact Options Dialog */}
        {isContactOptionsOpen && activeRoom && (
          <div
            onClick={() => setIsContactOptionsOpen(false)}
            style={{
              position: 'fixed', inset: 0, zIndex: 200,
              background: 'rgba(15, 23, 18, 0.38)',
              display: 'grid', placeItems: 'center', padding: 20
            }}
          >
            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby="contact-dialog-title"
              onClick={event => event.stopPropagation()}
              style={{
                width: 'min(100%, 380px)', padding: 24, borderRadius: 12,
                background: 'white', boxShadow: '0 18px 50px rgba(0,0,0,0.2)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 18 }}>
                <div>
                  <h2 id="contact-dialog-title" style={{ margin: 0, fontSize: 18, color: 'var(--ink)' }}>
                    Contact {activeRoom.workerName}
                  </h2>
                  <p style={{ margin: '6px 0 0', fontSize: 13, color: 'var(--ink-soft)' }}>
                    Choose how you want to reach them.
                  </p>
                </div>
                <button
                  type="button"
                  aria-label="Close contact options"
                  onClick={() => setIsContactOptionsOpen(false)}
                  style={{ border: 0, background: 'transparent', color: 'var(--ink-soft)', cursor: 'pointer', fontSize: 22, lineHeight: 1 }}
                >
                  ×
                </button>
              </div>
              <div style={{ padding: '12px 14px', marginBottom: 14, border: '1px solid var(--border)', borderRadius: 8, color: 'var(--ink)', fontSize: 16, userSelect: 'text' }}>
                {phoneNumber}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <a href={`tel:${telephoneLink}`} onClick={() => setIsContactOptionsOpen(false)} className="btn btn-primary" style={{ justifyContent: 'center', textDecoration: 'none' }}>
                  📞 Call
                </a>
                <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noreferrer" onClick={() => setIsContactOptionsOpen(false)} className="btn btn-ghost" style={{ justifyContent: 'center', textDecoration: 'none' }}>
                  WhatsApp
                </a>
                <button type="button" className="btn btn-ghost" onClick={copyPhoneNumber} style={{ gridColumn: '1 / -1' }}>
                  Copy phone number
                </button>
              </div>
              <p style={{ margin: '14px 0 0', fontSize: 12, lineHeight: 1.5, color: 'var(--ink-soft)' }}>
                Calling uses the phone or calling app configured on your device.
              </p>
            </section>
          </div>
        )}

        {/* Delete Chat Confirmation Dialog */}
        {isDeleteChatModalOpen && (
          <div
            onClick={() => setIsDeleteChatModalOpen(false)}
            style={{
              position: 'fixed', inset: 0, zIndex: 200,
              background: 'rgba(15, 23, 18, 0.45)',
              display: 'grid', placeItems: 'center', padding: 20
            }}
          >
            <section
              role="dialog"
              aria-modal="true"
              onClick={e => e.stopPropagation()}
              style={{
                width: 'min(100%, 390px)', padding: 24, borderRadius: 12,
                background: 'white', boxShadow: '0 18px 50px rgba(0,0,0,0.2)'
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 8, textAlign: 'center' }}>🗑️</div>
              <h2 style={{ margin: '0 0 8px', fontSize: 18, color: 'var(--ink)', textAlign: 'center' }}>
                Delete Conversation?
              </h2>
              <p style={{ margin: '0 0 20px', fontSize: 14, color: 'var(--ink-soft)', textAlign: 'center', lineHeight: 1.5 }}>
                Are you sure you want to delete this chat with <strong>{roomToDelete?.workerName || activeRoom?.workerName}</strong>? All messages in this conversation will be permanently deleted.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => {
                    setIsDeleteChatModalOpen(false);
                    setRoomToDelete(null);
                  }}
                  disabled={isDeletingChat}
                  style={{ justifyContent: 'center' }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn"
                  onClick={handleDeleteChat}
                  disabled={isDeletingChat}
                  style={{
                    background: '#dc2626', color: 'white', border: 'none',
                    justifyContent: 'center', fontWeight: 700
                  }}
                >
                  {isDeletingChat ? 'Deleting...' : 'Delete Chat'}
                </button>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
