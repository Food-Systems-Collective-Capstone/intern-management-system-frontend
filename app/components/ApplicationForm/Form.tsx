import { useState } from "react";

import { Footer } from "./Footer";
import { ProgressBar } from "./ProgressBar";

import { PersonalInfo } from "./steps/PersonalInfo";
import { ApplicationDetails } from "./steps/ApplicationDetails";
import { Documents } from "./steps/Documents";
import { Review } from "./steps/Review";

export type ApplicationData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;

  university: string;
  degree: string;
  graduationYear: string;

  address: string;
  city: string;
  state: string;
  postcode: string;

  motivation: string;

  resume: File | null;
};

const steps = [
  "Personal Information",
  "Application Details",
  "Documents",
  "Review",
];

export function ApplicationForm() {
  const [currentStep, setCurrentStep] = useState(0);

  const [formData, setFormData] = useState<ApplicationData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",

    university: "",
    degree: "",
    graduationYear: "",

    address: "",
    city: "",
    state: "",
    postcode: "",

    motivation: "",

    resume: null,
  });

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleResumeChange(file: File | null) {
    setFormData((current) => ({
      ...current,
      resume: file,
    }));
  }

  function handleNext() {
    if (currentStep < steps.length - 1) {
      setCurrentStep((current) => current + 1);
    }
  }

  function handleBack() {
    if (currentStep > 0) {
      setCurrentStep((current) => current - 1);
    }
  }

  function handleEdit(step: number) {
    setCurrentStep(step);
  }

  return (
    <form>
        <ProgressBar
            currentStep={currentStep}
            steps={steps}
        />
      {currentStep === 0 && (
        <PersonalInfo data={formData} onChange={handleChange} />
      )}

      {currentStep === 1 && (
        <ApplicationDetails data={formData} onChange={handleChange} />
      )}

      {currentStep === 2 && (
        <Documents
          resume={formData.resume}
          onResumeChange={handleResumeChange}
        />
      )}

      {currentStep === 3 && <Review data={formData} onEdit={setCurrentStep} />}
      <Footer
        currentStep={currentStep}
        totalSteps={steps.length}
        onBack={handleBack}
        onNext={handleNext}
      />
    </form>
  );
}
