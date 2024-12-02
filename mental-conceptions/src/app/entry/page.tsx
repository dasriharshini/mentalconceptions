"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

function getRandomPage() {
  const pages = ['/sketch', '/sketch2', '/sketch3', '/sketch4'];
  return pages[Math.floor(Math.random() * pages.length)];
}

function Entry() {
  const router = useRouter();

  useEffect(() => {
    const assignedPage = localStorage.getItem('assignedPage');

    if (!assignedPage) {
      const randomPage = getRandomPage();
      localStorage.setItem('assignedPage', randomPage); // Store the assignment
      router.push(randomPage); // Redirect to the assigned page
    } else {
      router.push(assignedPage); // Redirect to the previously assigned page
    }
  }, [router]);

  return <div>Loading... Please wait while we assign your page.</div>;
}

export default Entry;
