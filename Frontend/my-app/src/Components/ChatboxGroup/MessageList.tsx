import React, { useMemo } from 'react';
import { FixedSizeList as List } from 'react-window';
import MessageBubble from './MessageBubble';
import { Message } from './utils';

export default function MessageList({ messages, currentUserId }: { messages: Message[]; currentUserId: string }) {
  const itemData = useMemo(() => ({ messages, currentUserId }), [messages, currentUserId]);
  return (
    <List
      height={500}
      itemCount={messages.length}
      itemSize={72}
      width={'100%'}
      itemData={itemData}
    >
      {({ index, style, data }: any) => {
        const m: Message = data.messages[index];
        const mine = m.sender.id === data.currentUserId;
        return (
          <div style={{ ...style, display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start', padding: 8 }}>
            <MessageBubble m={m} mine={mine} />
          </div>
        );
      }}</List>
  );
}