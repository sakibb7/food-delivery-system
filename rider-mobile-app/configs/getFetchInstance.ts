import { API_BASE_URL } from "@/configs";

interface GetFetchInstanceProps {
  url: string;
  cache?: boolean;
  config?: RequestInit;
}

type Interceptor = (
  input: RequestInfo,
  init?: RequestInit
) => Promise<[RequestInfo, RequestInit?]>;
type ResponseInterceptor = (response: Response) => Promise<Response>;

const requestInterceptors: Interceptor[] = [];

const responseInterceptors: ResponseInterceptor[] = [];

export const addRequestInterceptor = (interceptor: Interceptor) => {
  requestInterceptors.push(interceptor);
};

export const addResponseInterceptor = (interceptor: ResponseInterceptor) => {
  responseInterceptors.push(interceptor);
};

// main fetch wrapper
export const getFetchInstance = async <T>({
  url,
  cache = true,
  config = {},
}: GetFetchInstanceProps): Promise<T> => {
  const isFormData = config.body instanceof FormData;
  let headers: Record<string, string> = {
    Accept: "application/json",
    ...(config.headers as Record<string, string>),
  };

  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }
  let request: [RequestInfo, RequestInit?] = [
    API_BASE_URL + url,
    {
      headers,
      ...config,
    },
  ];

  for (const interceptor of requestInterceptors) {
    request = await interceptor(...request);
  }

  let response = await fetch(...request);

  for (const interceptor of responseInterceptors) {
    response = await interceptor(response);
  }

  return (await response.json()) as T;
};
