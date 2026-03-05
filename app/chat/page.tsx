"use client";

import { useState } from "react";
import Navbar from "@/app/components/navbar";
import Sidebar from "@/app/components/Sidebar";
import ChatWindow from "@/app/components/ChatWindow";

export default function ChatPage() {

  const [chats, setChats] = useState([
    {
      title: "New Conversation",
      messages: [
        { text: "Hello, how can I assist you today?", sender: "bot" }
      ]
    }
  ]);

  const [activeChat, setActiveChat] = useState(0);

  return (
    <div className="h-screen flex flex-col">
      <Navbar />

      <div className="flex flex-1">
        <Sidebar
          chats={chats}
          activeChat={activeChat}
          setActiveChat={setActiveChat}
        />

        <ChatWindow
          chats={chats}
          setChats={setChats}
          activeChat={activeChat}
        />
      </div>
    </div>
  );
}