import { useContext } from "react";
import { AppContext } from "./app-context";
import { AppContextType } from "@/types";

export const useAppData = (): AppContextType => {
    const context = useContext(AppContext);

    if (!context) {
        throw new Error("useAppData must be used within AppProvider");
    }

    return context;
};