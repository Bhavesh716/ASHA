import React, { useState , useEffect } from 'react';
import { useApp } from "@/context/AppContext";
import {
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  ChevronRight,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import SystemStatus from "@/components/SystemStatus";

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

type Status = "running" | "idle" | "paused" | "crashed";

type HomeProps = {
  setActiveTab: (tab: RouteKey) => void;
};

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

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

const taskData = [
  { name: 'Task1', value: 70 },
  { name: 'Task2', value: 30 },
];

const goslData = [
  { name: 'Goal - 1', value: 70 },
  { name: 'Goal - 2', value: 30 },
];

const trendData = [
  { value: 10 }, { value: 25 }, { value: 15 }, { value: 30 }, { value: 20 }, { value: 35 },
];

// Compact Stat Card
const StatCard = ({ title, value, trend, trendUp, chartType = 'bar', color = 'violet' }: any) => {
  const colorClasses = {
    violet: 'text-violet-600',
    pink: 'text-pink-500',
    emerald: 'text-emerald-500',
  };

  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-slate-600 font-medium text-xs font-medium mb-1">{title}</h3>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-slate-900 tracking-tight">{value}</span>
            {trend && (
              <span className={cn("text-[10px] font-medium flex items-center", trendUp ? "text-emerald-500" : "text-red-500")}>
                {trendUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {trend}
              </span>
            )}
          </div>
        </div>
        {chartType === 'bar' && (
          <div className="flex items-end gap-0.5 h-6">
            {[40, 70, 50, 90, 60].map((h, i) => (
              <div key={i} className="w-1 bg-violet-200 rounded-full" style={{ height: `${h}%` }} />
            ))}
          </div>
        )}
        {chartType === 'line' && (
          <div className="h-6 w-12">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <Area type="monotone" dataKey="value" stroke={color === 'violet' ? "#7c3aed" : "#ec4899"} fill={color === 'violet' ? "#ddd6fe" : "#fce7f3"} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};


export default function Home() {
  const [statusData, setStatusData] = useState<{
    status: Status;
    agents: string;
    task: string;
    completion: string;
    runtime: string;
  }>({
    status: "running",
    agents: "2",
    task: "Follow up protocol",
    completion: "3m",
    runtime: "12h 23m"
  });

  const tasks = [
    {
      title: "Finalize Q2 AI Deployment Plan",
      desc: "Align all agents and finalize rollout strategy",
      deadline: "Today, 6PM",
      user: "Assigned by : Rahul Dev (CTO)",
      priority: "HIGH",
      color: "from-red-50 to-pink-50",
      tab: "Today"
    },
    {
      title: "Fix Payment Gateway Failures",
      desc: "Stripe API timeout causing checkout issues",
      deadline: "EOD",
      user: "Assigned by : KYRON",
      priority: "URGENT",
      color: "from-violet-50 to-indigo-50",
      tab: "Today"
    },
    {
      title: "Improve Dashboard Performance",
      desc: "Reduce load time below 1.5s",
      deadline: "This Weekend",
      user: "Assigned by : Dev Team",
      priority: "MEDIUM",
      color: "from-emerald-50 to-green-50",
      tab: "This Week"
    },
    {
      title: "Client Meeting Preparation",
      desc: "Prepare pitch for enterprise onboarding",
      deadline: "Next Friday",
      user: "Assigned by : Sales Team",
      priority: "MEDIUM",
      color: "from-emerald-50 to-green-50",
      tab: "This Month"
    }
  ];
  
  const [projectIndex, setProjectIndex] = useState(0);

  const projects = [
    {
      name: "AI Fraud Detection System",
      desc: "Real-time phishing + fraud detection pipeline",
      progress: 72,
      insights: [
        "All modules on track",
        "Detection accuracy improved by 8%",
        "No deadline risks detected"
      ]
    },
    {
      name: "KYRON Automation Engine",
      desc: "Workflow execution & orchestration system",
      progress: 54,
      insights: [
        "2 agents pending integration",
        "Latency reduced by 20%",
        "Deployment expected this week"
      ]
    },
    {
      name: "Enterprise Dashboard",
      desc: "Analytics & monitoring UI system",
      progress: 88,
      insights: [
        "UI finalized",
        "Performance optimized",
        "Ready for release"
      ]
    }
  ];

  const radius = 50;
  const stroke = 10;
  const normalizedRadius = radius - stroke * 0.5;
  const circumference = normalizedRadius * 2 * Math.PI;
  const progress = projects[projectIndex].progress;
  const strokeDashoffset = circumference - (progress / 100) * circumference;


  const [animatedProgress, setAnimatedProgress] = useState(0);

  useEffect(() => {
    setAnimatedProgress(0);

    const target = projects[projectIndex].progress;
    let current = 0;

    const interval = setInterval(() => {
      current += 2;
      if (current >= target) {
        current = target;
        clearInterval(interval);
      }
      setAnimatedProgress(current);
    }, 0);

    return () => clearInterval(interval);
  }, [projectIndex]);

  
  const { setActiveTab, setSelectedProject , setSelectedTask} = useApp();

  /*useEffect(() => {
    const eventSource = new EventSource("http://localhost:3000/stream");

    eventSource.onmessage = (event) => {
      const incoming = JSON.parse(event.data);
      setStatusData(incoming); // 🔥 THIS updates UI
    };

    return () => eventSource.close();
  }, []);*/

  const [toDoActiveTab, setToDoActiveTab] = useState('Today');

  return (
    <div className="p-7">
      <div onClick={() => setActiveTab("Execution")}>
        <SystemStatus
          status={statusData.status} agents={statusData.agents} task={statusData.task} completion={statusData.completion} runtime={statusData.runtime}
        />
      </div>


      <div className="mt-10 max-w-7xl mx-auto space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4"  onClick={() => setActiveTab("Analytics")}>
          <StatCard title="Total Clients" value="68" trend="+0.5%" trendUp={true} chartType="bar" />
          <StatCard title="Active Now" value="42" trend="76 left" chartType="none" color="pink" />
          <StatCard title="Total Revenue" value="$562" trend="-2%" trendUp={false} chartType="line" />
          <StatCard title="New Projects" value="892" trend="+2%" trendUp={true} chartType="line" color="pink" />
        </div>

        {/* To-do and notifications */}

        <div className="grid grid-cols-5 gap-6 h-[400px]">
          {/* LEFT — TODO */}
          <div className="col-span-3 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col h-full overflow-hidden">
            {/* HEADER */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">To-Do</h3>

              <div className="flex bg-slate-100 p-0.5 rounded-lg">
                {['Today', 'This Week', 'This Month'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setToDoActiveTab(tab)}
                    className={cn(
                      "px-3 py-1 rounded-md text-xs font-medium transition",
                      toDoActiveTab === tab
                        ? "bg-violet-600 text-white shadow-sm"
                        : "text-slate-600 font-medium hover:text-slate-700"
                    )}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* TASKS */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-hide">

              {tasks
                .filter(task => task.tab === toDoActiveTab).map((task, i) => (

                <div
                  key={i}
                  className={`p-4 rounded-xl border border-slate-100 shadow-sm bg-gradient-to-r ${task.color}
                  hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer`}
                  onClick={() => {
                      setSelectedTask(task);
                      setActiveTab("Tasks");
                    }}
                >

                  {/* TOP */}
                  <div className="flex justify-between items-start">

                    <div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/70 text-slate-700 font-semibold">
                        {task.priority}
                      </span>
                    </div>


                    <div className="flex items-center gap-2 group" onClick={(e) => e.stopPropagation()}>
                      <span className="text-[11px] text-slate-500 text-[10px] font-medium">
                        Mark done
                      </span> 

                      <input
                        type="checkbox"
                        className="w-5 h-5 justify-center accent-violet-600 cursor-pointer"
                      />
                    </div>

                  </div>

                  {/* TITLE */}
                  <h4 className="font-semibold text-slate-900 tracking-tight text-sm mt-2">
                    {task.title}
                  </h4>

                  {/* DESC */}
                  <p className="text-xs text-slate-600 font-medium mt-1">
                    {task.desc}
                  </p>

                  {/* FOOTER */}
                  <div className="flex justify-between items-center mt-3">

                    <span className="text-xs font-semibold text-red-500">
                      Deadline: {task.deadline}
                    </span>

                    <span className="text-[11px] text-slate-600 font-medium">
                      {task.user}
                    </span>
                  </div>
                </div>

              ))}

            </div>
          </div>

          {/* RIGHT — INSIGHTS */}
          <div className="col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col h-full overflow-hidden">

            {/* HEADER */}
            <div className="p-5 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Business Insights
              </h3>
            </div>

            {/* INSIGHTS */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-hide">

              {/* SYSTEM STABLE */}
              <div className="p-4 rounded-xl bg-green-50 border border-green-100">
                <h4 className="text-sm font-semibold text-green-600">Workflow Stable</h4>
                <p className="text-xs text-green-500 mt-1">
                  All tasks expected to complete before deadline
                </p>
              </div>

              {/* REVENUE ALERT */}
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-100">
                <h4 className="text-sm font-semibold text-amber-600">Revenue Drop</h4>
                <p className="text-xs text-amber-500 mt-1">
                  Conversion rate dropped 12% in last 24h (checkout issue suspected)
                </p>
              </div>

              {/* SYSTEM INFO */}
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
                <h4 className="text-sm font-semibold text-blue-600">KYRON</h4>
                <p className="text-xs text-blue-500 mt-1">
                  New fraud detection agent deployed successfully
                </p>
              </div>

              {/* BUSINESS INSIGHT 1 */}
              <div className="p-4 rounded-xl bg-violet-50 border border-violet-100">
                <h4 className="text-sm font-semibold text-violet-600">User Insight</h4>
                <p className="text-xs text-violet-500 mt-1">
                  68% users drop off at payment step — UX improvement needed
                </p>
              </div>

              {/* BUSINESS INSIGHT 2 */}
              <div className="p-4 rounded-xl bg-cyan-50 border border-cyan-100">
                <h4 className="text-sm font-semibold text-cyan-600">Growth Opportunity</h4>
                <p className="text-xs text-cyan-500 mt-1">
                  Traffic increased 22% from organic search this week
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>





      <div className="grid mt-10 grid-cols-2 gap-6 h-[420px]">

        {/* LEFT — PROJECTS */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col overflow-hidden transition-all duration-300 hover:scale-[1.01]">

          {/* HEADER */}
          <div className="p-5 border-b border-slate-100 flex justify-between items-center">
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Ongoing Projects
            </h3>

            <div className="flex gap-2">
              <button
                onClick={() => setProjectIndex((prev) => (prev - 1 + projects.length) % projects.length)}
                className="px-3 py-1.5 rounded-md bg-slate-100 text-slate-600 hover:bg-slate-200 transition text-sm"
              >
                <ChevronRight size={16} className="rotate-180" />
              </button>
              <button
                onClick={() => setProjectIndex((prev) => (prev + 1) % projects.length)}
                className="px-3 py-1.5 rounded-md bg-slate-100 text-slate-600 hover:bg-slate-200 transition text-sm"
              >
                <ChevronRight size={16}/>
              </button>
            </div>
          </div>

          {/* CONTENT */}
          <div className="flex-1 p-6 flex flex-col justify-between cursor-pointer"
              onClick={() => {
                setSelectedProject(projects[projectIndex]);
                setActiveTab("Projects");
              }}>

            {/* PROJECT INFO */}
            <div>
              <h4 className="text-lg font-semibold text-slate-900">
                {projects[projectIndex].name}
              </h4>

              <p className="text-sm text-slate-600 mt-1">
                {projects[projectIndex].desc}
              </p>
            </div>

            {/* PROGRESS */}
            <div className="flex items-center justify-center my-4 relative">
              <svg height={140} width={140}>
                <circle
                  stroke="#e2e8f0"
                  fill="transparent"
                  strokeWidth={10}
                  r={55}
                  cx="70"
                  cy="70"
                />

                <circle
                  stroke="#7c3aed"
                  fill="transparent"
                  strokeWidth={10}
                  strokeLinecap="round"
                  strokeDasharray={345}
                  strokeDashoffset={345 - (animatedProgress / 100) * 345}
                  r={55}
                  cx="70"
                  cy="70"
                  transform="rotate(-90 70 70)"
                  className="transition-all duration-300"
                />
              </svg>

              {/* PERFECT CENTER */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-slate-900">
                  {animatedProgress}%
                </span>
                <span className="text-xs text-slate-500">
                  Progress
                </span>
              </div>
            </div>

            {/* INSIGHTS */}
            <div className="space-y-2">
              {projects[projectIndex].insights.map((insight, i) => (
                <div key={i} className="text-sm text-slate-700 font-medium">
                  • {insight}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT — SYSTEM LOGS */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col overflow-hidden">

          {/* HEADER */}
          <div className="p-5 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              System Logs
            </h3>
          </div>

          {/* LOGS */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-hide text-sm cursor-pointer" onClick={() => setActiveTab("Logs")}>
            {[
              "10:32:01  INFO     Agent initialized",
              "10:32:05  SUCCESS  Fraud model updated",
              "10:32:09  WARN     Latency spike EU region",
              "10:32:12  ERROR    Payment API timeout",
              "10:32:18  INFO     Session started",
              "10:32:25  SUCCESS  Jobs completed",
              "10:32:31  INFO     Cache refreshed",
              "10:32:40  WARN     Memory usage high",
              "10:32:52  INFO     Auto-retry triggered",
              "10:32:25  SUCCESS  Jobs completed",
              "10:32:31  INFO     Cache refreshed",
              "10:32:40  WARN     Memory usage high",
              "10:32:52  INFO     Auto-retry triggered",
              "10:33:01  SUCCESS  System stabilized"
            ].map((log, i) => (
              <div
                key={i}
                className="flex gap-3 font-mono text-[13px] text-slate-700 border-b border-slate-100 pb-1"
              >
                <span className="text-slate-400">{log.slice(0, 8)}</span>
                <span className="font-semibold">{log.slice(10, 17)}</span>
                <span className="flex-1">{log.slice(18)}</span>
              </div>
            ))}

          </div>
        </div>

      </div>    

    </div>
  );
}