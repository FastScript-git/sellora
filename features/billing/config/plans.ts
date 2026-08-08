export type BillingPeriod =
  | "monthly"
  | "yearly";

export type BillingPlanKey =
  | "free"
  | "pro"
  | "business";

export type BillingPlan = {
  key: BillingPlanKey;

  monthlyPrice: number;
  yearlyPrice: number;

  highlighted: boolean;

  limits: {
    aiEmployees: number | null;
    knowledgeSources: number | null;
    channels: number | null;
    workflows: number | null;
    monthlyMessages: number | null;
  };
};

export const billingPlans: BillingPlan[] = [
  {
    key: "free",

    monthlyPrice: 0,
    yearlyPrice: 0,

    highlighted: false,

    limits: {
      aiEmployees: 1,
      knowledgeSources: 3,
      channels: 1,
      workflows: 1,
      monthlyMessages: 500,
    },
  },

  {
    key: "pro",

    monthlyPrice: 99,
    yearlyPrice: 990,

    highlighted: true,

    limits: {
      aiEmployees: 5,
      knowledgeSources: null,
      channels: 5,
      workflows: 20,
      monthlyMessages: 10_000,
    },
  },

  {
    key: "business",

    monthlyPrice: 299,
    yearlyPrice: 2990,

    highlighted: false,

    limits: {
      aiEmployees: null,
      knowledgeSources: null,
      channels: null,
      workflows: null,
      monthlyMessages: 50_000,
    },
  },
];

export function getBillingPlan(
  key: BillingPlanKey,
) {
  return billingPlans.find(
    (plan) => plan.key === key,
  );
}

export function getPlanPrice({
  plan,
  billingPeriod,
}: {
  plan: BillingPlan;
  billingPeriod: BillingPeriod;
}) {
  return billingPeriod === "yearly"
    ? plan.yearlyPrice
    : plan.monthlyPrice;
}

export function getYearlyMonthlyEquivalent(
  plan: BillingPlan,
) {
  if (plan.yearlyPrice <= 0) {
    return 0;
  }

  return Math.round(
    plan.yearlyPrice / 12,
  );
}

export function getYearlySaving(
  plan: BillingPlan,
) {
  return Math.max(
    0,
    plan.monthlyPrice * 12 -
      plan.yearlyPrice,
  );
}
