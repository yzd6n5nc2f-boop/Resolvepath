import { notFound } from "next/navigation";
import { CaseDetailView } from "@/components/case-detail-view";
import { mockCases } from "@/lib/mock-data";

export default function CaseDetailPage({ params }: { params: { id: string } }): JSX.Element {
  const caseItem = mockCases.find((entry) => entry.id === params.id);

  if (!caseItem) {
    notFound();
  }

  return <CaseDetailView caseItem={caseItem} />;
}
