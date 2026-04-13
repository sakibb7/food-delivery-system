"use client";

import { publicInstance, privateInstance } from "@/configs/axiosConfig";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

interface MutateProps {
  isPublic?: boolean;
  url: string;
  config?: any;
  method?: "POST" | "PUT" | "PATCH" | "DELETE";
}

export const useQueryMutation = ({
  isPublic = false,
  url,
  config = {},
  method = "POST",
}: MutateProps) => {
  const [backendErrors, setBackendErrors] = useState<any>(null);

  const mutateRequest = async (body: { [key: string]: any }) => {
    let finalUrl = url;

    // allow dynamic URL override
    if (body?.updatedUrl) {
      finalUrl = body.updatedUrl;
      delete body.updatedUrl;
    }

    const instance = isPublic ? publicInstance : privateInstance;

    try {
      let response;

      switch (method) {
        case "PUT":
          response = await instance.put(finalUrl, body, config);
          break;
        case "PATCH":
          response = await instance.patch(finalUrl, body, config);
          break;
        case "DELETE":
          response = await instance.delete(finalUrl, {
            ...config,
            data: body, // axios requires data inside config for DELETE
          });
          break;
        default:
          response = await instance.post(finalUrl, body, config);
      }

      return response;
    } catch (err) {
      return Promise.reject(err);
    }
  };

  const { mutate, isError, isPending, isSuccess, data } = useMutation({
    mutationFn: mutateRequest,

    onSuccess: () => {
      setBackendErrors(null);
    },

    onError: (err: any) => {
      let message = "An error occurred";
      const status = err?.response?.status;
      const responseData = err?.response?.data;

      switch (status) {
        case 422:
          const validationErrors = responseData?.errors;

          setBackendErrors((prev: any) => ({
            ...prev,
            ...validationErrors,
          }));

          message = responseData?.message || message;
          break;

        case 401:
          message = "Unauthorized. Please login again.";
          break;

        case 403:
          message = "Forbidden access.";
          break;

        case 404:
        case 417:
        case 500:
          message = responseData?.message || message;
          break;

        default:
          message = responseData?.message || message;
          break;
      }

      if (message) {
        toast.error(message, {
          position: "top-right",
        });
      }
    },
  });

  return {
    mutate,
    isError,
    isLoading: isPending,
    isSuccess,
    data,
    backendErrors,
  };
};
