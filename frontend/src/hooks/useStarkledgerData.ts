/* eslint-disable @typescript-eslint/no-explicit-any */
// src/hooks/useStarkledgerData.ts
"use client";

import { useEffect, useState } from "react";
import Papa from "papaparse";

export type Row = Record<string, any>;

export function useStarkledgerData(csvPath = "/data/starkledger_financial_dataset.csv") {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    Papa.parse<Row>(csvPath, {
      download: true,
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (res) => {
        setRows(Array.isArray(res.data) ? res.data : []);
        setLoading(false);
      },
      error: (err) => {
        setError(err.message || "Failed to parse CSV");
        setLoading(false);
      },
    });
  }, [csvPath]);

  return { rows, loading, error };
}
