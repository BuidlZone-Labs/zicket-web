import { SignupForm } from "@/app/components/Auth";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export default function SignupPage() {
  return (
    <div className="min-h-screen flex flex-col py-2"
    style={{
      backgroundImage: "url('/images/bg.png')",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
    }}>
      <div className="flex-1 flex flex-col items-center justify-center px-5 md:px-8">
        {/* Logo */}
        
          <Link href="/">
            <Image
              src="/images/Logo2.png"
              alt="Zicket Logo"
              width={120}
              height={120}
              className="pb-8"
            />
          </Link>
        

        {/* Signup Form */}
        <SignupForm />

        <Button
          asChild
          variant="secondary"
          className="w-auto md:w-auto bg-[#FFFFFF] text-[#514A4A] hover:bg-slate-100 h-16 px-8 rounded-full font-medium text-lg"
        >
          <Link href="/login">
            {"Already Have an Account? "}
            <span className="text-[#8F37DA] ml-1 font-bold">Log in</span>
          </Link>
        </Button>
      </div>
    </div>
  );
}
