import { NewCaseWizard } from "@/components/new-case-wizard";

export default function NewCasePage({
  searchParams
}: {
  searchParams: { scenario?: string };
}): JSX.Element {
  return <NewCaseWizard initialScenario={searchParams.scenario} />;
}
