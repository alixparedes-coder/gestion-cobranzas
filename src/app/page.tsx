import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { Scenarios } from "@/components/landing/Scenarios";
import { Kpis } from "@/components/landing/Kpis";
import { Scope } from "@/components/landing/Scope";
import { Footer } from "@/components/landing/Footer";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-white dark:bg-slate-950">
      <Header />
      <main className="flex-1">
        <Hero />
        <Features />
        <Scenarios />
        <Kpis />
        <Scope />
      </main>
      <Footer />
    </div>
  );
}
