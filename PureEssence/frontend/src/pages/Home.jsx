import React from "react";
import Hero from "@/components/home/Hero";
import BottleShowcase from "@/components/home/BottleShowcase";
import ProcessSteps from "@/components/home/ProcessSteps";
import FeaturedCollection from "@/components/home/FeaturedCollection";

export default function Home() {
  return (
    <div>
      <Hero />
      <BottleShowcase />
      <ProcessSteps />
      <FeaturedCollection />
    </div>
  );
}