"use client";

import { startTransition, useActionState, useState } from "react";
import Link from "next/link";
import { importProducts, type ImportState } from "@/app/actions/admin";
import { formatPaise } from "@/lib/money";

export function ImportForm() {
  const [state, action, pending] = useActionState<ImportState, FormData>(importProducts, {});
  const [file, setFile] = useState<File | null>(null);
  const canCommit = !!file && state.mode === "preview" && !state.errors?.length && (state.valid ?? 0) > 0;
  const submit = (commit: boolean) => {
    if (!file) return;
    const fd = new FormData();
    fd.set("file", file);
    fd.set("commit", commit ? "1" : "0");
    startTransition(() => action(fd));
  };

  return (
    <div className="space-y-6">
      <form onSubmit={(e) => (e.preventDefault(), submit(false))} className="rounded-2xl border border-sand bg-white p-5 sm:p-6">
        <label htmlFor="csv" className="field-label">
          CSV file (max 2 MB, 2,000 rows)
        </label>
        <input id="csv" name="file" type="file" accept=".csv,text/csv" required onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="field file:mr-4 file:rounded-full file:border-0 file:bg-cream file:px-4 file:py-1.5 file:text-sm" />
        <div className="mt-4 flex flex-wrap gap-3">
          <button type="submit" disabled={pending || !file} className="btn btn-outline">
            {pending ? "Checking…" : "1. Upload & preview"}
          </button>
          <button type="button" onClick={() => submit(true)} disabled={pending || !canCommit} className="btn btn-primary">
            2. Confirm import
          </button>
        </div>
        <p className="mt-2 text-xs text-stone">Preview first — nothing is saved until you confirm.</p>
      </form>

      {state.message && (
        <p role="alert" className="rounded-xl bg-danger/10 px-4 py-3 text-sm font-medium text-danger">
          {state.message}
        </p>
      )}

      {state.mode === "done" && (
        <div role="status" className="rounded-2xl border border-success/30 bg-success/10 p-5 text-success">
          <p className="text-lg font-semibold">
            Import complete: {state.creates} created, {state.updates} updated.
          </p>
          <Link href="/admin/products" className="mt-2 inline-block text-sm underline">
            Review products →
          </Link>
        </div>
      )}

      {state.mode === "preview" && (
        <div className="rounded-2xl border border-sand bg-white p-5 sm:p-6">
          <h2 className="text-2xl">Preview</h2>
          <p className="mt-1 text-sm text-stone">
            {state.total} rows · <strong className="text-success">{state.valid} valid</strong> ({state.creates} new, {state.updates} updates) ·{" "}
            <strong className={state.errors?.length ? "text-danger" : ""}>{state.errors?.length ?? 0} with errors</strong>
          </p>
          {!!state.errors?.length && (
            <ul className="mt-4 max-h-80 space-y-2 overflow-y-auto rounded-xl bg-danger/5 p-4 text-sm">
              {state.errors.map((e) => (
                <li key={`${e.line}-${e.name}`}>
                  <strong>Row {e.line}</strong>
                  {e.name && <span className="text-stone"> ({e.name})</span>}: {e.errors.join("; ")}
                </li>
              ))}
            </ul>
          )}
          {!!state.sample?.length && (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[40rem] text-sm">
                <thead className="text-left text-xs uppercase tracking-wider text-stone">
                  <tr>
                    <th className="py-2">Row</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sand">
                  {state.sample.map((r) => (
                    <tr key={r.line}>
                      <td className="py-2 text-stone">{r.line}</td>
                      <td>{r.name}</td>
                      <td>{r.category}</td>
                      <td>
                        {formatPaise(r.price)}
                        {r.unit === "metre" ? "/m" : ""}
                      </td>
                      <td>{r.stock}</td>
                      <td>{r.isNew ? "Create" : "Update"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {(state.valid ?? 0) > 25 && <p className="mt-2 text-xs text-stone">Showing first 25 valid rows.</p>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
