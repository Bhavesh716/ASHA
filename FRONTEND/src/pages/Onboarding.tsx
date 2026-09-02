import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [mode, setMode] = useState<"create" | "join" | null>(null);
  const [form, setForm] = useState<any>({});
  const [codeArr, setCodeArr] = useState(["", "", "", "", "", ""]);
  const [status, setStatus] = useState<"idle" | "waiting" | "approved" | "rejected" | "loading">("idle");
  const [showConfirm, setShowConfirm] = useState(false);
  const [companyPreview, setCompanyPreview] = useState<any>(null);

  const code = codeArr.join("");

  useEffect(() => {
    if (code.length !== 6) return;

    const token = localStorage.getItem("token");

    fetch("http://localhost:8000/company/preview", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ code }),
    })
      .then(res => res.json())
      .then(data => {
        setCompanyPreview(data);
      })
      .catch(() => {
        setCompanyPreview(null);
      });

  }, [code]);


  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      window.location.replace("/login");
      return;
    }

    fetch("http://localhost:8000/onboarded", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {

        if (data.onboarded) {
          window.location.href = "/dashboard";
          return;
        }

        return fetch("http://localhost:8000/company/request/status", {
          headers: { Authorization: `Bearer ${token}` },
        });
      })
      .then(res => res?.json())
      .then(req => {

        if (!req || !req.status) return;

        setCompanyPreview(req);
        setMode("join");
        setStep(1);

        if (req.status === "PENDING") {
          setStatus("waiting");
        }

        if (req.status === "ACCEPTED") {
          setStatus("approved");
        }

        if (req.status === "REJECTED") {
          setStatus("rejected");
        }

      });

  }, []);

  useEffect(() => {
    if (status !== "approved") return;

    const timer1 = setTimeout(() => {
      setStatus("loading");
    }, 1500);

    const timer2 = setTimeout(() => {
      window.location.href = "/dashboard";
    }, 2000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [status]);

  const industries = [
    "SaaS","AI","FinTech","EdTech","Healthcare","E-commerce",
    "Manufacturing","Gaming","Web3","Logistics","Consulting"
  ];

  const teamSizes = [
    "1-50","50-100","100-250","250-500","500-1000","1000+"
  ];

  const handleCodeChange = (val: string, i: number) => {
    if (!/^[A-Za-z0-9]?$/.test(val)) return;

    const updated = [...codeArr];
    updated[i] = val.toUpperCase();
    setCodeArr(updated);

    const next = document.getElementById(`code-${i+1}`);
    if (val && next) (next as HTMLInputElement).focus();
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-[#f8fafc] to-[#eef2ff]">

      {/* LEFT */}
      <div className="w-full lg:w-[60%] px-16 py-14 flex flex-col justify-center">

        {/* HEADER */}
        <div className="mb-10">
          <img src="/logo.png" className="h-10 mb-4" />
          <h1 className="text-4xl font-bold text-gray-900">
            Set up KYRON 
          </h1>
          <p className="text-gray-500 mt-2">
            Help us tailor the experience explicitly for you 
          </p>
        </div>

        <motion.div
          key={step + mode + status}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-lg space-y-6"
        >

          {/* STEP 0 */}
          {step === 0 && (
            <>
              <button
                onClick={() => { setMode("create"); setStep(1); }}
                className="w-full p-5 rounded-xl bg-black text-white text-lg hover:scale-[1.02] transition"
              >
                Create Company
              </button>

              <button
                onClick={() => { setMode("join"); setStep(1); }}
                className="w-full p-5 rounded-xl border text-lg hover:bg-gray-50 transition"
              >
                Join Existing Company
              </button>
            </>
          )}

          {/* CREATE */}
          {mode === "create" && step === 1 && status === "idle" && (
            <>
              <input
                placeholder="Company Name"
                className="w-full p-4 rounded-xl border text-lg"
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />

              <select
                className="w-full p-4 rounded-xl border text-lg"
                onChange={(e) => setForm({ ...form, bucket: e.target.value })}
              >
                <option>Industry</option>
                {industries.map(i => <option key={i}>{i}</option>)}
              </select>

              <select
                className="w-full p-4 rounded-xl border text-lg"
                onChange={(e) => setForm({ ...form, team: e.target.value })}
              >
                <option>Team Size</option>
                {teamSizes.map(t => <option key={t}>{t}</option>)}
              </select>

              <button
                onClick={async () => {
                  const token = localStorage.getItem("token");

                  const res = await fetch("http://localhost:8000/company/create", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                      companyName: form.name,
                      bucket: form.bucket,
                      teamSize: form.team,
                    }),
                  });

                  if (res.ok) {
                    setStatus("loading");
                    setTimeout(() => window.location.href="/dashboard",2000);
                  }
                }}
                className="w-full p-5 rounded-xl bg-blue-600 text-white text-lg hover:scale-[1.02]"
              >
                Launch Company
              </button>
            </>
          )}

          {/* JOIN */}
          {mode === "join" && step === 1 && status === "idle" && (
            <>
              <p className="text-gray-500 text-sm">
                Enter the 6-digit company code provided by your admin
              </p>

              <div className="flex items-center gap-2 justify-center">
                {codeArr.map((c, i) => (
                  <>
                    {i === 3 && <span className="text-xl">-</span>}
                    <input
                      key={i}
                      id={`code-${i}`}
                      value={c}
                      maxLength={1}
                      onChange={(e) => handleCodeChange(e.target.value, i)}
                      className="w-12 h-14 text-center text-xl border rounded-lg"
                    />
                  </>
                ))}
              </div>

              <button
                onClick={async () => {
                  const token = localStorage.getItem("token");

                  const res = await fetch("http://localhost:8000/company/join", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ code }),
                  });

                  if (res.ok) setStatus("waiting");
                }}
                className="w-full p-5 rounded-xl bg-black text-white text-lg"
              >
                Request Access
              </button>
            </>
          )}

          {/*LOADING*/}
          {status === "loading" && (
            <div className="flex flex-col items-center justify-center text-center mt-10 space-y-6">

              {/* SPINNER */}
              <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>

              <h2 className="text-xl font-semibold">
                Preparing your dashboard
              </h2>

              <p className="text-gray-500 text-sm">
                KYRON is initializing your workspace and execution engine
              </p>

            </div>
          )}


          {/*APPROVED*/}
          {status === "approved" && (
            <div className="flex flex-col items-center justify-center text-center mt-10 space-y-6">

              {/* BIG TICK ANIMATION */}
              <div className="relative w-24 h-24">

                {/* Circle */}
                <div className="absolute inset-0 rounded-full border-4 border-green-500 animate-scaleIn"></div>

                {/* Tick */}
                <svg
                  className="w-24 h-24 text-green-500 animate-drawTick"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M5 13l4 4L19 7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <h2 className="text-2xl font-semibold text-green-600">
                Application Approved
              </h2>
            </div>
          )}

          {/* WAITING */}
          {status === "waiting" && (
            <div className="space-y-6">

              {/* HEADER */}
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-semibold">
                  Waiting for Approval
                </h2>

                {/* MODERN LOADER */}
                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>

              {/* COMPANY CARD */}
              <div className="p-6 rounded-2xl bg-white shadow-sm border flex items-center justify-between">

                <div>
                  <p className="text-lg font-semibold text-gray-900">
                    {companyPreview?.companyName || "Validating..."}
                  </p>

                  <p className="text-sm text-gray-500 mt-1">
                    {companyPreview
                      ? `${companyPreview.employees} employees`
                      : "Checking company..."}
                  </p>
                </div>

                {/* subtle status */}
                <div className="text-sm text-blue-500 font-medium">
                  Pending
                </div>
              </div>

              {/* ACTION */}
              <button
                onClick={() => setShowConfirm(true)}
                className="w-full py-4 rounded-xl bg-red-100 text-red-600 font-medium hover:bg-red-500 hover:text-white transition"
              >
                Revoke Application
              </button>

            </div>
          )}

          {/*Rejected*/}
          {status === "rejected" && (
            <div className="space-y-6">

              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-semibold text-red-600">
                  Application Rejected
                </h2>
              </div>

              <div className="p-6 rounded-2xl bg-white shadow-sm border">

                <p className="text-lg font-semibold text-gray-900">
                  {companyPreview?.companyName}
                </p>

                <p className="text-sm text-gray-500 mt-1">
                  {companyPreview?.employees} employees
                </p>

                <div className="mt-4 text-sm text-red-500">
                  Your request was not approved by the admin
                </div>
              </div>

              <button
                onClick={() => {
                  setStatus("idle");
                  setStep(0);
                  setMode(null);
                  setCompanyPreview(null);
                }}
                className="w-full py-4 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
              >
                Go Back
              </button>

            </div>
          )}
        </motion.div>
      </div>

      {/* RIGHT */}
      <div className="hidden lg:block w-[40%] relative">
        <img src="/onboarding.png" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/10" />
      </div>

      {/* CONFIRM MODAL */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl max-w-sm w-full space-y-4">
            <h3 className="text-lg font-semibold">Revoke Request?</h3>
            <p className="text-sm text-gray-500">
              You won’t be able to send another request for 7 days
            </p>

            <div className="flex justify-end gap-3">
              <button onClick={() => setShowConfirm(false)}>Cancel</button>
              <button onClick={async () => {
                  const token = localStorage.getItem("token");

                  await fetch("http://localhost:8000/company/join/revoke", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ code }),
                  });

                  setShowConfirm(false);
                  setStatus("idle");
                  setStep(0);
                  setMode(null);
                }}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
              >
                Revoke
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}