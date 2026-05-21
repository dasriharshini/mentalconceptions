"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SketchPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/entry");
  }, [router]);

  return null;
}
