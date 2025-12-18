import { format } from "date-fns";
import { Edit, Trash2, AlertCircle, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import type { Equipment } from "@shared/schema";

interface EquipmentTableProps {
  equipment: Equipment[];
  isLoading: boolean;
  error: Error | null;
  onEdit: (equipment: Equipment) => void;
  onDelete: (equipment: Equipment) => void;
}

function getStatusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "Active":
      return "default";
    case "Inactive":
      return "secondary";
    case "Under Maintenance":
      return "outline";
    default:
      return "secondary";
  }
}

function getStatusClasses(status: string): string {
  switch (status) {
    case "Active":
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800";
    case "Inactive":
      return "bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-400 border-gray-200 dark:border-gray-700";
    case "Under Maintenance":
      return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800";
    default:
      return "";
  }
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-12 flex-1" />
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <Package className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="mb-2 text-lg font-medium" data-testid="text-empty-title">
        No equipment found
      </h3>
      <p className="max-w-sm text-sm text-muted-foreground" data-testid="text-empty-description">
        Get started by adding your first piece of equipment. Click the "Add Equipment" button above.
      </p>
    </div>
  );
}

function ErrorState({ error }: { error: Error }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
        <AlertCircle className="h-8 w-8 text-destructive" />
      </div>
      <h3 className="mb-2 text-lg font-medium" data-testid="text-error-title">
        Failed to load equipment
      </h3>
      <p className="max-w-sm text-sm text-muted-foreground" data-testid="text-error-description">
        {error.message || "An error occurred while fetching equipment data."}
      </p>
    </div>
  );
}

export function EquipmentTable({
  equipment,
  isLoading,
  error,
  onEdit,
  onDelete,
}: EquipmentTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-lg border bg-card p-6">
        <LoadingSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border bg-card">
        <ErrorState error={error} />
      </div>
    );
  }

  if (equipment.length === 0) {
    return (
      <div className="rounded-lg border bg-card">
        <EmptyState />
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card" data-testid="container-equipment-table">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="text-xs font-semibold uppercase tracking-wide">
              Name
            </TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wide">
              Type
            </TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wide">
              Status
            </TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wide">
              Last Cleaned
            </TableHead>
            <TableHead className="text-right text-xs font-semibold uppercase tracking-wide">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {equipment.map((item, index) => (
            <TableRow
              key={item.id}
              className={index % 2 === 0 ? "bg-transparent" : "bg-muted/30"}
              data-testid={`row-equipment-${item.id}`}
            >
              <TableCell className="font-medium" data-testid={`text-name-${item.id}`}>
                {item.name}
              </TableCell>
              <TableCell data-testid={`text-type-${item.id}`}>
                {item.type}
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={getStatusClasses(item.status)}
                  data-testid={`badge-status-${item.id}`}
                >
                  {item.status}
                </Badge>
              </TableCell>
              <TableCell
                className="text-muted-foreground"
                data-testid={`text-last-cleaned-${item.id}`}
              >
                {item.lastCleanedDate
                  ? format(new Date(item.lastCleanedDate), "MMM d, yyyy")
                  : "—"}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(item)}
                    data-testid={`button-edit-${item.id}`}
                  >
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">Edit {item.name}</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(item)}
                    className="text-destructive hover:text-destructive"
                    data-testid={`button-delete-${item.id}`}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete {item.name}</span>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
