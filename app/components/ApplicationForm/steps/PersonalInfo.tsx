import type { FieldErrors, UseFormRegister } from "react-hook-form";

import type { ApplicationFormData } from "../formValidation";
import { Input } from "../../Input";

type PersonalInfoProps = {
  register: UseFormRegister<ApplicationFormData>;
  errors: FieldErrors<ApplicationFormData>;
};

const inputStyle =
  "h-[42px] w-full rounded-[5px] border bg-white px-3 text-sm outline-none focus:ring-2";

const labelStyle = "text-[13px] font-semibold text-black";

const errorStyle = "mt-1 text-xs text-red-600";

export function PersonalInfo({ register, errors }: PersonalInfoProps) {
  return (
    <section>
      <h2 className="text-xl font-bold">Personal Information</h2>

      <p className="mt-1 text-sm">All fields marked with * are required</p>

      <div className="mt-7 grid grid-cols-1 gap-x-16 gap-y-6 md:grid-cols-2">
        <Input
          label="Full Name *"
          placeholder="e.g John Doe"
          error={errors.fullName?.message}
          {...register("fullName")}
        />

        <Input
          label="Email Address *"
          type="email"
          placeholder="John.doe"
          error={errors.email?.message}
          {...register("email")}
        />

        <div>
          <label htmlFor="phone" className={labelStyle}>
            Phone Number *
          </label>

          <input
            id="phone"
            type="tel"
            placeholder="e.g 0400 000 000"
            {...register("phone")}
            className={`mt-2 ${inputStyle}`}
          />

          {errors.phone && <p className={errorStyle}>{errors.phone.message}</p>}
        </div>

        <div>
          <label htmlFor="address" className={labelStyle}>
            Address *
          </label>

          <textarea
            id="address"
            placeholder="Street address"
            {...register("address")}
            className="mt-2 min-h-[68px] w-full resize-none rounded-[5px] border border-[#aaa] p-3 text-sm outline-none focus:border-black focus:ring-2 focus:ring-gray-200"
          />

          {errors.address && (
            <p className={errorStyle}>{errors.address.message}</p>
          )}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
        <div>
          <label htmlFor="city" className={labelStyle}>
            City *
          </label>

          <input
            id="city"
            placeholder="e.g Melbourne"
            {...register("city")}
            className={`mt-2 ${inputStyle}`}
          />

          {errors.city && <p className={errorStyle}>{errors.city.message}</p>}
        </div>

        <div>
          <label htmlFor="state" className={labelStyle}>
            State *
          </label>

          <select
            id="state"
            {...register("state")}
            className={`mt-2 ${inputStyle}`}
          >
            <option value="" disabled hidden selected>
              e.g VIC
            </option>
            <option value="VIC">VIC</option>
            <option value="NSW">NSW</option>
            <option value="QLD">QLD</option>
            <option value="SA">SA</option>
            <option value="WA">WA</option>
            <option value="TAS">TAS</option>
            <option value="ACT">ACT</option>
            <option value="NT">NT</option>
          </select>

          {errors.state && <p className={errorStyle}>{errors.state.message}</p>}
        </div>

        <div>
          <label htmlFor="postcode" className={labelStyle}>
            Post Code *
          </label>

          <input
            id="postcode"
            placeholder="e.g 3000"
            {...register("postcode")}
            className={`mt-2 ${inputStyle}`}
          />

          {errors.postcode && (
            <p className={errorStyle}>{errors.postcode.message}</p>
          )}
        </div>
      </div>

      <div className="mt-6">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            {...register("privacyAccepted")}
            className="h-4 w-4"
          />

          <span>
            I agree to the{" "}
            <a href="/privacy" className="underline">
              privacy notice
            </a>
          </span>
        </label>

        {errors.privacyAccepted && (
          <p className={errorStyle}>{errors.privacyAccepted.message}</p>
        )}
      </div>
    </section>
  );
}
