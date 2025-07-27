'use client';

import { useState, useRef, useEffect } from 'react';
import {
  IconMessageChatbot,
  IconMessageChatbotFilled,
} from '@tabler/icons-react';

type Message = { sender: 'user' | 'bot'; text: string };

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg: Message = { sender: 'user', text: input };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const res = await fetch('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });
      const data = await res.json();
      const botMsg: Message = { sender: 'bot', text: data.reply };
      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: 'Lỗi kết nối server.' },
      ]);
    }

    setInput('');
  };
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <>
      {/* Nút mở chat */}
      <div className="fixed bottom-4 right-12 z-50">
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-full shadow"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? (
            <IconMessageChatbot size={30} />
          ) : (
            <IconMessageChatbotFilled size={30} />
          )}
        </button>
      </div>

      {/* Hộp chat */}
      {isOpen && (
        <div className="fixed bottom-17 right-12 w-80 h-96 bg-blue-200 border border-gray-500 rounded  rounded-md	 shadow-ls z-50 flex flex-col">
          <div className="flex-1 bg-gray-50 border border-gray-300 shadow-ls rounded-t-md overflow-hidden flex flex-col">
            <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-2">
              <div ref={messagesEndRef} /> {/* Scroll to bottom */}
              {[...messages].map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex mb-2 ${
                    msg.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm shadow 
            ${
              msg.sender === 'user'
                ? 'bg-blue-500 text-white rounded-br-none'
                : 'bg-gray-200 text-black rounded-bl-none'
            }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} /> {/* Scroll to bottom */}
            </div>
          </div>

          <div className="p-2 border-t flex">
            <input
              className="flex-1 border rounded px-2 py-1 bg-gray-100 border border-gray-200  focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-300 transition-all duration-200"
              placeholder="Nhập tin nhắn..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            />
            <button
              onClick={sendMessage}
              className="ml-2 bg-blue-500 text-white px-3 rounded"
            >
              Gửi
            </button>
          </div>
        </div>
      )}
    </>
  );
}
