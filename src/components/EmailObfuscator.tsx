"use client";

import { useEffect } from "react";

export default function EmailObfuscator() {
  useEffect(() => {
    const el = document.getElementById("email-link");
    if (el) {
      const u = "info";
      const d = "neckarshore.ai";
      el.setAttribute("href", `mailto:${u}@${d}`);
      el.textContent = `${u}@${d}`;
    }
  }, []);

  return null;
}
