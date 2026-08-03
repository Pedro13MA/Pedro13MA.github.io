/**
 * FASE 7.13 — ProjectStorageAdapter.
 */

import type { ProjectsSnapshot } from "@/lib/projects/types";

export interface ProjectStorageAdapter {
  readonly name: string;
  load(): Promise<ProjectsSnapshot>;
  save(snapshot: ProjectsSnapshot): Promise<void>;
  sync?(): Promise<void>;
}

export function emptyProjectsSnapshot(): ProjectsSnapshot {
  return { version: 1, projects: [] };
}
