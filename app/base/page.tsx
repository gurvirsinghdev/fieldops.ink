import { buildBaseRoute } from "@/lib/urls";
import { redirect } from "next/navigation";

export default function Page() {
  redirect(buildBaseRoute("/signin"));
}
