"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { authApi } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await authApi.forgotPassword(email);
      toast.success("OTP sent to your email!");
      router.push(`/auth/verify-otp?email=${encodeURIComponent(email)}`);
    } catch (error) {
      toast.error("Failed to send OTP. Please try again.");
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

      {/* Forgot Password Form */}
      <div className="space-y-8">
        <div className="">
          <h1 className="text-[40px] font-semibold text-[#3F42EE] mb-2">
            Forgot Password
          </h1>
          <p className="text-[#676877] text-[16px] font-normal">
            Enter your email to recover your password
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="hello@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-12"
            />
          </div>

          <Button
            type="submit"
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium"
            disabled={isLoading}
          >
            {isLoading ? "Sending..." : "Send OTP"}
          </Button>
        </form>
      </div>
    </div>
  );
}
