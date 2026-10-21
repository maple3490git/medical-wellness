import { patients } from "@/data/patients";
import PatientDetail from "./patient-detail";

export function generateStaticParams() {
  return patients.map((p) => ({ id: p.id }));
}

export default async function PatientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PatientDetail id={id} />;
}