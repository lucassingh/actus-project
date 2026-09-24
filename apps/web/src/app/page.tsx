import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { ProductDefinition } from "@/components/landing/ProductDefinition";
import { ProblemSection } from "@/components/landing/ProblemSection";
import { SolutionSection } from "@/components/landing/SolutionSection";
import { Faqsection } from "@/components/landing/Faqsection";
import { ContactSection } from "@/components/landing/ContactSection";
import { Footer } from "@/components/landing/Footer";
import { BackToTop } from "@/components/ui/BackToTop";

export default async function RootPage() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");

  return (
    <div className="relative">
      <Navbar />
      <Hero />
      <ProductDefinition />
      <ProblemSection />
      <SolutionSection />
      <Faqsection />
      <ContactSection />
      <Footer />
      <BackToTop />
    </div>
  );
}
