import { useEffect, useState } from "react";
import { fetchApplications, type Candidate } from "~/lib/applications";

export function useApplications(page: number, status: string) {
  const key = `${page}:${status}`;
  const [result, setResult] = useState<{
    key: string;
    data: Candidate[];
    total: number;
    error: string;
  } | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetchApplications(page, status, controller.signal)
      .then((result) => {
        if (!controller.signal.aborted) {
          setResult({ key, data: result.data, total: result.total, error: "" });
        }
      })
      .catch((cause) => {
        if (!controller.signal.aborted) {
          setResult({
            key,
            data: [],
            total: 0,
            error:
              cause instanceof Error
                ? cause.message
                : "Unable to load applications.",
          });
        }
      });
    return () => controller.abort();
  }, [page, status, key]);

  return {
    data: result?.key === key ? result.data : [],
    total: result?.key === key ? result.total : 0,
    loading: result?.key !== key,
    error: result?.key === key ? result.error : "",
  };
}
