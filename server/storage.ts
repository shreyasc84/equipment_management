import { equipment, type Equipment, type InsertEquipment } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getAllEquipment(): Promise<Equipment[]>;
  getEquipment(id: number): Promise<Equipment | undefined>;
  createEquipment(data: InsertEquipment): Promise<Equipment>;
  updateEquipment(id: number, data: InsertEquipment): Promise<Equipment | undefined>;
  deleteEquipment(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async getAllEquipment(): Promise<Equipment[]> {
    return await db.select().from(equipment).orderBy(equipment.id);
  }

  async getEquipment(id: number): Promise<Equipment | undefined> {
    const [result] = await db.select().from(equipment).where(eq(equipment.id, id));
    return result || undefined;
  }

  async createEquipment(data: InsertEquipment): Promise<Equipment> {
    const [result] = await db
      .insert(equipment)
      .values({
        name: data.name,
        type: data.type,
        status: data.status,
        lastCleanedDate: data.lastCleanedDate || null,
      })
      .returning();
    return result;
  }

  async updateEquipment(id: number, data: InsertEquipment): Promise<Equipment | undefined> {
    const [result] = await db
      .update(equipment)
      .set({
        name: data.name,
        type: data.type,
        status: data.status,
        lastCleanedDate: data.lastCleanedDate || null,
        updatedAt: new Date(),
      })
      .where(eq(equipment.id, id))
      .returning();
    return result || undefined;
  }

  async deleteEquipment(id: number): Promise<boolean> {
    const result = await db.delete(equipment).where(eq(equipment.id, id)).returning();
    return result.length > 0;
  }
}

export const storage = new DatabaseStorage();
