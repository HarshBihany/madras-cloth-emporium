import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { CSV_COLUMNS, CSV_TEMPLATE_ROWS, toCsv } from "@/lib/csv";

export async function GET() {
  if (!(await getSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const csv = toCsv(CSV_TEMPLATE_ROWS, CSV_COLUMNS);
  return new NextResponse("﻿" + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="mce-product-import-template.csv"',
      "Cache-Control": "no-store",
    },
  });
}
