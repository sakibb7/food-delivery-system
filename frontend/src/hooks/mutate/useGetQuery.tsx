import { privateInstance, publicInstance } from "@/configs/axiosConfig";

import { useQuery } from "@tanstack/react-query";

interface QueryProps {
  isPublic?: boolean;
  url: string;
  params?: Record<string, any>;
  enabled?: boolean;
  queryKey?: string | (string | number)[];
  refetchOnMount?: boolean | "always";
}

// Add generic type <T> for expected return data shape
export const useGetQuery = <T = any,>({
  isPublic = false,
  url,
  params = {},
  enabled = true,
  queryKey,
  refetchOnMount,
}: QueryProps) => {
  const getData = async (): Promise<T> => {
    const instance = isPublic ? publicInstance : privateInstance;
    try {
      const response = await instance.get(url, {
        params,
      });
      console.log(response?.data, "Respose");
      return response?.data;
    } catch (err) {
      return Promise.reject(err);
    }
  };

  const key = queryKey || url;
  const { data, error, isLoading, refetch, isFetching, isSuccess, isError } =
    useQuery<T>({
      queryFn: getData,
      queryKey: [key, params, isPublic],
      enabled,
      ...(refetchOnMount !== undefined && { refetchOnMount }),
    });

  return {
    data,
    error,
    isLoading,
    isFetching,
    refetch,
    isSuccess,
    isError,
  };
};
