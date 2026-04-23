import { db } from "../db/index.js";
import { settingsTable } from "../db/schema/settingsSchema.js";
import { UpdateSettingsInput } from "./settings.schemas.js";

export const getSettings = async () => {
  const settings = await db.select().from(settingsTable);
  
  const formattedSettings: any = {};
  
  for (const setting of settings) {
    if (setting.type === "number") {
      formattedSettings[setting.key] = Number(setting.value);
    } else if (setting.type === "boolean") {
      formattedSettings[setting.key] = setting.value === "true";
    } else {
      formattedSettings[setting.key] = setting.value;
    }
  }
  
  return formattedSettings;
};

export const updateSettings = async (data: UpdateSettingsInput) => {
  const updates = [];
  
  for (const [key, value] of Object.entries(data)) {
    let stringValue = String(value);
    let type = typeof value;
    
    // We already know the type from zod validation, but we can double check
    if (type === "number") {
      type = "number";
    } else if (type === "boolean") {
      type = "boolean";
    } else {
      type = "string";
    }

    updates.push({
      key,
      value: stringValue,
      type,
    });
  }

  // Upsert all settings
  for (const update of updates) {
    await db.insert(settingsTable)
      .values(update)
      .onConflictDoUpdate({
        target: settingsTable.key,
        set: { value: update.value, type: update.type, updatedAt: new Date() }
      });
  }

  return getSettings();
};
