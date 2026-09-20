import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Footer } from "./Footer";
import { ProgressBar } from "./ProgressBar";

import { PersonalInfo } from "./steps/PersonalInfo";
import { ApplicationDetails } from "./steps/ApplicationDetails";
import { Documents } from "./steps/Documents";
import { Review } from "./steps/Review";

import {
  applicationSchema,
  type ApplicationData,
  type ApplicationFormData,
} from "./formValidation";

const steps = [
  "Personal Info",
  "Application Details",
  "Documents",
  "Review & Submit",
];

const stepFields: Array<(keyof ApplicationFormData)[]> = [
  [
    "fullName",
    "email",
    "phone",
    "address",
    "city",
    "state",
    "postcode",
    "privacyAccepted",
  ],
  ["internshipProgram", "university", "graduationYear", "motivation"],
  ["resume", "coverLetter"],
  [],
];

export function ApplicationForm() {
  const [currentStep, setCurrentStep] = useState(0);

  const {
    register,
    handleSubmit,
    trigger,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useForm<ApplicationFormData, unknown, ApplicationData>({
    resolver: zodResolver(applicationSchema),

    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      postcode: "",
      privacyAccepted: false,

      internshipProgram: "",
      university: "",
      graduationYear: "",
      motivation: "",

      resume: null,
      coverLetter: null,
    },
  });

  async function handleNext() {
    const fields = stepFields[currentStep];

    const isValid = await trigger(fields);

    if (!isValid) {
      return;
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep((current) => current + 1);
    }
  }

  function handleBack() {
    if (currentStep > 0) {
      setCurrentStep((current) => current - 1);
    }
  }

  function onSubmit(data: ApplicationData) {
    // API integration can be added later.
    console.log("Application submitted:", data);
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mx-auto w-full max-w-[1000px] px-4 py-6 sm:px-6"
    >
      <ProgressBar currentStep={currentStep} steps={steps} />

      <div className="mt-10">
        {currentStep === 0 && (
          <PersonalInfo register={register} errors={errors} />
        )}

        {currentStep === 1 && (
          <ApplicationDetails register={register} errors={errors} />
        )}

        {currentStep === 2 && (
          <Documents
            resume={watch("resume")}
            coverLetter={watch("coverLetter")}
            setValue={setValue}
            errors={errors}
          />
        )}

        {currentStep === 3 && <Review data={getValues()} />}
      </div>

      <Footer
        currentStep={currentStep}
        totalSteps={steps.length}
        onBack={handleBack}
        onNext={handleNext}
      />
    </form>
  );
}
