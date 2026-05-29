import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { ArrowDownIcon, ArrowUpIcon, CheckIcon } from "lucide-react";

const plans = [
  {
    key: "free",
    name: "Free",
    price: "$0/mo",
    tagline: "Built for solo operators getting started",
    features: [
      "1 team member",
      "Customer & job management",
      "Inventory management",
      "QuickBooks integration",
      "5 asset categories",
      "30-day activity history",
      "Community support",
    ],
  },
  {
    key: "spark",
    name: "Spark",
    price: "$229/mo",
    tagline: "Unlock real operational workflows",
    features: [
      "Up to 10 team members",
      "50 asset categories",
      "Trackable assets & map view",
      "100 route optimizations/month",
      "Routes up to 35 stops each",
      "Save, edit & reuse routes",
      "90-day activity history",
      "Full audit trail",
      "Standard support",
    ],
  },
  {
    key: "blaze",
    name: "Blaze",
    price: "$499/mo",
    tagline: "Scale your operations confidently",
    features: [
      "Up to 100 team members",
      "100 asset categories",
      "500 route optimizations/month",
      "Routes up to 50 stops each",
      "150-day activity history",
      "Priority support",
    ],
  },
  {
    key: "ignition",
    name: "Ignition",
    price: "$749/mo",
    tagline: "Built for high-volume, multi-team operations",
    features: [
      "Unlimited team members",
      "Unlimited asset categories",
      "2,000 route optimizations/month",
      "Routes up to 80 stops each",
      "730-day activity history",
      "Exportable audit trail",
      "Priority support",
    ],
  },
];

const currentPlan = "spark";

export default async function WorkspacePage() {
  const currentIndex = plans.findIndex((p) => p.key === currentPlan);

  return (
    <section className="p-6">
      <div className="mb-6">
        <p className="text-muted-foreground">
          Manage your workspace identity and subscription.
        </p>
      </div>

      <div className="space-y-6">
        <Card className="py-0">
          <CardContent className="py-4">
            <Field>
              <Label htmlFor="workspaceName">Workspace name</Label>
              <Input
                id="workspaceName"
                defaultValue="FieldOps Workspace"
                placeholder="Please enter your workspace name."
              />
            </Field>
          </CardContent>
        </Card>

        <Card className="py-0">
          <CardContent className="py-4">
            <div className="mb-4">
              <h2 className="font-semibold">Select a plan</h2>
              <p className="text-sm text-muted-foreground">
                Choose the plan that fits your operational needs.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {plans.map((plan, idx) => {
                const isActive = plan.key === currentPlan;
                const isUpgrade = idx > currentIndex;

                return (
                  <div
                    key={plan.key}
                    className={cn(
                      "rounded-lg border p-5 transition-colors flex flex-col",
                      isActive
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "hover:bg-muted/40",
                    )}
                  >
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div>
                          <h3 className="font-semibold">{plan.name}</h3>
                          <p className="text-lg font-bold mt-1">{plan.price}</p>
                          <p className="text-sm text-muted-foreground mt-0.5">
                            {plan.tagline}
                          </p>
                        </div>
                        {isActive && <Badge>Current plan</Badge>}
                      </div>

                      <ul className="space-y-2">
                        {plan.features.map((feature) => (
                          <li
                            key={feature}
                            className="flex items-start gap-2 text-sm"
                          >
                            <CheckIcon className="size-4 mt-0.5 shrink-0 text-primary" />
                            <span className="text-muted-foreground">
                              {feature}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-5">
                      {isActive ? (
                        <Button className="w-full" disabled>
                          Current plan
                        </Button>
                      ) : isUpgrade ? (
                        <Button className="w-full">
                          <ArrowUpIcon className="size-4 mr-2" />
                          Upgrade to {plan.name}
                        </Button>
                      ) : (
                        <Button variant="outline" className="w-full">
                          <ArrowDownIcon className="size-4 mr-2" />
                          Downgrade to {plan.name}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
