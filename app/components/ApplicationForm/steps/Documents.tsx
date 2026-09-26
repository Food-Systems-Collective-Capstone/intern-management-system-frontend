import { useRef } from "react";

import type { FieldErrors, UseFormSetValue } from "react-hook-form";

import type { ApplicationFormData } from "../formValidation";

type DocumentsProps = {
  resume: File | null;
  setValue: UseFormSetValue<ApplicationFormData>;
  errors: FieldErrors<ApplicationFormData>;
};

export function Documents({
  resume,
  setValue,
  errors,
}: DocumentsProps) {
  const resumeInputRef = useRef<HTMLInputElement>(null);

  function setResume(file?: File) {
    if (!file) return;

    setValue("resume", file, {
      shouldValidate: true,
      shouldDirty: true,
    });
  }

  return (
    <section>
      <h2 className="text-xl font-bold">Documents</h2>

      <p className="mt-1 text-sm">
        Upload your resume/CV as a PDF.
      </p>

      {/* Resume */}
      <div className="mt-7">
        <p className="text-[13px] font-semibold">Resume / CV *</p>

        <div
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            setResume(event.dataTransfer.files[0]);
          }}
          className="mt-2 flex min-h-[190px] flex-col items-center justify-center border border-dashed border-gray-500 px-4 py-4"
        >
          <div className="text-5xl" aria-hidden="true">
            ⇧
          </div>

          <p className="mt-2">Drag and drop your file here</p>

          <p className="my-2 text-sm">or</p>

          <button
            type="button"
            onClick={() => resumeInputRef.current?.click()}
            className="min-h-[42px] min-w-[155px] rounded-[5px] bg-[#3f3d3d] px-[18px] font-semibold text-white hover:opacity-80"
          >
            Choose a file
          </button>

          <input
            ref={resumeInputRef}
            type="file"
            accept=".pdf,application/pdf"
            className="hidden"
            onChange={(event) => setResume(event.target.files?.[0])}
          />

          <p className="mt-4 w-full text-sm text-gray-500">
            PDF allowed. Max size 5MB
          </p>
        </div>

        {/* Successful resume */}
        {resume && !errors.resume && (
          <div className="mt-4 flex items-center justify-between rounded-[5px] border border-gray-300 p-3">
            <div>
              <p className="text-sm font-semibold">{resume.name}</p>

              <p className="text-xs text-gray-500">
                {(resume.size / 1024 / 1024).toFixed(2)}MB
              </p>
            </div>

            <span className="text-green-600">✓</span>
          </div>
        )}

        {/* Resume error */}
        {errors.resume && (
          <div className="mt-4 rounded-[5px] border border-red-500 p-3">
            <p className="text-sm font-semibold">File upload error</p>

            <p className="text-xs text-red-500">{errors.resume.message}</p>
          </div>
        )}
      </div>

      <p className="mt-5 text-sm text-gray-600">Cover letters are not supported by the application service yet.</p>
    </section>
  );
}
