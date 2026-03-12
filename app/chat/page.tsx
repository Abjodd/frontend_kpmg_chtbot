"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/navbar";
import Sidebar from "@/app/components/Sidebar";
import ChatWindow from "@/app/components/ChatWindow";

export default function ChatPage() {
  const [chats, setChats] = useState<any[]>([]);
  const [activeChat, setActiveChat] = useState(0);
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    // Get logged-in user from localStorage
    const stored = localStorage.getItem("user");
    if (!stored) {
      router.push("/"); 
      return;
    }

    const parsedUser = JSON.parse(stored);
    setUser(parsedUser);

  
    async function loadChats() {
      try {
        const res = await fetch(`/api/chats?userId=${parsedUser._id}`);
        const loaded = await res.json();

        if (!loaded.length) {
    
          const createRes = await fetch("/api/chats", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: parsedUser._id,
              title: "Session 1",
              messages: [],
            }),
          });
          const first = await createRes.json();
          setChats([first]);
        } else {
          setChats(loaded);
        }
      } catch (err) {
        console.error("Failed to load chats:", err);
        setChats([]);
      } finally {
        setReady(true);
      }
    }

    loadChats();
  }, []);

  const handleSetChats = (action: any) => {
    setChats((prev) => {
      const next = typeof action === "function" ? action(prev) : action;
      return next;
    });
  };

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
          setChats={handleSetChats}
          activeChat={activeChat}
          selectChat={setActiveChat}
          user={user}
        />
        <ChatWindow
          chats={chats}
          setChats={handleSetChats}
          activeChat={activeChat}
          setActiveChat={setActiveChat}
          user={user}
        />
      </div>
    </div>
  );
}