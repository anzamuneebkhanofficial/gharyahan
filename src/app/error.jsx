"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import Button from "../components/ui/Button";

export default function Error({ error, reset }) {
  useEffect(() => {
    // Log the error to an error reporting service if needed
    console.error("Unhandled Global Error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[75vh] px-4 text-center">
      <div className="mb-8 rounded-full bg-rose-50 p-6 shadow-sm border border-rose-100">
        <AlertTriangle className="h-16 w-16 text-rose-500" strokeWidth={1.5} />
      </div>
      <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 mb-4">
        Something went wrong
      </h1>
      <p className="text-lg text-slate-500 max-w-md mx-auto mb-8">
        We hit a snag while trying to process your request. Don't worry, this happens sometimes. Let's try that again.
      </p>
      <Button
        onClick={() => reset()}
        variant="primary"
        size="lg"
        className="gap-2 bg-[#0D382B] shadow-sm hover:bg-[#0D382B]/90"
      >
        <RotateCcw className="h-4 w-4" />
        Try again
      </Button>
    </div>
  );
}
