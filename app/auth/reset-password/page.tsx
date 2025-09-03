"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { authApi } from "@/lib/api";
import { useRouter, useSearchParams } from "next/navigation";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const otp = searchParams.get("otp") || "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    if (!otp) {
      toast.error("OTP is missing. Please verify your email first.");
      return;
    }

    setIsLoading(true);

    try {
      await authApi.resetPassword(email, password, otp);
      toast.success("Password reset successfully!");
      router.push("/auth/login");
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          "Failed to reset password. Please try again."
      );
    } finally {
      setIsLoading(false);
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

      {/* Reset Password Form */}
      <div className="p-10 w-full max-w-md">
        <div className="mb-8">
          <h1 className="text-[40px] font-semibold text-[#3F42EE] mb-2">
            Reset Password
          </h1>
          <p className="text-[#676877] text-[16px] font-normal">
            Create a new password to secure your account.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password">Create New Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="h-12 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
            disabled={isLoading}
          >
            {isLoading ? "Resetting..." : "Reset Password"}
          </Button>
        </form>
      </div>
    </div>
  );
}
