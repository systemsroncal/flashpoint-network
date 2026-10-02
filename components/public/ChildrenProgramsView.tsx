import ShowsCatalogView from "@/components/public/ShowsCatalogView";
import type { ClassicProgram } from "@/lib/types/cms";

export default function ChildrenProgramsView({
  programs,
}: {
  programs: ClassicProgram[];
}) {
  return <ShowsCatalogView variant="children" programs={programs} />;
}
