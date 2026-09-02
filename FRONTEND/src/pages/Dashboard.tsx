import React, { useState, useEffect} from 'react';
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  Calendar,
  MessageSquare,
  PieChart,
  Settings,
  Bell,
  Layers,
  House,
  Search,
  Menu,
  Brain,
  ChartPie,
  BringToFront,
  RefreshCcw,
  LogOut,
  ListTodo,
  Network,
  NotebookText,
  Zap,
  MessagesSquare,
  Moon,
  ChevronRight,
  Blocks,
  User,
  Plug,
  Video
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Import content components
import Home from './Home';
import Projects from './Projects';
import Contacts from './Contacts';
import Execution from './Execution';
import Calender from './Calender';
import Analytics from './Analytics';
import Chat from './Chat';
import Logs from './Logs';
import Integrations from './Integrations';
import Tasks from './Tasks';
import Notifications from './Notifications';
import Setting from './Setting';
import Account from './Account';

import { useApp } from "@/context/AppContext";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type UserType = {
  id: string;
  email: string;
  name: string;
  pfp?: string;
};

const colors = {
  bg: "#F8FAFC",
  card: "#FFFFFF",
  textMain: "#0F172A",
  textSecondary: "#64748B",
  border: "#E2E8F0",
};

type NavItem = {
  id: RouteKey;
  icon: any;
  label: string;
  component: any;
};

// Navigation items configuration
const navItems: NavItem[] = [
  { id: 'Home', icon: House, label: 'Home', component: Home },
  { id: 'Execution', icon: Network, label: 'Execution', component: Execution },
  { id: 'Analytics', icon: ChartPie, label: 'Analytics', component: Analytics },
  { id: 'Chat', icon: MessagesSquare, label: 'Chat', component: Chat },
  { id: 'Projects', icon: FolderKanban, label: 'Projects', component: Projects },
  { id: 'Tasks', icon: ListTodo, label: 'Tasks', component: Tasks },
  { id: 'Logs', icon: NotebookText, label: 'Logs', component: Logs },
  { id: 'Integrations', icon: Blocks, label: 'Integrations', component: Integrations },
  { id: 'Calender', icon: Calendar, label: 'Calendar', component: Calender },
  { id: 'Team', icon: Users, label: 'Team', component: Contacts },
];

const routes = {
  Home: Home,
  Execution: Execution,
  Projects: Projects,
  Tasks: Tasks,
  Chat: Chat,
  Team: Contacts,
  Settings: Setting,
  Notifications: Notifications,
  Calender: Calender,
  Analytics: Analytics,
  Logs: Logs,
  Integrations: Integrations,
  Account: Account,
} as const;

type RouteKey = keyof typeof routes;

export default function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { activeTab, setActiveTab } = useApp();
  const [meetingMode, setMeetingMode] = useState<true | false>(false);
  const [theme, setTheme] = useState<'Light' | 'Dark'>('Light');
  const [openProfile, setOpenProfile] = useState(false);


  const isElectron = (window as any).isElectron === true;


  // Get current component based on active tab
  const CurrentComponent = routes[activeTab] || Home;

  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleFocus = () => {
      window.location.reload(); // force full reload
    };

    window.addEventListener("pageshow", handleFocus);

    return () => {
      window.removeEventListener("pageshow", handleFocus);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = () => setOpenProfile(false);
    if (openProfile) {
      window.addEventListener("click", handleClickOutside);
    }
    return () => window.removeEventListener("click", handleClickOutside);
  }, [openProfile]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenFromURL = params.get("token");

    // 🔥 STEP 1: if token comes from backend → save it
    if (tokenFromURL) {
      localStorage.setItem("token", tokenFromURL);
      window.history.replaceState({}, document.title, "/dashboard"); // clean URL
    }

    const token = localStorage.getItem("token");

    if (!token) {
      window.location.replace("/login");
      return;
    }

    // 🔥 STEP 2: fetch user from backend
    fetch("http://localhost:8000/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then((res) => {
        if (!res.ok) throw new Error("Not authenticated");
        return res.json();
      })
      .then((data) => {
        setUser(data);
        setLoading(false);
      })
      .catch(() => {
        localStorage.removeItem("token");
        setLoading(false);
      });

      // 🔥 onboarding check AFTER login confirmed
      fetch("http://localhost:8000/onboarded", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).then((res) => res.json())
        .then((d) => {
          if (!d.onboarded) {
            window.location.replace("/onboarding");
          }
        });

  }, []);

  // 🔄 LOADING
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-xl">
        Loading...
      </div>
    );
  }

  // ❌ NOT LOGGED IN
  if (!user) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-lg">Not logged in</p>
        <a href="/login" className="px-4 py-2 bg-blue-500 text-white rounded">
          Go to Login
        </a>
      </div>
    );
  }

  // 🔥 LOGOUT
  const handleLogout = () => {
    localStorage.removeItem("token");
    if(isElectron)
      window.location.replace("/splash");
    else
      window.location.replace("/");
  };

  const changeMeetingMode = () => {

  };

  const changeTheme = () => {

  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-800 overflow-hidden">
      
      {/* Sidebar */}
      <aside className={cn(
          "bg-white h-full flex flex-col transition-all duration-300 border-r border-slate-200 shadow-sm",
          isSidebarOpen ? "w-60" : "w-16" )}>

        {/* 🔥 LOGO AREA */}
        <div className="h-14 flex items-center justify-center border-b border-slate-100">
          {isSidebarOpen ? (
            <img src="/logo2.png" className="h-6 object-contain" />
          ) : (
            <img src="/favicon.png" className="h-6 object-contain" />
          )}
        </div>

        {/* 🔥 NAV */}
        <div className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center rounded-xl transition-all duration-200",
                activeTab === item.id
                  ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-md"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-800",
                isSidebarOpen 
                  ? "gap-3 px-3 py-2.5" 
                  : "justify-center py-2.5"
              )}>
              <item.icon size={18} />
              {isSidebarOpen && (
                <span className="text-sm font-medium">
                  {item.label}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* 🔥 BOTTOM ACTION */}
        <div className="p-2 border-t border-slate-100">
          <button onClick={() => setActiveTab("Settings")} className={cn(
              "w-full flex items-center rounded-xl transition-all duration-200 rounded-xl text-slate-500 hover:bg-[#eee] hover:text-black",
              isSidebarOpen 
                ? "gap-3 px-3 py-2.5" 
                : "justify-center py-2.5"
            )}>
            <Settings size={18} />
            {isSidebarOpen && <span className="text-sm">Settings</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Header */}
        <header className="h-14 bg-slate-50 flex items-center px-4 sticky top-0 z-10">
         <div className="flex items-center gap-3 min-w-fit">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 "
            >
              <Menu size={20} />
            </button>
            <h1 className="text-base font-semibold text-slate-800 capitalize">{activeTab}</h1>
          </div>

          {/* Search */}
          <div className="flex-1 flex justify-center">
            <div className="hidden md:flex items-center bg-white border border-slate-200 rounded-xl px-4 py-2 w-[420px] shadow-sm focus-within:ring-2 focus-within:ring-violet-500 transition">
              <Search size={16} className="text-slate-400" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="bg-transparent outline-none text-sm ml-2 w-full placeholder:text-slate-400"
              />
            </div>
          </div>
            
          {/* Actions */}
          <div className="flex items-center gap-3 min-w-fit">
            <button onClick={changeMeetingMode} className="flex items-center gap-2 mr-3 px-3 py-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white text-xs font-medium shadow hover:scale-105 transition">
              <Video size={20} />
              <span className="hidden sm:block">Meeting Mode</span>
            </button>
            <button onClick={changeTheme} className="p-1.5 text-slate-500 hover:bg-slate-200 rounded-lg transition">
              <Moon size={18} />
            </button>
            <button onClick={() => setActiveTab("Notifications")} className="relative p-1.5 text-slate-500 hover:bg-slate-200 rounded-lg transition">
              <Bell size={18} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <button onClick={() => setActiveTab("Calender")} className="relative p-1.5 text-slate-500 hover:bg-slate-200 rounded-lg transition">
              <Calendar size={18} />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></span>
            </button>
            
            {/* Profile */}
            <div
              onClick={(e) => {
                e.stopPropagation();
                setOpenProfile(prev => !prev);
              }}
              className="relative group flex items-center gap-3 pl-4 pr-3 ml-2 border border-transparent hover:border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 transition-all duration-200 active:scale-95"
            >
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-700 tracking-tight">Moni Roy</p>
                <p className="text-xs text-slate-500">Admin</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-violet-100 border border-slate-300 overflow-hidden shadow-sm group-hover:shadow-md">
                <img src="https://i.pravatar.cc/150?img=5" alt="Profile" className="w-full h-full object-cover" />
              </div>
              {openProfile && (
                <div className="absolute right-0 top-11 w-full bg-white border border-slate-200 rounded-xl shadow-lg p-1 z-50 animate-in fade-in zoom-in-95">
                  
                  {/* Account */}
                  <button
                    onClick={() => setActiveTab("Account")}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 transition text-sm text-slate-700"
                  >
                    <User size={16} />
                    Account
                  </button>

                  {/* Settings */}
                  <button
                    onClick={() => setActiveTab("Settings")}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 transition text-sm text-slate-700"
                  >
                    <Settings size={16} />
                    Settings
                  </button>

                  <div className="my-1 border-t border-slate-200" />

                  {/* Logout */}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-50 transition text-sm text-red-600"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>

                </div>
              )}
            </div>


          </div>
        </header>

        {/* Dynamic Content - This changes based on sidebar selection */}
        <div className="flex-1 overflow-y-auto">
          <CurrentComponent/>
        </div>
      </main>
    </div>
  );
}