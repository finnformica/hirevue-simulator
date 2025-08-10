import { endpoints } from "@/utils/endpoints";
import useSWR from "swr";
import { getFetcher } from "./fetchers";

export const useGetUser = () => {
  const { data, error, isLoading, mutate } = useSWR(endpoints.user, getFetcher);

  return {
    user: data,
    isProUser: data?.isProUser ?? false,
    error,
    isLoading,
    mutate,
  };
};
