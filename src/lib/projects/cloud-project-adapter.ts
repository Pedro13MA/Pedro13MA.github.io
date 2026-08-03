/**
 * FASE 8.1 — CloudProjectAdapter activo.
 */

import type { ProjectStorageAdapter } from "@/lib/projects/storage-adapter";
import type { ProjectsSnapshot } from "@/lib/projects/types";
import { LocalProjectAdapter } from "@/lib/projects/local-project-adapter";
import {
  cloudGet,
  cloudPut,
  getCachedEtag,
  setCachedEtag,
} from "@/lib/sync/cloud-api";
import { operationQueue } from "@/lib/sync/operation-queue";

const local = new LocalProjectAdapter();

export class CloudProjectAdapter implements ProjectStorageAdapter {
  readonly name = "cloud";

  async load(): Promise<ProjectsSnapshot> {
    try {
      const etag = getCachedEtag("projects");
      const res = await cloudGet<ProjectsSnapshot>("projects", etag);
      if (res.status === 304) return local.load();
      if (res.data?.items) {
        setCachedEtag("projects", res.data.etag);
        await local.save(res.data.items);
        return res.data.items;
      }
      return local.load();
    } catch {
      return local.load();
    }
  }

  async save(snapshot: ProjectsSnapshot): Promise<void> {
    await local.save(snapshot);
    try {
      const res = await cloudPut<ProjectsSnapshot>("projects", {
        items: snapshot,
      });
      setCachedEtag("projects", res.etag);
    } catch {
      operationQueue.enqueue("projects", "PUT", "projects", { items: snapshot });
    }
  }

  async sync(): Promise<void> {
    const snap = await this.load();
    await this.save(snap);
  }
}
