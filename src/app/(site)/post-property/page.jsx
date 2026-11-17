import { Suspense } from "react";
import PostPropertyWizard from "@/components/property/PostPropertyWizard";

export const metadata = {
  title: "Post your property for free",
  description: "List a flat, house, plot, office, shop or land for sale, rent or lease. Free for owners, agents and builders.",
};

export default function PostPropertyPage() {
  return (
    <Suspense fallback={<div className="container page-pad muted">Loading…</div>}>
      <PostPropertyWizard />
    </Suspense>
  );
}
