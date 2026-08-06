"use client";

import { HomeHeroPremium } from "@/components/home/premium/HomeHeroPremium";
import { HomeDecisionsPremium } from "@/components/home/premium/HomeDecisionsPremium";
import { HomeDealsProvider } from "@/components/home/premium/HomeDealsProvider";
import { HomeDifference } from "@/components/home/premium/HomeDifference";
import { HomeMethod, HomeWhyName } from "@/components/home/premium/HomeMethod";
import { HomeExamples } from "@/components/home/premium/HomeExamples";
import { HomeFeatures } from "@/components/home/premium/HomeFeatures";
import { HomeStats } from "@/components/home/premium/HomeStats";
import { HomeExplorePremium } from "@/components/home/premium/HomeTelegramPremium";
import { HomeCouponsPremium } from "@/components/home/premium/HomeCouponsPremium";
import { HomeTelegramPremium } from "@/components/home/premium/HomeTelegramPremium";
import { LazySection } from "@/components/ui/LazySection";

/**
 * Homepage light SaaS — “Bloomberg dos preços” (UI only).
 */
export function HomePageClient() {
  return (
    <HomeDealsProvider>
      <HomeHeroPremium />
      <LazySection minHeight="28rem">
        <HomeDecisionsPremium />
      </LazySection>
      <LazySection minHeight="16rem">
        <HomeDifference />
      </LazySection>
      <LazySection minHeight="16rem">
        <HomeMethod />
      </LazySection>
      <LazySection minHeight="12rem">
        <HomeWhyName />
      </LazySection>
      <LazySection minHeight="20rem">
        <HomeExamples />
      </LazySection>
      <LazySection minHeight="16rem">
        <HomeFeatures />
      </LazySection>
      <LazySection minHeight="10rem">
        <HomeStats />
      </LazySection>
      <LazySection minHeight="12rem">
        <HomeExplorePremium />
      </LazySection>
      <LazySection minHeight="14rem">
        <HomeCouponsPremium />
      </LazySection>
      <LazySection minHeight="12rem">
        <HomeTelegramPremium />
      </LazySection>
    </HomeDealsProvider>
  );
}
