import { mysqlTable, serial, varchar, date, timestamp } from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const equipmentTypeEnum = ["Machine", "Vessel", "Tank", "Mixer"] as const;
export const equipmentStatusEnum = ["Active", "Inactive", "Under Maintenance"] as const;

export type EquipmentType = (typeof equipmentTypeEnum)[number];
export type EquipmentStatus = (typeof equipmentStatusEnum)[number];

export const equipment = mysqlTable("equipment", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 100 }).$type<EquipmentType>().notNull(),
  status: varchar("status", { length: 100 }).$type<EquipmentStatus>().notNull().default("Active"),
  lastCleanedDate: date("last_cleaned_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertEquipmentSchema = createInsertSchema(equipment).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  name: z.string().min(1, "Name is required").max(255, "Name must be 255 characters or less").transform(s => s.trim()),
  type: z.enum(equipmentTypeEnum, { errorMap: () => ({ message: "Type is required" }) }),
  status: z.enum(equipmentStatusEnum, { errorMap: () => ({ message: "Status is required" }) }),
  lastCleanedDate: z.string().nullable().optional().refine((val) => {
    if (!val) return true;
    const date = new Date(val);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    return date <= today;
  }, { message: "Last cleaned date cannot be in the future" }),
});

export type InsertEquipment = z.infer<typeof insertEquipmentSchema>;
export type Equipment = typeof equipment.$inferSelect;
