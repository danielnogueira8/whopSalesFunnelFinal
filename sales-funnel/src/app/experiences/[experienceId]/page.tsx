"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect } from "react";

export default function Page() {
  const router = useRouter();
  const params = useParams();
  const experienceId = params?.experienceId as string;

  useEffect(() => {
    router.replace(`/experiences/${experienceId}/dashboard`);
  }, [router, experienceId]);

  return null;
}
