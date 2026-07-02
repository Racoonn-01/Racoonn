"use client";

import { PropertyWizard } from "@/components/properties/PropertyWizard";
import { useParams } from "next/navigation";

export default function EditPropertyPage() {
  const params = useParams();
  const id = params.id as string;
  
  return <PropertyWizard propertyId={id} />;
}
