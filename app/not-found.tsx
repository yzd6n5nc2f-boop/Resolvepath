import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function NotFound(): JSX.Element {
  return (
    <div className="mx-auto max-w-xl py-12">
      <Card className="text-center">
        <h2 className="text-2xl font-semibold text-brand-navy">Page not found</h2>
        <p className="mt-2 text-sm text-brand-ink/80">The requested mock resource is not available.</p>
        <Link href="/" className="mt-5 inline-flex">
          <Button>Back to Dashboard</Button>
        </Link>
      </Card>
    </div>
  );
}
