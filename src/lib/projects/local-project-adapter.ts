/**
 * FASE 7.13 — LocalProjectAdapter.
 */

import {
  emptyProjectsSnapshot,
  type ProjectStorageAdapter,
} from "@/lib/projects/storage-adapter";
import type { ProjectsSnapshot } from "@/lib/projects/types";

const KEY = "lymiar.projects.v1";

export class LocalProjectAdapter implements ProjectStorageAdapter {
  readonly name = "local";

  async load(): Promise<ProjectsSnapshot> {
    if (typeof window === "undefined") return emptyProjectsSnapshot();
    try {
      const raw = window.localStorage.getItem(KEY);
      if (!raw) return emptyProjectsSnapshot();
      const parsed = JSON.parse(raw) as ProjectsSnapshot;
      if (!parsed || !Array.isArray(parsed.projects)) {
        return emptyProjectsSnapshot();
      }
      return parsed;
    } catch {
      return emptyProjectsSnapshot();
    }
  }

  async save(snapshot: ProjectsSnapshot): Promise<void> {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(KEY, JSON.stringify(snapshot));
      window.dispatchEvent(new CustomEvent("lymiar:projects-changed"));
    } catch {
      /* quota */
    }
  }
}
