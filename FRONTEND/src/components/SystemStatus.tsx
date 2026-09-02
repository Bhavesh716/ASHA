type Props = {
  status: "running" | "idle" | "paused" | "crashed";
  agents: string;
  task: string;
  completion: string;
  runtime: string;
};

export default function SystemStatus({ status, agents, task, completion, runtime }: Props) {
  const statusConfig = {
    running: {
      label: "SYSTEM RUNNING",
      color: "#22c55e",
      animated: true,
      speed: "4s"
    },

    idle: {
      label: "SYSTEM IDLE",
      color: "#64748b",
      animated: true,
      speed: "12s"
    },

    paused: {
      label: "SYSTEM PAUSED",
      color: "#f97316cc",
      animated: false,
      speed: 0
    },

    crashed: {
      label: "SYSTEM CRASHED",
      color: "#f00",
      animated: false,
      speed: 0
    }
  };

  const config = statusConfig[status];

  return (
    <div className="w-full cursor-pointer group relative">

      {/* STATUS LABEL */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
        <div className="px-4 py-1 rounded-full bg-white shadow-md border border-gray-200">
          <span
            className="text-sm font-semibold tracking-wide"
            style={{ color: config.color }}
          >
            {config.label}
          </span>
        </div>
      </div>

      {/* OUTER BORDER */}
      <div className="relative rounded-2xl p-[4px] overflow-hidden">

        {/* BORDER */}
        <div
          className="absolute inset-0 rounded-2xl"
          style={
            config.animated
              ? {
                  background: `linear-gradient(90deg, transparent, ${config.color}, transparent)`,
                  backgroundSize: "200% 100%",
                  animation: `flowBorder ${config.speed} linear infinite`
                }
              : {
                  background: config.color // 🔥 SOLID BORDER
                }
          }
        />

        {/* INNER */}
        <div className="relative rounded-2xl overflow-hidden">

          <div className="grid grid-cols-4 divide-x divide-black/10">

            {/* SECTION 1 */}
            <div className="py-6 text-center bg-emerald-50">
              <div className="text-2xl font-bold text-emerald-700">
                {agents}
              </div>
              <div className="text-sm text-gray-700 mt-1 font-medium">
                Active Agents
              </div>
            </div>

            {/* SECTION 2 */}
            <div className="py-6 text-center bg-blue-50">
              <div className="text-xl font-bold text-blue-700 truncate">
                {task}
              </div>
              <div className="text-sm text-gray-700 mt-1 font-medium">
                Executing
              </div>
            </div>

            {/* SECTION 3 */}
            <div className="py-6 text-center bg-purple-50">
              <div className="text-2xl font-bold text-purple-700">
                {completion}
              </div>
              <div className="text-sm text-gray-700 mt-1 font-medium">
                Estimated Completion Time
              </div>
            </div>

            {/* SECTION 4 */}
            <div className="py-6 text-center bg-orange-50">
              <div className="text-2xl font-bold text-orange-700">
                {runtime}
              </div>
              <div className="text-sm text-gray-700 mt-1 font-medium">
                Running Time
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ANIMATION */}
      <style>
        {`
          @keyframes flowBorder {
            0% { background-position: 200% 0%; }
            100% { background-position: -200% 0%; }
          }
        `}
      </style>
    </div>
  );
}