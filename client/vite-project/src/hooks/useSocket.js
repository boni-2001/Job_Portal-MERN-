import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import useAuth from './useAuth';

export default function useSocket() {
  const { user } = useAuth();
  const socketRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    const s = io(import.meta.env.VITE_API_BASE_URL, { transports: ['websocket'] });
    s.on('connect', () => {
      s.emit('identify', { role: user.role, userId: user.id });
    });
    socketRef.current = s;
    return () => s.disconnect();
  }, [user]);

  return socketRef.current;
}
