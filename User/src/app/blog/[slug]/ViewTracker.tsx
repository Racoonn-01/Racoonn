"use client";

import { useEffect } from "react";
import { incrementBlogView } from "../actions";

export default function ViewTracker({ documentId, currentViews }: { documentId: string, currentViews: number }) {
  useEffect(() => {
    // Fire the view increment server action on page mount.
    incrementBlogView(documentId, currentViews);
  }, [documentId, currentViews]);

  return null;
}
