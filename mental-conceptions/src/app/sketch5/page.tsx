"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LegacySketchFivePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/entry");
  }, [router]);

  return null;
}
