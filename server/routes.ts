import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { body, param, validationResult } from "express-validator";
import { storage } from "./storage";
import { equipmentTypeEnum, equipmentStatusEnum, insertEquipmentSchema } from "@shared/schema";
import { ZodError } from "zod";

// Validation middleware using express-validator per PRD requirement
const equipmentValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ max: 255 })
    .withMessage("Name must be 255 characters or less"),
  body("type")
    .notEmpty()
    .withMessage("Type is required")
    .isIn(equipmentTypeEnum)
    .withMessage(`Type must be one of: ${equipmentTypeEnum.join(", ")}`),
  body("status")
    .notEmpty()
    .withMessage("Status is required")
    .isIn(equipmentStatusEnum)
    .withMessage(`Status must be one of: ${equipmentStatusEnum.join(", ")}`),
  body("lastCleanedDate")
    .optional({ nullable: true })
    .custom((value) => {
      if (!value) return true;
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        throw new Error("Invalid date format");
      }
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      if (date > today) {
        throw new Error("Last cleaned date cannot be in the future");
      }
      return true;
    }),
];

const idValidation = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("Invalid equipment ID"),
];

// Helper to check validation results
function handleValidationErrors(req: Request, res: Response): boolean {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((e) => e.msg).join(", ");
    res.status(400).json({ error: `Validation failed: ${errorMessages}` });
    return true;
  }
  return false;
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // GET /api/equipment - Fetch all equipment
  app.get("/api/equipment", async (req, res) => {
    try {
      const equipmentList = await storage.getAllEquipment();
      res.json({ data: equipmentList });
    } catch (error) {
      console.error("Error fetching equipment:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // POST /api/equipment - Create new equipment
  app.post("/api/equipment", equipmentValidation, async (req, res) => {
    try {
      // Check express-validator errors first
      if (handleValidationErrors(req, res)) return;

      // Also validate with Zod for additional type safety
      const validatedData = insertEquipmentSchema.parse(req.body);
      const newEquipment = await storage.createEquipment(validatedData);
      res.status(201).json({ data: { id: newEquipment.id } });
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.errors.map(e => e.message).join(", ");
        res.status(400).json({ error: `Validation failed: ${errorMessages}` });
      } else {
        console.error("Error creating equipment:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    }
  });

  // PUT /api/equipment/:id - Update existing equipment
  app.put("/api/equipment/:id", [...idValidation, ...equipmentValidation], async (req, res) => {
    try {
      // Check express-validator errors first
      if (handleValidationErrors(req, res)) return;

      const id = parseInt(req.params.id, 10);

      const existingEquipment = await storage.getEquipment(id);
      if (!existingEquipment) {
        res.status(404).json({ error: "Equipment not found" });
        return;
      }

      // Also validate with Zod for additional type safety
      const validatedData = insertEquipmentSchema.parse(req.body);
      const updatedEquipment = await storage.updateEquipment(id, validatedData);
      
      if (!updatedEquipment) {
        res.status(404).json({ error: "Equipment not found" });
        return;
      }

      res.json({ data: "updated" });
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.errors.map(e => e.message).join(", ");
        res.status(400).json({ error: `Validation failed: ${errorMessages}` });
      } else {
        console.error("Error updating equipment:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    }
  });

  // DELETE /api/equipment/:id - Delete equipment
  app.delete("/api/equipment/:id", idValidation, async (req, res) => {
    try {
      // Check express-validator errors first
      if (handleValidationErrors(req, res)) return;

      const id = parseInt(req.params.id, 10);

      const deleted = await storage.deleteEquipment(id);
      if (!deleted) {
        res.status(404).json({ error: "Equipment not found" });
        return;
      }

      res.status(204).send();
    } catch (error) {
      console.error("Error deleting equipment:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  return httpServer;
}
