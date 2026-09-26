import type { FieldErrors, UseFormRegister } from "react-hook-form";

import type { ApplicationFormData } from "../formValidation";
import { Dropdown } from "../../Dropdown";

type ApplicationDetailsProps = {
  register: UseFormRegister<ApplicationFormData>;
  errors: FieldErrors<ApplicationFormData>;
};

const inputStyle =
  "h-[42px] w-full rounded-[5px] border border-[#aaa] bg-white px-3 text-sm outline-none focus:border-black focus:ring-2 focus:ring-gray-200";

const labelStyle = "text-[13px] font-semibold text-black";

const errorStyle = "mt-1 text-xs text-red-600";

export function ApplicationDetails({
  register,
  errors,
}: ApplicationDetailsProps) {
  return (
    <section>
      <h2 className="text-xl font-bold">Application Details</h2>

      <p className="mt-1 text-sm">All fields marked with * are required</p>

      <div className="mt-7">
        <label htmlFor="internshipProgram" className={labelStyle}>
          Internship Program *
        </label>

        <input
          id="internshipProgram"
          placeholder="e.g. Food safety"
          {...register("internshipProgram")}
          className={`mt-2 ${inputStyle}`}
        />

        {errors.internshipProgram && (
          <p className={errorStyle}>{errors.internshipProgram.message}</p>
        )}
      </div>

      <div className="mt-5 grid grid-cols-1 gap-x-16 gap-y-5 md:grid-cols-2">
        <div>
          <label htmlFor="university" className={labelStyle}>
            University / Institute *
          </label>

          <input
            id="university"
            placeholder="e.g RMIT University"
            {...register("university")}
            className={`mt-2 ${inputStyle}`}
          />

          {errors.university && (
            <p className={errorStyle}>{errors.university.message}</p>
          )}
        </div>

        <Dropdown label="Expected Graduation Year *" id="graduationYear" placeholder="e.g 2027" options={["2026", "2027", "2028", "2029", "2030"].map((value) => ({ value, label: value }))} error={errors.graduationYear?.message} {...register("graduationYear")} />
      </div>

      <div className="mt-5">
        <label htmlFor="motivation" className={labelStyle}>
          Why are you interested in this Internship *
        </label>

        <textarea
          id="motivation"
          placeholder="Type your answer here..."
          {...register("motivation")}
          className="mt-2 min-h-[138px] w-full resize-none rounded-[5px] border border-[#aaa] p-3 text-sm outline-none focus:border-black focus:ring-2 focus:ring-gray-200"
        />

        {errors.motivation && (
          <p className={errorStyle}>{errors.motivation.message}</p>
        )}
      </div>
    </section>
  );
}
