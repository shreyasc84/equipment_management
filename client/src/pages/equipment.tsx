import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Equipment, InsertEquipment } from "@shared/schema";
import { EquipmentTable } from "@/components/equipment-table";
import { EquipmentFormDialog } from "@/components/equipment-form-dialog";
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog";

export default function EquipmentPage() {
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [deleteEquipment, setDeleteEquipment] = useState<Equipment | null>(null);

  const { data: equipmentData, isLoading, error } = useQuery<{ data: Equipment[] }>({
    queryKey: ["/api/equipment"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertEquipment) => {
      const res = await apiRequest("POST", "/api/equipment", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/equipment"] });
      setIsFormOpen(false);
      toast({
        title: "Success",
        description: "Equipment created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create equipment",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: InsertEquipment }) => {
      const res = await apiRequest("PUT", `/api/equipment/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/equipment"] });
      setEditingEquipment(null);
      toast({
        title: "Success",
        description: "Equipment updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update equipment",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/equipment/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/equipment"] });
      setDeleteEquipment(null);
      toast({
        title: "Success",
        description: "Equipment deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete equipment",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (equipment: Equipment) => {
    setEditingEquipment(equipment);
  };

  const handleDelete = (equipment: Equipment) => {
    setDeleteEquipment(equipment);
  };

  const handleFormSubmit = (data: InsertEquipment) => {
    if (editingEquipment) {
      updateMutation.mutate({ id: editingEquipment.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleConfirmDelete = () => {
    if (deleteEquipment) {
      deleteMutation.mutate(deleteEquipment.id);
    }
  };

  const equipment = equipmentData?.data || [];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary">
                <Package className="h-5 w-5 text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-semibold tracking-tight" data-testid="text-page-title">
                Equipment Management
              </h1>
            </div>
            <Button
              onClick={() => setIsFormOpen(true)}
              data-testid="button-add-equipment"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Equipment
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <EquipmentTable
          equipment={equipment}
          isLoading={isLoading}
          error={error}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </main>

      <EquipmentFormDialog
        open={isFormOpen || !!editingEquipment}
        onOpenChange={(open) => {
          if (!open) {
            setIsFormOpen(false);
            setEditingEquipment(null);
          }
        }}
        equipment={editingEquipment}
        onSubmit={handleFormSubmit}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />

      <DeleteConfirmDialog
        open={!!deleteEquipment}
        onOpenChange={(open) => {
          if (!open) setDeleteEquipment(null);
        }}
        equipmentName={deleteEquipment?.name || ""}
        onConfirm={handleConfirmDelete}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
}
