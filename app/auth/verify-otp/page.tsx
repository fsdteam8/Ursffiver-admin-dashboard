"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { authApi } from "@/lib/api";
import { useRouter, useSearchParams } from "next/navigation";

export default function VerifyOtpPage() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpString = otp.join("");
    if (otpString.length !== 6) {
      toast.error("Please enter all 6 digits");
      return;
    }

    setIsLoading(true);

    try {
      // Instead of verifying OTP here, pass it to the reset password page
      router.push(
        `/auth/reset-password?email=${encodeURIComponent(
          email
        )}&otp=${encodeURIComponent(otpString)}`
      );
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await authApi.forgotPassword(email);
      toast.success("OTP resent successfully!");
    } catch (error) {
      toast.error("Failed to resend OTP");
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{
        backgroundImage: "url('/authentication-bg.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Logo */}
      <div className="absolute top-6 left-8 flex flex-col items-center">
        <div className="text-3xl font-extrabold text-blue-600">SPEET</div>
        <div className="flex items-center gap-1 mt-1">
          <div className="w-0 h-0 border-t-[6px] border-b-[6px] border-r-[10px] border-r-blue-600 border-transparent"></div>
          <div className="w-14 h-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
          <div className="w-0 h-0 border-t-[6px] border-b-[6px] border-l-[10px] border-l-blue-600 border-transparent"></div>
        </div>
      </div>

      {/* Verify OTP Form */}
      <div className="space-y-4">
        <div className="">
          <h1 className="text-[40px] font-semibold text-[#3F42EE] mb-2">
            Verify Email
          </h1>
          <p className="text-[#676877] text-[16px] font-normal">
            Enter OTP to verify your email
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center gap-3">
            {otp.map((digit, index) => (
              <Input
                key={index}
                id={`otp-${index}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-12 text-center text-lg font-semibold border-2 border-gray-200 focus:border-blue-600"
              />
            ))}
          </div>

          <div className="text-center">
            <span className="text-gray-600">Didn't get a code? </span>
            <button
              type="button"
              onClick={handleResend}
              className="text-blue-600 hover:underline font-medium"
            >
              Resend
            </button>
          </div>

          <Button
            type="submit"
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium"
            disabled={isLoading}
          >
            {isLoading ? "Verifying..." : "Verify"}
          </Button>
        </form>
      </div>
    </div>
  );
}