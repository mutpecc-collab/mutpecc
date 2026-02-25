import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

interface ShowMoreButtonProps {
  hasMore: boolean;
  onClick: () => void;
  totalCount: number;
  shownCount: number;
}

export function ShowMoreButton({ hasMore, onClick, totalCount, shownCount }: ShowMoreButtonProps) {
  if (!hasMore) return null;

  return (
    <div className="flex justify-center pt-6">
      <Button variant="outline" onClick={onClick} className="gap-2">
        <ChevronDown className="w-4 h-4" />
        Show More ({shownCount} of {totalCount})
      </Button>
    </div>
  );
}
