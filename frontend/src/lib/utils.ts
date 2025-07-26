import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { EntityTag } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getEntityTypeColor(tag: EntityTag): string {
  switch (tag) {
    case "person":
      return "bg-blue-100 border-blue-300 text-blue-800";
    case "company":
      return "bg-green-100 border-green-300 text-green-800";
    default:
      return "bg-gray-100 border-gray-300 text-gray-800";
  }
}

export function getRelationshipScoreColor(score: number): string {
  if (score >= 8) return "text-red-600";
  if (score >= 6) return "text-orange-600";
  if (score >= 4) return "text-yellow-600";
  return "text-gray-600";
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
