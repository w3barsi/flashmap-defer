import { auth } from "@clerk/nextjs";
import OnboardingPicker from "../_components/onboarding-picker";
import { redirect } from "next/navigation";

export default function Page() {
  const { sessionClaims } = auth();

  if(sessionClaims?.metadata.role === "student"){
  redirect("/")
  };

  return <OnboardingPicker />;
}
