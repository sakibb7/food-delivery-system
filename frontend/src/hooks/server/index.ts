import { SERVER_SIDE_API_URLS } from "@/configs";
import { getFetchInstance } from "@/configs/getFetchInstance";

export const getAppInfo = async () => {
    const value = SERVER_SIDE_API_URLS;
    try {
        const response = (await getFetchInstance({
            url: "/info",
            cacheKey: "appInfo",
        })) as any;
        return response;
    } catch (error: any) {
        console.warn(error);
    }
};