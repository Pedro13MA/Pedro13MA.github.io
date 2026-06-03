import { Navbar } from "@/components/Navbar";
import { MobileStickyCTA } from "@/components/MobileStickyCTA";
import { Hero } from "@/components/sections/Hero";
import { ProblemSolution } from "@/components/sections/ProblemSolution";
import { Pipeline } from "@/components/sections/Pipeline";
import { Tiers } from "@/components/sections/Tiers";
import { Categories } from "@/components/sections/Categories";
import { Features } from "@/components/sections/Features";
import { Demo } from "@/components/sections/Demo";
import { Stats } from "@/components/sections/Stats";
import { FAQ } from "@/components/sections/FAQ";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <ProblemSolution />
        <Pipeline />
        <Tiers />
        <Categories />
        <Features />
        <Demo />
        <Stats />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
      <MobileStickyCTA />
    </>
  );
}
