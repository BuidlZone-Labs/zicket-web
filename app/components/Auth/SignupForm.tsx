"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FormContainer } from "./FormContainer";
import { FormInput } from "./FormInput";
import { FormButton } from "./FormButton";
import { ChevronLeft, Link, Mail } from "lucide-react";
import {SiGoogle} from "@icons-pack/react-simple-icons";
import { handleOauth } from "@/lib/oauth";

export function SignupForm() {
  const [formData, setFormData] = useState({
    displayName: "",
    email: "",
  });
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle signup logic here
    router.push("/verify");
  };

  return (
    <FormContainer
      title="Create New Organizer Profile"
      description="Zicket gives you full control and your guests full privacy."
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <FormInput
          id="display-name"
          type="text"
          label="Enter Display Name (Public)"
          placeholder="e.g. Afrowave Labs"
          value={formData.displayName}
          onChange={(e) =>
            setFormData({ ...formData, displayName: e.target.value })
          }
          required
        />

        <FormInput
          id="signup-email"
          type="email"
          label="Contact Email (Platform notifications only)"
          placeholder="e.g. you@email.com"
          value={formData.email}
          onChange={(e) =>
            setFormData({ ...formData, email: e.target.value })
          }
          required
          minLength={8}
          endIcon={<Mail className="absolute right-4 top-1/2 transform -translate-y-1/2 w-8 h-8 text-[#CBD2EB]" aria-hidden="true" />}
        />

        <FormButton
          type="submit"
          variant="primary"
          icon="/svg/security-password.svg"
          iconSize={24}
          className="w-full text-lg cursor-pointer bg-[#751AC6] hover:from-purple-700 hover:to-purple-600 text-white h-14 rounded-lg font-medium"
        >
          Verify ZicketMail
        </FormButton>

        <h3 className="text-center text-gray-300">OR</h3>

        <div className="w-full">
          {/* sign with google */}
          <FormButton
            type="button"
            variant="secondary"
            onClick={() => handleOauth()}
            icon={<SiGoogle size={20} />}
            className="w-full flex justify-center text-lg cursor-pointer bg-[#FFFFFF] hover:bg-slate-100 text-purple-800 h-14 rounded-lg font-medium"
          >
              Sign in with Google
          </FormButton>
          <FormButton
            type="button"
            variant="secondary"
            onClick={() => router.back()}
            icon={<ChevronLeft size={21} />}
            className="flex items-center gap-2 justify-center w-full text-[#FFFFFF] cursor-pointer text-[14px] font-bold transition-colors"
          >
            Go Back
          </FormButton>
        </div>
      </form>
    </FormContainer>
  );
}
