import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Equipment, InsertEquipment } from "@shared/schema";
import { equipmentTypeEnum, equipmentStatusEnum } from "@shared/schema";

const formSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(255, "Name must be 255 characters or less")
    .transform((s) => s.trim()),
  type: z.enum(equipmentTypeEnum, {
    errorMap: () => ({ message: "Please select a type" }),
  }),
  status: z.enum(equipmentStatusEnum, {
    errorMap: () => ({ message: "Please select a status" }),
  }),
  lastCleanedDate: z
    .string()
    .nullable()
    .optional()
    .refine(
      (val) => {
        if (!val) return true;
        const date = new Date(val);
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        return date <= today;
      },
      { message: "Last cleaned date cannot be in the future" }
    ),
});

type FormValues = z.infer<typeof formSchema>;

interface EquipmentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  equipment: Equipment | null;
  onSubmit: (data: InsertEquipment) => void;
  isSubmitting: boolean;
}

export function EquipmentFormDialog({
  open,
  onOpenChange,
  equipment,
  onSubmit,
  isSubmitting,
}: EquipmentFormDialogProps) {
  const isEditing = !!equipment;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      type: undefined,
      status: "Active",
      lastCleanedDate: null,
    },
  });

  useEffect(() => {
    if (open) {
      if (equipment) {
        form.reset({
          name: equipment.name,
          type: equipment.type,
          status: equipment.status,
          lastCleanedDate: equipment.lastCleanedDate || null,
        });
      } else {
        form.reset({
          name: "",
          type: undefined,
          status: "Active",
          lastCleanedDate: null,
        });
      }
    }
  }, [open, equipment, form]);

  const handleSubmit = (values: FormValues) => {
    onSubmit(values as InsertEquipment);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" data-testid="dialog-equipment-form">
        <DialogHeader>
          <DialogTitle data-testid="text-dialog-title">
            {isEditing ? "Edit Equipment" : "Add Equipment"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the equipment details below."
              : "Fill in the details to add new equipment."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
            data-testid="form-equipment"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter equipment name"
                      {...field}
                      data-testid="input-name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    data-testid="select-type"
                  >
                    <FormControl>
                      <SelectTrigger data-testid="trigger-type">
                        <SelectValue placeholder="Select equipment type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {equipmentTypeEnum.map((type) => (
                        <SelectItem
                          key={type}
                          value={type}
                          data-testid={`option-type-${type.toLowerCase()}`}
                        >
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    data-testid="select-status"
                  >
                    <FormControl>
                      <SelectTrigger data-testid="trigger-status">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {equipmentStatusEnum.map((status) => (
                        <SelectItem
                          key={status}
                          value={status}
                          data-testid={`option-status-${status.toLowerCase().replace(/\s+/g, "-")}`}
                        >
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastCleanedDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Cleaned Date (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                      value={field.value || ""}
                      onChange={(e) =>
                        field.onChange(e.target.value || null)
                      }
                      max={new Date().toISOString().split("T")[0]}
                      data-testid="input-last-cleaned-date"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                data-testid="button-submit"
              >
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isEditing ? "Save Changes" : "Add Equipment"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
