import { useEffect, useRef, useState, useCallback } from 'react';
import { Message } from './utils';

type Incoming = { type: 'message' | 'typing' | 'history'; payload: any };

export function useChatSocket(wsUrl: string, groupId: string, token?: string) {
  const wsRef = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const reconnectRef = useRef(0);
  const pendingSends = useRef<Message[]>([]);

  const send = useCallback((payload: any) => {
    const raw = JSON.stringify(payload);
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(raw);
    } else {
      // queue while reconnecting
      pendingSends.current.push(payload);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    function connect() {
      const url = `${wsUrl.replace('http', 'ws')}?group=${groupId}`;
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        reconnectRef.current = 0;
        setConnected(true);
        // flush queue
        pendingSends.current.forEach(p => ws.send(JSON.stringify(p)));
        pendingSends.current = [];
        // optional: request recent history
        ws.send(JSON.stringify({ command: 'fetch_history', limit: 50 }));
      };

      ws.onmessage = e => {
        try {
          const data: Incoming = JSON.parse(e.data);
          if (data.type === 'message') {
            setMessages(prev => [...prev, data.payload]);
          } else if (data.type === 'history') {
            setMessages(data.payload.concat());
          }
        } catch (err) {
          console.error('ws parse', err);
        }
      };

      ws.onclose = () => {
        setConnected(false);
        if (!mounted) return;
        const t = Math.min(10000, 1000 * 2 ** reconnectRef.current);
        reconnectRef.current += 1;
        setTimeout(connect, t);
      };

      ws.onerror = err => {
        console.error('ws error', err);
        ws.close();
      };
    }

    connect();

    return () => {
      mounted = false;
      wsRef.current?.close();
    };
  }, [wsUrl, groupId]);

  const sendMessage = useCallback((content: string, user: any) => {
    const msg = { type: 'message', payload: { content, sender: user, group: groupId } };
    send(msg);
  }, [groupId, send]);

  return { connected, messages, sendMessage, rawSocket: wsRef.current };
}