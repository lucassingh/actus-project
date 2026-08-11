import { Hero } from "@/components/Hero";
import { ProductDefinition } from "@/components/ProductDefinition";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ProblemSection } from "@/components/ProblemSection";
import { SolutionSection } from "@/components/SolutionSection";
import { PricingSection } from "@/components/PricingSection";
import { Faqsection } from "@/components/Faqsection";
import { ContactSection } from "@/components/ContactSection";
import { BackToTop } from "@/components/ui/BackToTop";

export default function Home() {
    return (
        <div className="relative">
            <Navbar />
            <Hero />
            <ProductDefinition />
            <ProblemSection />
            <SolutionSection />
            <PricingSection />
            <Faqsection />
            <ContactSection />
            <Footer />
            <BackToTop />
        </div>
    );
}
