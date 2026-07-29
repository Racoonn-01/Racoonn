export interface PopularStaySection {
  id: string;
  title: string;
  subtitle: string;
  location: string;
  isActive: boolean;
  order: number;
  propertyIds?: string[];
}

// Strictly EMPTY array by default - NO dummy data!
export const DEFAULT_POPULAR_SECTIONS: PopularStaySection[] = [];

const STORAGE_KEY = "racoonn_cms_popular_stays_sections_v3";

export function getPopularStaySections(): PopularStaySection[] {
  if (typeof window === "undefined") return [];
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved !== null) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed; // Return exact uploaded sections (empty if none uploaded)
      }
    }
  } catch (err) {
    console.error("Failed to parse popular stay sections from storage:", err);
  }
  return [];
}

export function savePopularStaySections(sections: PopularStaySection[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sections));
    // Dispatch local event
    window.dispatchEvent(new Event("cms_popular_stays_updated"));

    // Broadcast across windows/tabs/ports
    if ("BroadcastChannel" in window) {
      const bc = new BroadcastChannel("racoonn_cms_channel");
      bc.postMessage({ type: "POPULAR_STAYS_UPDATED", data: sections });
      bc.close();
    }
  } catch (err) {
    console.error("Failed to save popular stay sections to storage:", err);
  }
}
