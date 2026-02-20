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
    const lastCleanedDate = data.lastCleanedDate 
      ? new Date(data.lastCleanedDate) 
      : null;
    
    await db
      .insert(equipment)
      .values({
        name: data.name,
        type: data.type,
        status: data.status,
        lastCleanedDate: lastCleanedDate,
      });
    
    // Get the last inserted equipment by ordering by ID descending
    const insertedEquipmentList = await db
      .select()
      .from(equipment)
      .orderBy(equipment.id);
    
    if (insertedEquipmentList.length === 0) {
      throw new Error("Failed to retrieve inserted equipment");
    }
    
    return insertedEquipmentList[insertedEquipmentList.length - 1];
  }

  async updateEquipment(id: number, data: InsertEquipment): Promise<Equipment | undefined> {
    const lastCleanedDate = data.lastCleanedDate 
      ? new Date(data.lastCleanedDate) 
      : null;
    
    await db
      .update(equipment)
      .set({
        name: data.name,
        type: data.type,
        status: data.status,
        lastCleanedDate: lastCleanedDate,
        updatedAt: new Date(),
      })
      .where(eq(equipment.id, id));
    
    // Get the updated equipment by ID
    const updatedEquipment = await db
      .select()
      .from(equipment)
      .where(eq(equipment.id, id))
      .limit(1);
    
    return updatedEquipment[0] || undefined;
  }

  async deleteEquipment(id: number): Promise<boolean> {
    // First check if equipment exists
    const existingEquipment = await this.getEquipment(id);
    if (!existingEquipment) {
      return false;
    }
    
    await db.delete(equipment).where(eq(equipment.id, id));
    return true;
  }
}

export const storage = new DatabaseStorage();
