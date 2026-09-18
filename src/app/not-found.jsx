import Link from "next/link";
import { SearchX, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[75vh] px-4 text-center">
      <div className="mb-8 rounded-full bg-slate-50 p-6 shadow-sm border border-slate-100">
        <SearchX className="h-16 w-16 text-slate-400" strokeWidth={1.5} />
      </div>
      <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 mb-4">
        Page not found
      </h1>
      <p className="text-lg text-slate-500 max-w-md mx-auto mb-8">
        Sorry, we couldn't find the page you're looking for. It might have been removed, renamed, or didn't exist in the first place.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 rounded-xl bg-[#0D382B] px-6 py-3 text-sm font-bold text-white shadow-sm hover:bg-[#0D382B]/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D382B]/20"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Home
      </Link>
    </div>
  );
}
