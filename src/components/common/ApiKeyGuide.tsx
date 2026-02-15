import { vi } from "../../i18n/vi";

export default function ApiKeyGuide() {
  const g = vi.apiKey.guide;

  return (
    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
      <h3 className="font-semibold text-blue-800 text-sm mb-3">{g.title}</h3>
      <ol className="space-y-2 text-sm text-blue-700">
        <li className="flex gap-2">
          <span className="font-bold shrink-0">1.</span>
          <span>
            {g.step1} —{" "}
            <a
              href="https://aistudio.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-blue-900"
            >
              aistudio.google.com
            </a>
          </span>
        </li>
        <li className="flex gap-2">
          <span className="font-bold shrink-0">2.</span>
          {g.step2}
        </li>
        <li className="flex gap-2">
          <span className="font-bold shrink-0">3.</span>
          {g.step3}
        </li>
        <li className="flex gap-2">
          <span className="font-bold shrink-0">4.</span>
          {g.step4}
        </li>
      </ol>
      <p className="mt-3 text-xs text-blue-600 italic">{g.note}</p>
    </div>
  );
}
