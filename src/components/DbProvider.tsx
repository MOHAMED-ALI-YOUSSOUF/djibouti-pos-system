"use client";

import { useEffect } from "react";
import { db } from "@/lib/db";

export default function DbProvider() {
  useEffect(() => {
    // expose db for debug
    // @ts-ignore
    window.db = db;

    console.log("✅ Dexie PosDB initialized", db);
  }, []);

  return null;
}
