import { showToast } from "@/utils/toast";
import { privateInstance, publicInstance } from "@/configs/axiosConfig";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";

interface MutateProps {
  isPublic?: boolean; // use publicInstance if true
  url: string;
  config?: any;
  isUpdateMethod?: boolean; // optional _method override
}

export const useQueryMutation = ({ isPublic = false, url, config = {}, isUpdateMethod = false }: MutateProps) => {
  const [backendErrors, setBackendErrors] = useState<any>(null);

  const postData = async (body: any) => {
    const isFormData = body instanceof FormData;

    if (isUpdateMethod) {
      if (isFormData) {
        body.append("_method", "PUT");
      } else {
        body = { ...body, _method: "PUT" };
      }
    }
    let requestUrl = url;
    if (!isFormData && body?.updatedUrl) {
      requestUrl = body.updatedUrl;
      delete body.updatedUrl;
    }

    console.log("📤 Sending request to:", requestUrl);
    console.log("📦 Request body:", isFormData ? "FormData" : body);

    try {
      const requestConfig: any = {
        ...config,
        headers: {
          ...config.headers,
          Expect: undefined,
        },
        validateStatus: (status: number) => {
          return status >= 200 && status < 500;
        },
      };

      if (isFormData) {
        requestConfig.transformRequest = (data: any) => data;
      }

      const response = await (isPublic ? publicInstance : privateInstance).post(requestUrl, body, requestConfig);

      console.log("✅ Response:", response.data);

      // Return response data for all non-500 errors
      if (response.status >= 400) {
        // Create error object but with response data intact
        const error = new Error(response.data?.message);
        (error as any).response = response;
        return Promise.reject(error);
      }

      return response.data;
    } catch (err: any) {
      console.log("❌ Request failed");
      console.log("Status:", err?.response?.status);
      console.log("StatusText:", err?.response?.statusText);
      console.log("Error Data:", err?.response?.data);
      console.log("Error Message:", err?.message);
      return Promise.reject(err);
    }
  };

  const { mutate, isError, isPending } = useMutation({
    mutationFn: postData,
    onSuccess: () => setBackendErrors(null),
    onError: (err: any) => {
      const status = err?.response?.status;
      const responseData = err?.response?.data;

      // Handle specific status codes that aren't critical errors
      const nonCriticalStatuses = [
        417, // Email already verified
        419, // Token expired
      ];

      if (status === 422) {
        // Laravel validation errors - convert arrays to strings
        const formattedErrors = responseData?.errors
          ? Object.fromEntries(Object.entries(responseData.errors).map(([key, value]: [string, any]) => [key, Array.isArray(value) ? value[0] : value]))
          : responseData;
        console.log("📋 Formatted backend errors:", formattedErrors);
        setBackendErrors(formattedErrors);
      } else if (nonCriticalStatuses.includes(status)) {
        // Log info-level for non-critical status codes
        const message = responseData?.message || err?.message;
        console.log(`ℹ️ API Status ${status}:`, message);
        if (message) {
          showToast({ text: message, type: "error" });
        }
        setBackendErrors(null);
      } else {
        console.error("Mutation error:", err);
        setBackendErrors(null);
      }
    },
  });

  return {
    mutate,
    isError,
    isLoading: isPending,
    backendErrors,
  };
};
