"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PortalLogin() {
  const router = useRouter();

  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();

    setLoading(true);

    try {
      const res = await fetch("/api/portal/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          login,
          password,
        }),
      });

      const data = await res.json();

      if (!data.ok) {
        alert(data.error || "Login Failed");
        setLoading(false);
        return;
      }

      localStorage.setItem("portalToken", data.token);

      router.push("/portal/super-admin");
    } catch (err) {
      alert("Server Error");
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-5">
      <div className="w-full max-w-md bg-white rounded-xl shadow-xl p-8">

        <h1 className="text-3xl font-bold text-center text-blue-700">
          Assam Goods Carrier
        </h1>

        <p className="text-center text-gray-500 mt-2">
          API Portal Login
        </p>

        <form onSubmit={handleLogin} className="mt-8 space-y-4">

          <input
            type="text"
            placeholder="Username or Email"
            value={login}
            onChange={(e)=>setLogin(e.target.value)}
            className="w-full border rounded-lg p-3"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
            className="w-full border rounded-lg p-3"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-700 text-white rounded-lg p-3 font-semibold"
          >
            {loading ? "Signing In..." : "Portal Login"}
          </button>

        </form>

      </div>
    </div>
  );
}