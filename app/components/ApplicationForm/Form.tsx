import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Footer } from "./Footer";
import { ProgressBar } from "./ProgressBar";

import { PersonalInfo } from "./steps/PersonalInfo";
import { ApplicationDetails } from "./steps/ApplicationDetails";
import { Documents } from "./steps/Documents";
import { Review } from "./steps/Review";
import { createApplication, uploadResume } from "~/lib/applications";
import { Link } from "react-router";

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
  const [submitting, setSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);

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

  async function onSubmit(data: ApplicationData) {
    setSubmitting(true);
    setSubmissionError("");
    try {
      const id = savedId ?? await createApplication(data);
      setSavedId(id);
      await uploadResume(id, data.resume!);
      setSubmitted(true);
    } catch (error) {
      setSubmissionError(error instanceof Error ? error.message : "Unable to submit application.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) return <div role="status" className="mx-auto max-w-3xl p-8"><h1 className="text-2xl font-bold">Application submitted</h1><p className="mt-2">Your details and resume were received.</p></div>;

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
            setValue={setValue}
            errors={errors}
          />
        )}

        {currentStep === 3 && <Review data={getValues()} />}
      </div>

      {submissionError && <p role="alert" className="mt-6 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-800">{submissionError} {submissionError.includes("session") && <Link to="/sign-in?next=%2Fapplication" className="underline">Sign in</Link>}</p>}

      <Footer
        currentStep={currentStep}
        totalSteps={steps.length}
        onBack={handleBack}
        onNext={handleNext}
        submitting={submitting}
      />
    </form>
  );
}
