import { endpoints } from "@/utils/endpoints";
import useSWR from "swr";
import { getFetcher } from "./fetchers";

export const useGetUser = () => {
  const { data, error, isLoading } = useSWR(endpoints.user, getFetcher);

  const isProUser = data?.subscription_status === "active";

  return {
    user: data,
    isProUser,
    error,
    isLoading,
  };
};
