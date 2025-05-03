
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Send, 
  UserRound, 
  Phone, 
  Video,
  MoreHorizontal,
  Image as ImageIcon,
  Smile,
  PaperclipIcon, 
  Mic, 
  Settings, 
  LogOut,
  MessageSquare,
  Users,
  Bell,
  Search,
} from "lucide-react";

// Types
type User = {
  id: string;
  name: string;
  avatar: string;
  status: "online" | "offline" | "away" | "busy";
  lastSeen?: string;
  isTyping?: boolean;
  statusMessage?: string;
};

type EmojiReaction = "❤️" | "👍" | "😂" | "😮" | "😢" | "🔥";

type Message = {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  isRead: boolean;
  reactions?: {
    emoji: EmojiReaction;
    users: string[];
  }[];
};

type Chat = {
  id: string;
  participants: User[];
  messages: Message[];
  unreadCount: number;
  lastMessageTimestamp: string;
};

// Mock Data
const currentUserId = "user-1";

const mockUsers: User[] = [
  {
    id: "user-1",
    name: "You",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    status: "online",
  },
  {
    id: "user-2",
    name: "Emma Thompson",
    avatar: "https://randomuser.me/api/portraits/women/65.jpg",
    status: "online",
    isTyping: false,
    statusMessage: "Working from home today"
  },
  {
    id: "user-3",
    name: "Michael Rodriguez",
    avatar: "https://randomuser.me/api/portraits/men/41.jpg",
    status: "busy",
    statusMessage: "In a meeting"
  },
  {
    id: "user-4",
    name: "Sarah Johnson",
    avatar: "https://randomuser.me/api/portraits/women/28.jpg",
    status: "away",
    lastSeen: "2 hours ago",
  },
  {
    id: "user-5",
    name: "David Kim",
    avatar: "https://randomuser.me/api/portraits/men/64.jpg",
    status: "online",
  },
  {
    id: "user-6",
    name: "Lisa Chen",
    avatar: "https://randomuser.me/api/portraits/women/17.jpg",
    status: "offline",
    lastSeen: "1 day ago",
  },
  {
    id: "user-7",
    name: "James Wilson",
    avatar: "https://randomuser.me/api/portraits/men/83.jpg",
    status: "online",
  }
];

const mockChats: Chat[] = [
  {
    id: "chat-1",
    participants: [mockUsers[0], mockUsers[1]],
    messages: [
      {
        id: "msg-1",
        senderId: "user-2",
        text: "Hey there! How's your day going?",
        timestamp: "10:30 AM",
        isRead: true,
      },
      {
        id: "msg-2",
        senderId: "user-1",
        text: "Pretty good! Just finishing up some work. How about you?",
        timestamp: "10:32 AM",
        isRead: true,
      },
      {
        id: "msg-3",
        senderId: "user-2",
        text: "Same here. I was wondering if you'd like to grab lunch later this week?",
        timestamp: "10:33 AM",
        isRead: true,
      },
      {
        id: "msg-4",
        senderId: "user-1",
        text: "That sounds great! How about Wednesday?",
        timestamp: "10:36 AM",
        isRead: true,
      },
      {
        id: "msg-5",
        senderId: "user-2",
        text: "Wednesday works perfectly! Let's meet at that new place downtown.",
        timestamp: "10:37 AM",
        isRead: true,
        reactions: [
          {
            emoji: "👍",
            users: ["user-1"]
          }
        ]
      },
    ],
    unreadCount: 0,
    lastMessageTimestamp: "10:37 AM",
  },
  {
    id: "chat-2",
    participants: [mockUsers[0], mockUsers[2]],
    messages: [
      {
        id: "msg-6",
        senderId: "user-3",
        text: "Hey, can you send me those project files when you get a chance?",
        timestamp: "Yesterday",
        isRead: true,
      },
      {
        id: "msg-7",
        senderId: "user-1",
        text: "Sure thing, I'll email them to you right away.",
        timestamp: "Yesterday",
        isRead: true,
      },
      {
        id: "msg-8",
        senderId: "user-3",
        text: "Thanks! I appreciate it.",
        timestamp: "Yesterday",
        isRead: false,
      },
    ],
    unreadCount: 1,
    lastMessageTimestamp: "Yesterday",
  },
  {
    id: "chat-3",
    participants: [mockUsers[0], mockUsers[3]],
    messages: [
      {
        id: "msg-9",
        senderId: "user-4",
        text: "Did you see the email about the team meeting tomorrow?",
        timestamp: "Monday",
        isRead: true,
      },
      {
        id: "msg-10",
        senderId: "user-1",
        text: "Yes, I'll be there. Do we need to prepare anything?",
        timestamp: "Monday",
        isRead: true,
      },
      {
        id: "msg-11",
        senderId: "user-4",
        text: "Just bring your quarterly reports. We'll be reviewing everyone's progress.",
        timestamp: "Monday",
        isRead: true,
        reactions: [
          {
            emoji: "👍",
            users: ["user-1"]
          },
          {
            emoji: "😮",
            users: ["user-1"]
          }
        ]
      },
    ],
    unreadCount: 0,
    lastMessageTimestamp: "Monday",
  },
];

// Status message options
const statusOptions = [
  { value: "", label: "Available" },
  { value: "In a meeting", label: "In a meeting" },
  { value: "At lunch", label: "At lunch" },
  { value: "Working remotely", label: "Working remotely" },
  { value: "Be right back", label: "Be right back" },
  { value: "Do not disturb", label: "Do not disturb" }
];

// Emoji reactions
const emojiReactions: EmojiReaction[] = ["❤️", "👍", "😂", "😮", "😢", "🔥"];

const ChatApp = () => {
  // States
  const [activeView, setActiveView] = useState<"welcome" | "chat">("welcome");
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [chats, setChats] = useState<Chat[]>(mockChats);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [userStatus, setUserStatus] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentUserAvatar, setCurrentUserAvatar] = useState(mockUsers[0].avatar);
  const [showMobileUsers, setShowMobileUsers] = useState(false);
  
  const messageEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const messageContainerRef = useRef<HTMLDivElement>(null);
  
  // Get active chat
  const activeChat = activeChatId 
    ? chats.find(chat => chat.id === activeChatId)
    : null;
  
  // Get other participant in active chat
  const chatPartner = activeChat 
    ? activeChat.participants.find(p => p.id !== currentUserId)
    : null;
    
  // Filter users by search query
  const filteredUsers = users.filter(user => 
    user.id !== currentUserId && 
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Filter chats by search query
  const filteredChats = chats.filter(chat => {
    const otherParticipant = chat.participants.find(p => p.id !== currentUserId);
    return otherParticipant?.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Scroll to bottom when messages change
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChatId, chats]);

  // Simulate typing indicator from chat partner
  useEffect(() => {
    if (activeChatId && chatPartner && Math.random() > 0.7) {
      const typingTimeout = setTimeout(() => {
        // Update user status to typing
        setUsers(prev => 
          prev.map(user => 
            user.id === chatPartner.id 
              ? { ...user, isTyping: true } 
              : user
          )
        );

        // After a few seconds, stop typing and send a message
        setTimeout(() => {
          setUsers(prev => 
            prev.map(user => 
              user.id === chatPartner.id 
                ? { ...user, isTyping: false } 
                : user
            )
          );

          // Add a new message from partner
          const responseMessages = [
            "That sounds good to me!",
            "I'll get back to you on that.",
            "Can we talk about this tomorrow?",
            "Thanks for letting me know.",
            "I completely agree with you.",
            "Could you provide more details?"
          ];
          
          const randomResponse = responseMessages[Math.floor(Math.random() * responseMessages.length)];
          
          addMessage(chatPartner.id, randomResponse);
        }, 2000 + Math.random() * 3000);
      }, 5000 + Math.random() * 10000);

      return () => clearTimeout(typingTimeout);
    }
  }, [activeChatId, chats]);

  // Handle typing indicator
  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
    }
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 2000);
  };

  // Add new message
  const addMessage = (senderId: string, text: string) => {
    if (!activeChatId || !text.trim()) return;
    
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      senderId,
      text,
      timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
      isRead: false,
    };
    
    setChats(prev => 
      prev.map(chat => 
        chat.id === activeChatId
          ? { 
              ...chat, 
              messages: [...chat.messages, newMessage],
              lastMessageTimestamp: newMessage.timestamp,
              unreadCount: senderId === currentUserId ? chat.unreadCount : chat.unreadCount + 1
            }
          : chat
      )
    );
  };

  // Send message
  const sendMessage = () => {
    if (!message.trim() || !activeChatId) return;
    
    addMessage(currentUserId, message);
    setMessage("");
    setIsTyping(false);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    setShowEmojiPicker(false);
  };

  // Add reaction to message
  const addReaction = (messageId: string, emoji: EmojiReaction) => {
    setShowReactionPicker(null);
    
    setChats(prev => 
      prev.map(chat => {
        if (chat.id !== activeChatId) return chat;
        
        return {
          ...chat,
          messages: chat.messages.map(msg => {
            if (msg.id !== messageId) return msg;
            
            // Check if reaction already exists
            const existingReaction = msg.reactions?.find(r => r.emoji === emoji);
            
            if (existingReaction) {
              // Check if user already reacted
              if (existingReaction.users.includes(currentUserId)) {
                // Remove user from reaction
                return {
                  ...msg,
                  reactions: msg.reactions?.map(r => 
                    r.emoji === emoji 
                      ? { ...r, users: r.users.filter(u => u !== currentUserId) }
                      : r
                  ).filter(r => r.users.length > 0)
                };
              } else {
                // Add user to reaction
                return {
                  ...msg,
                  reactions: msg.reactions?.map(r => 
                    r.emoji === emoji 
                      ? { ...r, users: [...r.users, currentUserId] }
                      : r
                  )
                };
              }
            } else {
              // Create new reaction
              return {
                ...msg,
                reactions: [
                  ...(msg.reactions || []),
                  { emoji, users: [currentUserId] }
                ]
              };
            }
          })
        };
      })
    );
  };

  // Update user status
  const updateUserStatus = (status: string) => {
    setUserStatus(status);
    
    // Update current user status message
    setUsers(prev => 
      prev.map(user => 
        user.id === currentUserId 
          ? { ...user, statusMessage: status } 
          : user
      )
    );
  };

  // Start new chat
  const startNewChat = (userId: string) => {
    // Check if chat already exists
    const existingChat = chats.find(chat => 
      chat.participants.some(p => p.id === userId)
    );
    
    if (existingChat) {
      setActiveChatId(existingChat.id);
    } else {
      // Create new chat
      const otherUser = users.find(u => u.id === userId);
      if (!otherUser) return;
      
      const currentUser = users.find(u => u.id === currentUserId);
      if (!currentUser) return;
      
      const newChat: Chat = {
        id: `chat-${Date.now()}`,
        participants: [currentUser, otherUser],
        messages: [],
        unreadCount: 0,
        lastMessageTimestamp: new Date().toLocaleString()
      };
      
      setChats(prev => [...prev, newChat]);
      setActiveChatId(newChat.id);
    }
    
    setActiveView("chat");
    setShowMobileUsers(false);
  };

  // Format last seen
  const formatLastSeen = (user: User) => {
    if (user.status === "online") return "Online";
    if (user.status === "busy") return "Busy";
    if (user.status === "away") return "Away";
    return user.lastSeen || "Offline";
  };

  // Handle keydown for message input
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="bg-muted px-4 md:px-6 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center">
          <MessageSquare className="h-6 w-6 text-accent mr-2" />
          <h1 className="text-xl font-bold">ChatSpark</h1>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setShowSettings(true)}
            className="p-2 rounded-full hover:bg-accent/20 transition-colors"
            aria-label="Settings"
          >
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex flex-grow overflow-hidden">
        {/* Left sidebar - Users list (hidden on mobile) */}
        <div 
          className={`${
            showMobileUsers ? "absolute inset-0 z-20 bg-background" : "hidden"
          } md:relative md:flex md:w-80 shrink-0 flex-col border-r border-border overflow-y-auto`}
        >
          {/* Search bar */}
          <div className="p-3 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search users and chats..."
                className="w-full py-2 pl-10 pr-4 rounded-md bg-muted focus:outline-none focus:ring-1 focus:ring-accent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* User Profile */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center">
              <div className="relative">
                <img 
                  src={currentUserAvatar} 
                  alt="Your avatar" 
                  className="w-12 h-12 rounded-full object-cover border-2 border-accent"
                />
                <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-background"></div>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="font-semibold">You</h3>
                <div className="flex items-center text-sm">
                  <select
                    className="appearance-none bg-transparent border-none text-muted-foreground focus:outline-none pr-6"
                    value={userStatus}
                    onChange={(e) => updateUserStatus(e.target.value)}
                  >
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-border">
            <button 
              className="flex-1 py-3 text-center font-medium border-b-2 border-accent"
              onClick={() => setSearchQuery("")}
            >
              Chats
            </button>
            <button 
              className="flex-1 py-3 text-center font-medium text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setSearchQuery("")}
            >
              Online Users
            </button>
          </div>

          {/* Users/Chats List */}
          <div className="flex-1 overflow-y-auto">
            <AnimatePresence>
              {searchQuery ? (
                <div className="p-1">
                  <h3 className="text-xs uppercase text-muted-foreground font-semibold px-3 py-2">
                    Search Results
                  </h3>
                  {filteredUsers.map((user) => (
                    <motion.button
                      key={user.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="w-full p-3 flex items-center rounded-lg hover:bg-accent/10 transition-colors"
                      onClick={() => startNewChat(user.id)}
                    >
                      <div className="relative">
                        <img 
                          src={user.avatar} 
                          alt={user.name} 
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div 
                          className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-background
                            ${user.status === "online" ? "bg-green-500" : 
                              user.status === "busy" ? "bg-red-500" : 
                              user.status === "away" ? "bg-yellow-500" : "bg-gray-500"}`}
                        ></div>
                      </div>
                      <div className="ml-3 text-left">
                        <div className="font-medium">{user.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {formatLastSeen(user)}
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              ) : (
                <div className="p-1">
                  <h3 className="text-xs uppercase text-muted-foreground font-semibold px-3 py-2">
                    Recent Conversations
                  </h3>
                  {chats.map((chat) => {
                    const otherParticipant = chat.participants.find(p => p.id !== currentUserId);
                    if (!otherParticipant) return null;
                    
                    const lastMessage = chat.messages[chat.messages.length - 1];
                    
                    return (
                      <motion.button
                        key={chat.id}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className={`w-full p-3 flex items-center rounded-lg transition-colors
                          ${activeChatId === chat.id ? "bg-accent/20" : "hover:bg-accent/10"}`}
                        onClick={() => {
                          setActiveChatId(chat.id);
                          setActiveView("chat");
                          setShowMobileUsers(false);
                          
                          // Mark messages as read
                          if (chat.unreadCount > 0) {
                            setChats(prev =>
                              prev.map(c =>
                                c.id === chat.id
                                  ? {
                                      ...c,
                                      unreadCount: 0,
                                      messages: c.messages.map(msg =>
                                        msg.senderId !== currentUserId ? { ...msg, isRead: true } : msg
                                      ),
                                    }
                                  : c
                              )
                            );
                          }
                        }}
                      >
                        <div className="relative">
                          <img
                            src={otherParticipant.avatar}
                            alt={otherParticipant.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          <div
                            className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background
                              ${otherParticipant.status === "online" ? "bg-green-500" : 
                                otherParticipant.status === "busy" ? "bg-red-500" : 
                                otherParticipant.status === "away" ? "bg-yellow-500" : "bg-gray-500"}`}
                          ></div>
                        </div>
                        <div className="ml-3 flex-1 text-left">
                          <div className="flex justify-between items-baseline">
                            <span className="font-medium">{otherParticipant.name}</span>
                            <span className="text-xs text-muted-foreground">{chat.lastMessageTimestamp}</span>
                          </div>
                          <div className="text-sm text-muted-foreground truncate max-w-[180px] md:max-w-[220px]">
                            {lastMessage ? (
                              <>
                                {lastMessage.senderId === currentUserId && "You: "}
                                {lastMessage.text}
                              </>
                            ) : "No messages yet"}
                          </div>
                        </div>
                        {chat.unreadCount > 0 && (
                          <div className="ml-2">
                            <span className="bg-accent text-white text-xs rounded-full px-2 py-1 min-w-[20px] inline-block text-center">
                              {chat.unreadCount}
                            </span>
                          </div>
                        )}
                      </motion.button>
                    );
                  })}

                  <h3 className="text-xs uppercase text-muted-foreground font-semibold px-3 py-2 mt-4">
                    Online Users
                  </h3>
                  {users
                    .filter(user => user.id !== currentUserId && user.status === "online")
                    .map((user) => (
                      <motion.button
                        key={user.id}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="w-full p-3 flex items-center rounded-lg hover:bg-accent/10 transition-colors"
                        onClick={() => startNewChat(user.id)}
                      >
                        <div className="relative">
                          <img 
                            src={user.avatar} 
                            alt={user.name} 
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-background"></div>
                        </div>
                        <div className="ml-3 text-left">
                          <div className="font-medium">{user.name}</div>
                          {user.statusMessage && (
                            <div className="text-xs text-muted-foreground">{user.statusMessage}</div>
                          )}
                        </div>
                      </motion.button>
                    ))
                  }
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Mobile close button */}
          <div className="md:hidden p-3 border-t border-border">
            <button
              className="w-full py-2 bg-muted rounded-md font-medium"
              onClick={() => setShowMobileUsers(false)}
            >
              Close
            </button>
          </div>
        </div>

        {/* Right side - Chat window */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {activeView === "welcome" ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="max-w-md"
              >
                <MessageSquare className="h-20 w-20 text-accent mx-auto mb-6 opacity-80" />
                <h1 className="text-3xl font-bold mb-3">Welcome to ChatSpark</h1>
                <p className="text-muted-foreground mb-6">
                  Connect and chat with friends and colleagues in real-time. 
                  Select a conversation from the sidebar to get started.
                </p>
                <button 
                  className="md:hidden mt-4 px-6 py-3 bg-accent text-white rounded-lg font-medium"
                  onClick={() => setShowMobileUsers(true)}
                >
                  Start a Conversation
                </button>
              </motion.div>
            </div>
          ) : activeChatId && chatPartner ? (
            <>
              {/* Chat header */}
              <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                <div className="flex items-center">
                  <button className="md:hidden mr-2" onClick={() => setActiveView("welcome")}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <button className="md:hidden mr-2" onClick={() => setShowMobileUsers(true)}>
                    <Users className="h-5 w-5" />
                  </button>
                  <div className="relative">
                    <img 
                      src={chatPartner.avatar} 
                      alt={chatPartner.name} 
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div 
                      className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-background
                        ${chatPartner.status === "online" ? "bg-green-500" : 
                          chatPartner.status === "busy" ? "bg-red-500" : 
                          chatPartner.status === "away" ? "bg-yellow-500" : "bg-gray-500"}`}
                    ></div>
                  </div>
                  <div className="ml-3">
                    <div className="font-medium">{chatPartner.name}</div>
                    <div className="text-xs text-muted-foreground flex items-center">
                      {chatPartner.isTyping ? (
                        <span className="flex items-center">
                          typing
                          <span className="ml-1 flex">
                            <motion.span
                              animate={{ y: [0, -3, 0] }}
                              transition={{ repeat: Infinity, duration: 1.5, delay: 0 }}
                              className="w-1 h-1 bg-muted-foreground rounded-full mx-0.5"
                            />
                            <motion.span
                              animate={{ y: [0, -3, 0] }}
                              transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }}
                              className="w-1 h-1 bg-muted-foreground rounded-full mx-0.5"
                            />
                            <motion.span
                              animate={{ y: [0, -3, 0] }}
                              transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }}
                              className="w-1 h-1 bg-muted-foreground rounded-full mx-0.5"
                            />
                          </span>
                        </span>
                      ) : (
                        <span>
                          {chatPartner.statusMessage || formatLastSeen(chatPartner)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <button className="p-2 rounded-full hover:bg-accent/10">
                    <Phone className="h-5 w-5" />
                  </button>
                  <button className="p-2 rounded-full hover:bg-accent/10">
                    <Video className="h-5 w-5" />
                  </button>
                  <button className="p-2 rounded-full hover:bg-accent/10">
                    <MoreHorizontal className="h-5 w-5" />
                  </button>
                </div>
              </div>
              
              {/* Messages */}
              <div 
                ref={messageContainerRef}
                className="flex-1 p-4 overflow-y-auto"
              >
                {activeChat?.messages.map((msg, index) => {
                  const isCurrentUser = msg.senderId === currentUserId;
                  const sender = activeChat.participants.find(p => p.id === msg.senderId);
                  
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`flex mb-4 ${isCurrentUser ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`flex ${isCurrentUser ? "flex-row-reverse" : "flex-row"} max-w-[80%] md:max-w-[70%] items-end`}>
                        {!isCurrentUser && (
                          <img 
                            src={sender?.avatar || ""} 
                            alt={sender?.name || ""}
                            className="w-8 h-8 rounded-full object-cover flex-shrink-0 mx-2"
                          />
                        )}
                        <div className="relative group">
                          <div 
                            className={`p-3 rounded-lg ${
                              isCurrentUser ? "bg-accent text-white rounded-tr-none" : "bg-muted rounded-tl-none"
                            }`}
                          >
                            <div className="whitespace-pre-wrap break-words">{msg.text}</div>
                            <div className={`text-xs mt-1 ${isCurrentUser ? "text-white/80" : "text-muted-foreground"}`}>
                              {msg.timestamp}
                              {isCurrentUser && msg.isRead && (
                                <span className="ml-1">✓</span>
                              )}
                            </div>
                          </div>
                          
                          {/* Reaction button */}
                          <button
                            onClick={() => setShowReactionPicker(showReactionPicker === msg.id ? null : msg.id)}
                            className="absolute top-0 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full bg-background border border-border shadow-sm hover:bg-accent/10"
                            style={{ 
                              [isCurrentUser ? 'left' : 'right']: '-8px',
                              transform: 'translateY(-50%)'
                            }}
                          >
                            <Smile className="h-3 w-3" />
                          </button>
                          
                          {/* Reaction picker */}
                          {showReactionPicker === msg.id && (
                            <div
                              className="absolute bottom-full mb-2 bg-background rounded-full p-1 border border-border shadow-lg flex"
                              style={{ 
                                [isCurrentUser ? 'right' : 'left']: '0'
                              }}
                            >
                              {emojiReactions.map(emoji => (
                                <button
                                  key={emoji}
                                  onClick={() => addReaction(msg.id, emoji)}
                                  className="p-1.5 hover:bg-accent/10 rounded-full transition-colors text-lg"
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                          )}
                          
                          {/* Reactions display */}
                          {msg.reactions && msg.reactions.length > 0 && (
                            <div
                              className="absolute bg-background rounded-full px-2 py-0.5 border border-border shadow-sm flex items-center"
                              style={{ 
                                [isCurrentUser ? 'right' : 'left']: '8px',
                                bottom: '-8px',
                              }}
                            >
                              {msg.reactions.map(reaction => (
                                <div
                                  key={reaction.emoji}
                                  className="flex items-center mr-1 last:mr-0"
                                >
                                  <span className="mr-1">{reaction.emoji}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {reaction.users.length}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
                <div ref={messageEndRef} />
              </div>
              
              {/* Typing indicator */}
              {chatPartner.isTyping && (
                <div className="px-6 py-1 text-muted-foreground">
                  <span className="flex items-center text-sm">
                    {chatPartner.name} is typing
                    <span className="ml-1 flex">
                      <motion.span
                        animate={{ y: [0, -3, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5, delay: 0 }}
                        className="w-1.5 h-1.5 bg-muted-foreground rounded-full mx-0.5"
                      />
                      <motion.span
                        animate={{ y: [0, -3, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }}
                        className="w-1.5 h-1.5 bg-muted-foreground rounded-full mx-0.5"
                      />
                      <motion.span
                        animate={{ y: [0, -3, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }}
                        className="w-1.5 h-1.5 bg-muted-foreground rounded-full mx-0.5"
                      />
                    </span>
                  </span>
                </div>
              )}
              
              {/* Message input */}
              <div className="p-3 border-t border-border">
                <div className="flex items-end bg-muted rounded-lg p-2">
                  <button className="p-2 text-muted-foreground hover:text-foreground">
                    <PaperclipIcon className="h-5 w-5" />
                  </button>
                  <div className="flex-1 relative">
                    <textarea
                      value={message}
                      onChange={(e) => {
                        setMessage(e.target.value);
                        handleTyping();
                      }}
                      onKeyDown={handleKeyDown}
                      placeholder="Type a message..."
                      className="w-full bg-transparent border-0 focus:ring-0 resize-none max-h-32 py-2 px-2"
                      rows={1}
                    ></textarea>
                    {isTyping && (
                      <div className="absolute bottom-1 right-2 text-xs text-muted-foreground">
                        You are typing...
                      </div>
                    )}
                  </div>
                  <div className="flex">
                    <button 
                      className="p-2 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    >
                      <Smile className="h-5 w-5" />
                    </button>
                    <button className="p-2 text-muted-foreground hover:text-foreground">
                      <Mic className="h-5 w-5" />
                    </button>
                    <button
                      className={`ml-1 p-2 rounded-full ${
                        message.trim() ? "bg-accent text-white" : "bg-muted-foreground/20 text-muted-foreground"
                      }`}
                      onClick={sendMessage}
                      disabled={!message.trim()}
                    >
                      <Send className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                
                {/* Emoji picker */}
                <AnimatePresence>
                  {showEmojiPicker && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="mt-2 bg-background border border-border rounded-lg p-2 shadow-lg"
                    >
                      <div className="grid grid-cols-8 gap-1">
                        {["😊", "😂", "❤️", "👍", "🎉", "🙏", "🤔", "😎",
                          "😍", "🔥", "👏", "🌟", "💯", "🤣", "😢", "😡",
                          "👋", "🥳", "💪", "🙌", "👀", "💓", "🎈", "🤦"].map(emoji => (
                          <button
                            key={emoji}
                            className="p-2 text-xl hover:bg-accent/10 rounded transition-colors"
                            onClick={() => {
                              setMessage(prev => prev + emoji);
                              setShowEmojiPicker(false);
                            }}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="text-center text-muted-foreground">
                Select a conversation to start chatting
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card w-full max-w-md rounded-lg shadow-xl"
            >
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h3 className="text-lg font-semibold">Settings</h3>
                <button 
                  onClick={() => setShowSettings(false)}
                  className="p-1 rounded-full hover:bg-accent/10"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              <div className="p-4">
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Your Avatar</label>
                  <div className="flex items-center">
                    <img 
                      src={currentUserAvatar} 
                      alt="Your avatar" 
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <button className="ml-4 px-3 py-1 text-sm border border-border rounded-md hover:bg-muted transition-colors">
                      Change
                    </button>
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Status</label>
                  <select
                    className="w-full p-2 bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-accent"
                    value={userStatus}
                    onChange={(e) => updateUserStatus(e.target.value)}
                  >
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Notifications</label>
                  <div className="flex items-center justify-between">
                    <span>Message notifications</span>
                    <button className="w-12 h-6 bg-accent rounded-full p-1 transition-colors relative">
                      <span className="block w-4 h-4 bg-white rounded-full absolute right-1 top-1"></span>
                    </button>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setShowSettings(false)}
                    className="px-4 py-2 border border-border rounded-md hover:bg-muted transition-colors mr-2"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setShowSettings(false)}
                    className="px-4 py-2 bg-accent text-white rounded-md hover:bg-accent/80 transition-colors"
                  >
                    Save
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-muted border-t border-border flex justify-around py-2 z-10">
        <button
          className={`p-3 rounded-full flex flex-col items-center text-xs ${
            activeView === "welcome" ? "text-accent" : "text-muted-foreground"
          }`}
          onClick={() => setActiveView("welcome")}
        >
          <MessageSquare className="h-6 w-6 mb-1" />
          Home
        </button>
        <button
          className={`p-3 rounded-full flex flex-col items-center text-xs text-muted-foreground`}
          onClick={() => setShowMobileUsers(true)}
        >
          <Users className="h-6 w-6 mb-1" />
          Chats
        </button>
        <button
          className={`p-3 rounded-full flex flex-col items-center text-xs text-muted-foreground`}
          onClick={() => setShowSettings(true)}
        >
          <Settings className="h-6 w-6 mb-1" />
          Settings
        </button>
      </div>

      {/* Footer */}
      <footer className="py-3 px-6 border-t border-border hidden md:block">
        <div className="flex justify-between text-sm text-muted-foreground">
          <p>© 2025 ChatSpark. All rights reserved.</p>
          <div className="space-x-4">
            <a href="#" className="hover:text-foreground">Terms</a>
            <a href="#" className="hover:text-foreground">Privacy</a>
            <a href="#" className="hover:text-foreground">Help</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ChatApp;
