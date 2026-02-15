import { vi } from "../../i18n/vi";

interface OnboardingScreenProps {
  onStart: () => void;
}

export default function OnboardingScreen({ onStart }: OnboardingScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
      <div className="text-6xl mb-6">💌</div>
      <h2 className="text-2xl font-bold text-gray-800 mb-3">{vi.onboarding.welcome}</h2>
      <p className="text-gray-600 mb-8 max-w-md">{vi.onboarding.description}</p>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8 max-w-md w-full text-left">
        <h3 className="font-semibold text-gray-700 mb-3">{vi.onboarding.howToExport}</h3>
        <ol className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span className="font-bold text-blue-500 shrink-0">1.</span>
            {vi.onboarding.step1}
          </li>
          <li className="flex gap-2">
            <span className="font-bold text-blue-500 shrink-0">2.</span>
            {vi.onboarding.step2}
          </li>
          <li className="flex gap-2">
            <span className="font-bold text-blue-500 shrink-0">3.</span>
            {vi.onboarding.step3}
          </li>
          <li className="flex gap-2">
            <span className="font-bold text-blue-500 shrink-0">4.</span>
            {vi.onboarding.step4}
          </li>
          <li className="flex gap-2">
            <span className="font-bold text-blue-500 shrink-0">5.</span>
            {vi.onboarding.step5}
          </li>
        </ol>
      </div>

      <button
        onClick={onStart}
        className="px-8 py-3 bg-blue-500 text-white rounded-full text-lg font-medium hover:bg-blue-600 transition-colors shadow-lg"
      >
        {vi.onboarding.startButton}
      </button>
    </div>
  );
}
