export interface DisposableResource {
  dispose(): void;
}

export interface ResourceTracker {
  readonly size: number;
  track<T extends DisposableResource>(resource: T): T;
  dispose(): void;
}

export function createResourceTracker(): ResourceTracker {
  const resources = new Set<DisposableResource>();
  let disposed = false;

  return {
    get size() {
      return resources.size;
    },
    track<T extends DisposableResource>(resource: T): T {
      if (disposed) {
        throw new Error("Cannot track a resource after disposal.");
      }
      resources.add(resource);
      return resource;
    },
    dispose(): void {
      if (disposed) return;
      disposed = true;
      const pending = Array.from(resources);
      resources.clear();
      let firstError: unknown;
      for (const resource of pending) {
        try {
          resource.dispose();
        } catch (error) {
          firstError ??= error;
        }
      }
      if (firstError !== undefined) throw firstError;
    },
  };
}

export function withTrackedResources<T>(
  build: (tracker: ResourceTracker) => T,
): T {
  const tracker = createResourceTracker();
  try {
    return build(tracker);
  } catch (error) {
    try {
      tracker.dispose();
    } catch {
      // Preserve the construction failure; cleanup failures are secondary here.
    }
    throw error;
  }
}
