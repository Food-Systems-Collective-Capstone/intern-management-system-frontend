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
            className="rounded border px-4 py-2 hover:opacity-82"
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
            className="rounded bg-[#111] px-4 py-2 text-white hover:opacity-82"
          >
            Submit Application
          </button>
        ) : (
          <button
            key="continuebutton"
            type="button"
            onClick={onNext}
            className="rounded bg-[#111] px-4 py-2 text-white hover:opacity-82"
          >
            Save & Continue
          </button>
        )}
      </div>
    </div>
  );
}
