/*
5 MIN CLICK CHALLENGE
Next.js (App Router) single-page version
Optional Supabase integration for global stats
*/

"use client";

import React, { useEffect, useRef, useState } from "react";

// -------------------------
// OPTIONAL SUPABASE SETUP
// -------------------------
// Create a Supabase project and add env vars:
// NEXT_PUBLIC_SUPABASE_URL
// NEXT_PUBLIC_SUPABASE_ANON_KEY
//
// Table: clicks
// columns:
// id (uuid), result (text), created_at (timestamp)

let supabase = null;

async function initSupabase() {
  if (typeof window === "undefined") return null;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL=https://soumctoxztsffdxpqyic.supabase.co;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_EPv42jPFY4KG3iVTPoe2aQ_IpXSuClh;

  if (!url || !key) return null;

  const { createClient } = await import("@supabase/supabase-js");
  return createClient(url, key);
}

// -------------------------

export default function FiveMinChallenge() {
  const [stage, setStage] = useState("idle"); // idle | running | result
  const [timeLeft, setTimeLeft] = useState(300);
  const [result, setResult] = useState(null); // pass | fail
  const [stats, setStats] = useState({ pass: 0, fail: 0 });
  const intervalRef = useRef(null);
  const endTimeRef = useRef(null);

  // start game
  const startGame = () => {
    setStage("running");
    setResult(null);

    const endTime = Date.now() + 5 * 60 * 1000;
    endTimeRef.current = endTime;

    intervalRef.current = setInterval(() => {
      const diff = Math.max(0, endTime - Date.now());
      setTimeLeft(Math.ceil(diff / 1000));

      if (diff <= 0) {
        clearInterval(intervalRef.current);
      }
    }, 200);
  };

  // handle click
  const handleClick = async () => {
    if (stage !== "running") return;

    const now = Date.now();

    let res;
    if (now < endTimeRef.current) {
      res = "fail";
    } else {
      res = "pass";
    }

    setResult(res);
    setStage("result");

    clearInterval(intervalRef.current);

    // save to backend (optional)
    try {
      const client = await initSupabase();
      if (client) {
        await client.from("clicks").insert([{ result: res }]);

        const { data } = await client.from("clicks").select("result");

        const pass = data.filter((d) => d.result === "pass").length;
        const fail = data.filter((d) => d.result === "fail").length;

        setStats({ pass, fail });
      } else {
        // fallback local stats
        const local = JSON.parse(localStorage.getItem("stats") || "{pass:0,fail:0}");
        local[res] += 1;
        localStorage.setItem("stats", JSON.stringify(local));
        setStats(local);
      }
    } catch (e) {
      console.log(e);
    }
  };

  const reset = () => {
    setStage("idle");
    setTimeLeft(300);
    setResult(null);
  };

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-black text-white">
      <div className="text-center space-y-6 max-w-md">
        <h1 className="text-4xl font-bold">5 Minute Click Challenge</h1>

        {stage === "idle" && (
          <button
            onClick={startGame}
            className="px-8 py-4 bg-white text-black rounded-2xl font-bold hover:scale-105 transition"
          >
            Start Challenge
          </button>
        )}

        {stage === "running" && (
          <>
            <div className="text-6xl font-mono">
              {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
            </div>

            <button
              onClick={handleClick}
              className="px-10 py-5 bg-red-600 rounded-2xl font-bold text-xl hover:scale-105 transition"
            >
              CLICK
            </button>

            <p className="opacity-60">Do NOT click before time is up</p>
          </>
        )}

        {stage === "result" && (
          <>
            <h2 className="text-3xl font-bold">
              {result === "pass" ? "You waited." : "You failed."}
            </h2>

            <div className="text-lg opacity-80">
              <p>Global results:</p>
              <p>Pass: {stats.pass}</p>
              <p>Fail: {stats.fail}</p>
            </div>

            <button
              onClick={reset}
              className="px-6 py-3 bg-white text-black rounded-xl font-bold"
            >
              Try Again
            </button>
          </>
        )}
      </div>
    </div>
  );
}
