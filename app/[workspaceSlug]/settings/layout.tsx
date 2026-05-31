import { TooltipProvider } from "@/components/ui/tooltip";
import SettingsSidebar from "@/components/workspace/SettingsSidebar";

interface Props {
  children: React.ReactNode;
}

export default function SettingsLayout({ children }: Props) {
  return (
    <TooltipProvider>
      <div className="flex h-full">
        <SettingsSidebar />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </TooltipProvider>
  );
}
