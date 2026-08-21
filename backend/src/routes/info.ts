import express, { Request, Response } from "express";
import { settingsTable } from "../db/schema/settingsSchema.js";
import { db } from "../db/index.js";
import { NOT_FOUND, OK } from "../constants/http.js";

const router = express.Router();

router.get("/", async (_req: Request, res: Response) => {
    const info = await db.select().from(settingsTable);

    console.log("NEW SETTINGS ROUTE HIT");

    const settingsObject = info.reduce((acc, item) => {
        let parsedValue: string | number | boolean = item.value;

        if (item.type === "number") {
            parsedValue = Number(item.value);
        }

        if (item.type === "boolean") {
            parsedValue = item.value === "true";
        }

        acc[item.key] = parsedValue;
        return acc;
    }, {} as Record<string, string | number | boolean>);

    console.log(settingsObject);

    res.status(OK).json({ settingsObject });
});

export default router;