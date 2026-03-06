"use client";

import { useState, useEffect } from "react";
import Navbar from "@/app/components/navbar";
import Sidebar from "@/app/components/Sidebar";
import ChatWindow from "@/app/components/ChatWindow";
import { loadChats, saveChats } from "@/app/lib/chatStorage";

export default function ChatPage() {
  // Start with empty array — avoids SSR/client mismatch
  const [chats, setChats] = useState<any[]>([]);
  const [activeChat, setActiveChat] = useState(0);
  const [ready, setReady] = useState(false);

  // Load from localStorage only on client after mount
  useEffect(() => {
    const loaded = loadChats();
    if (loaded.length === 0) {
      const first = {
        id: Date.now(),
        title: "Session 1",
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      saveChats([first]);
      setChats([first]);
    } else {
      setChats(loaded);
    }
    setReady(true);
  }, []);

  // Don't render sidebar/chat until client data is loaded
  if (!ready) return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Navbar />
    </div>
  );

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          chats={chats}
          setChats={setChats}
          activeChat={activeChat}
          selectChat={setActiveChat}
        />
        <ChatWindow
          chats={chats}
          setChats={setChats}
          activeChat={activeChat}
          setActiveChat={setActiveChat}
        />
      </div>
    </div>
  );
}