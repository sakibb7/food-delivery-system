import {
  pgTable,
  serial,
  varchar,
  text,
  boolean,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";

export const zonesTable = pgTable("zones", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  
  // Coordinates for the polygon: [{lat: number, lng: number}, ...]
  coordinates: jsonb("coordinates").notNull(),
  
  status: varchar("status", { length: 50 }).notNull().default("active"), // active, inactive
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
