export interface ResourceCandidateBundle<TTerrain, TGroups> {
  readonly terrain: TTerrain;
  readonly groups: TGroups;
}

export interface ResourceCandidateBundleFactory<TTerrain, TGroups> {
  createTerrain(): TTerrain;
  createGroups(): TGroups;
  disposeTerrain(terrain: TTerrain): void;
}

export interface ResourceSwapOperations<TResource> {
  createCandidate(): TResource;
  attachCandidate(candidate: TResource): void;
  detachCurrent(current: TResource): void;
  disposeResource(resource: TResource): void;
  retireCurrent?(current: TResource): void;
}

export interface ResourceSwapResult<TResource> {
  readonly current: TResource;
  readonly replaced: boolean;
  readonly error?: unknown;
}

export function createResourceCandidateBundle<TTerrain, TGroups>({
  createTerrain,
  createGroups,
  disposeTerrain,
}: ResourceCandidateBundleFactory<
  TTerrain,
  TGroups
>): ResourceCandidateBundle<TTerrain, TGroups> {
  const terrain = createTerrain();

  try {
    return { terrain, groups: createGroups() };
  } catch (error) {
    disposeTerrain(terrain);
    throw error;
  }
}

function disposeWithoutThrowing<TResource>(
  resource: TResource,
  disposeResource: (resource: TResource) => void,
): unknown {
  try {
    disposeResource(resource);
    return undefined;
  } catch (error) {
    return error;
  }
}

export function swapResourceCandidate<TResource>(
  current: TResource,
  operations: ResourceSwapOperations<TResource>,
): ResourceSwapResult<TResource> {
  let candidate: TResource;

  try {
    candidate = operations.createCandidate();
  } catch (error) {
    return { current, replaced: false, error };
  }

  try {
    operations.attachCandidate(candidate);
  } catch (error) {
    disposeWithoutThrowing(candidate, operations.disposeResource);
    return { current, replaced: false, error };
  }

  try {
    operations.detachCurrent(current);
  } catch (error) {
    disposeWithoutThrowing(candidate, operations.disposeResource);
    return { current, replaced: false, error };
  }

  const disposalError = disposeWithoutThrowing(
    current,
    operations.retireCurrent ?? operations.disposeResource,
  );
  return {
    current: candidate,
    replaced: true,
    ...(disposalError === undefined ? {} : { error: disposalError }),
  };
}
