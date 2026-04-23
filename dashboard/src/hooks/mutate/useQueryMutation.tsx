import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { privateInstance, publicInstance } from "../../configs/axiosConfig";

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
    } catch (err: any) {
      return Promise.reject(err?.response);
    }
  };

  const { mutate, isError, isPending, isSuccess, data } = useMutation({
    mutationFn: mutateRequest,

    onSuccess: () => {
      setBackendErrors(null);
    }
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
