import { notFound } from "next/navigation";
import { PrintButton } from "@/components/print-button";
import { Card } from "@/components/ui/Card";
import { mockCases } from "@/lib/mock-data";

export default function CasePrintPage({ params }: { params: { id: string } }): JSX.Element {
  const caseItem = mockCases.find((entry) => entry.id === params.id);

  if (!caseItem) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-4xl space-y-5 py-4">
      <Card>
        <h1 className="text-2xl font-semibold text-brand-navy">ResolvePath Draft Pack</h1>
        <p className="mt-1 text-sm text-brand-ink/80">{caseItem.title}</p>
        <div className="mt-4 print:hidden">
          <PrintButton />
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-brand-navy">Conversation Script</h2>
        <pre className="mt-3 whitespace-pre-wrap text-sm leading-6 text-brand-ink">{caseItem.outputs.script}</pre>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-brand-navy">Meeting Invite Email</h2>
        <pre className="mt-3 whitespace-pre-wrap text-sm leading-6 text-brand-ink">{caseItem.outputs.inviteEmail}</pre>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-brand-navy">Meeting Notes Template</h2>
        <pre className="mt-3 whitespace-pre-wrap text-sm leading-6 text-brand-ink">{caseItem.outputs.notesTemplate}</pre>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-brand-navy">Follow-up Email</h2>
        <pre className="mt-3 whitespace-pre-wrap text-sm leading-6 text-brand-ink">{caseItem.outputs.followupEmail}</pre>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-brand-navy">Improvement Plan</h2>
        <pre className="mt-3 whitespace-pre-wrap text-sm leading-6 text-brand-ink">{caseItem.outputs.improvementPlan}</pre>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-brand-navy">Checklist</h2>
        <pre className="mt-3 whitespace-pre-wrap text-sm leading-6 text-brand-ink">{caseItem.outputs.checklist}</pre>
      </Card>
    </div>
  );
}
