"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface AnimatedSectionProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export default function AnimatedSection({ 
  children, 
  className = ""
}: AnimatedSectionProps) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}
