type FooterProps = {
  currentStep: number;
  totalSteps: number;
  onBack: () => void;
  onNext: () => void;
};

export function Footer({
  currentStep,
  totalSteps,
  onBack,
  onNext,
}: FooterProps) {
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;

  return (
    <div className="mt-8 flex justify-between">
      <div>
        {!isFirstStep && (
          <button
            type="button"
            onClick={onBack}
            className="rounded border px-4 py-2"
          >
            Back
          </button>
        )}
      </div>

      <div>
        {isLastStep ? (
          <button
            key="submitbutton"
            type="submit"
            className="rounded bg-blue-600 px-4 py-2 text-white"
          >
            Submit Application
          </button>
        ) : (
          <button
            key="continuebutton"
            type="button"
            onClick={onNext}
            className="rounded bg-blue-600 px-4 py-2 text-white"
          >
            Continue
          </button>
        )}
      </div>
    </div>
  );
}