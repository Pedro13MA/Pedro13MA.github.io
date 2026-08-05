"use client";

import { HomeHeroPremium } from "@/components/home/premium/HomeHeroPremium";
import { HomeDecisionsPremium } from "@/components/home/premium/HomeDecisionsPremium";
import { HomeDifference } from "@/components/home/premium/HomeDifference";
import { HomeMethod, HomeWhyName } from "@/components/home/premium/HomeMethod";
import { HomeExamples } from "@/components/home/premium/HomeExamples";
import { HomeFeatures } from "@/components/home/premium/HomeFeatures";
import { HomeStats } from "@/components/home/premium/HomeStats";
import { HomeExplorePremium } from "@/components/home/premium/HomeTelegramPremium";
import { HomeCouponsPremium } from "@/components/home/premium/HomeCouponsPremium";
import { HomeTelegramPremium } from "@/components/home/premium/HomeTelegramPremium";

/**
 * Homepage light SaaS — “Bloomberg dos preços” (UI only).
 */
export function HomePageClient() {
  return (
    <>
      <HomeHeroPremium />
      <HomeDecisionsPremium />
      <HomeDifference />
      <HomeMethod />
      <HomeWhyName />
      <HomeExamples />
      <HomeFeatures />
      <HomeStats />
      <HomeExplorePremium />
      <HomeCouponsPremium />
      <HomeTelegramPremium />
    </>
  );
}
