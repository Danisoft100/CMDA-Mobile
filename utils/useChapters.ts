import { useMemo } from "react";
import { DOCTOR_REGIONS, GLOBAL_NETWORK_REGIONS, STUDENT_REGIONS } from "~/constants/regions";
import { useGetAllChaptersQuery } from "~/store/api/chaptersApi";

const FALLBACKS: Record<string, string[]> = {
  Student: STUDENT_REGIONS,
  Doctor: DOCTOR_REGIONS,
  GlobalNetwork: GLOBAL_NETWORK_REGIONS,
};

export const useChapters = (type?: string) => {
  const { data, isLoading, error } = useGetAllChaptersQuery({ type }, { skip: !type });
  const chapters = useMemo(() => {
    if (data?.length) return data.map((chapter: any) => chapter.name).filter(Boolean);
    return type ? FALLBACKS[type] || [] : [];
  }, [data, type]);

  return { chapters, isLoading, error };
};
