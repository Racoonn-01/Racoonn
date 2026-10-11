import { redirect } from "next/navigation"

export default function VerificationPage() {
  redirect("/admin/verification/pending")
}
