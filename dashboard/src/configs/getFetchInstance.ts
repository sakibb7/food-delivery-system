import { API_BASE_URL, DEFAULT_CACHE_KEY } from ".";

interface GetFetchInstanceProps {
  url: string;
  cacheKey?: string | null;
  config?: RequestInit;
}

type Interceptor = (
  input: RequestInfo,
  init?: RequestInit,
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

export const getFetchInstance = async <T>({
  url,
  cacheKey = DEFAULT_CACHE_KEY,
  config = {},
}: GetFetchInstanceProps): Promise<T> => {
  const { headers: configHeaders, ...restConfig } = config;

  let request: [RequestInfo, RequestInit?] = [
    API_BASE_URL + url,
    {
      credentials: "include", // sends cookies automatically — no Bearer needed
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...configHeaders,
      },
      ...(cacheKey
        ? {
          next: {
            tags: [cacheKey],
            revalidate: 3600,
          },
        }
        : {}),
      ...restConfig, // spread restConfig instead of full config to avoid headers being overwritten twice
    },
  ];

  for (const interceptor of requestInterceptors) {
    request = await interceptor(...request);
  }

  let response = await fetch(...request);

  for (const interceptor of responseInterceptors) {
    response = await interceptor(response);
  }

  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status} ${response.statusText}`);
  }

  return (await response.json()) as T;
};