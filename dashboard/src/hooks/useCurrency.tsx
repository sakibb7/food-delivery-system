import { useGetQuery } from "./mutate/useGetQuery";

export const useCurrency = () => {
  const { data: settings, isLoading } = useGetQuery({
    url: "/settings",
    queryKey: "settings",
  });

  return {
    currencySymbol: settings?.currency_symbol || "$",
    isLoading,
  };
};
