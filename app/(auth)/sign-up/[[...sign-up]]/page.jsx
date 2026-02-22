import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex justify-center items-center bg-gray-50 min-h-screen">
      <div className="w-full max-w-md">
        <h1 className="mb-6 font-bold text-green-700 text-2xl text-center">
          🏔️ SajhaSamasya
        </h1>
        <p className="mb-4 text-gray-500 text-center">Sign up as a Citizen</p>
        <SignUp
          path="/sign-up"
          signInUrl="/sign-in"
          forceRedirectUrl="/citizen-setup"
          fallbackRedirectUrl="/citizen-setup"
        />
      </div>
    </div>
  );
}
