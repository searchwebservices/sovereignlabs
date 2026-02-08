"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarToggle } from "@/components/sidebar-toggle";

interface LabPageHeaderProps {
  backHref?: string;
  actions?: React.ReactNode;
}

export function LabPageHeader({
  backHref,
  actions,
}: LabPageHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b px-6 py-4">
      <div className="flex items-center gap-3">
        <SidebarToggle />
        {backHref && (
          <Button variant="ghost" size="icon" className="size-8" asChild>
            <Link href={backHref}>
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
