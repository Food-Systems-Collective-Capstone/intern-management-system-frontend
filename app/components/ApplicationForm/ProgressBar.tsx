type ProgressBarProps = {
  currentStep: number;
  steps: string[];
};

export function ProgressBar({ currentStep, steps }: ProgressBarProps) {
  return (
    <div className="flex items-center justify-between">
      {steps.map((step, index) => (
        <div key={step} className="flex flex-1 items-center">
          <div className="flex flex-col items-center">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full ${
                index <= currentStep
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              {index + 1}
            </div>

            <span className="mt-2 text-sm">{step}</span>
          </div>

          {index < steps.length - 1 && (
            <div
              className={`mx-2 h-1 flex-1 ${
                index < currentStep ? "bg-blue-600" : "bg-gray-200"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
