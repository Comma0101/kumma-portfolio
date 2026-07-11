import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import {
  clamp01,
  getImmersiveProfile,
  getImmersiveStage,
  immersiveStageIds,
  immersiveStages,
  sampleImmersiveJourney,
  sampleStagePair,
  smoothstep,
} from "./immersiveStages";
import type {
  ImmersiveProfile,
  ImmersiveSceneSample,
  ImmersiveStageId,
  ImmersiveStageKeyframe,
  SceneGroupKey,
  Vec3,
} from "./types";

const profiles: readonly ImmersiveProfile[] = [
  "desktop",
  "mobile",
  "reduced",
];

const groupKeys: readonly SceneGroupKey[] = [
  "horizon",
  "signals",
  "voice",
  "document",
  "orchestration",
  "splats",
  "measurement",
];

const dominantGroupByStage: Readonly<Record<ImmersiveStageId, SceneGroupKey>> = {
  hero: "horizon",
  proof: "signals",
  kota: "voice",
  audiobook: "document",
  archon: "orchestration",
  "splash-ink": "splats",
  "research-labs": "measurement",
  contact: "horizon",
};

if (false) {
  // @ts-expect-error Ordered stage IDs are compile-time readonly.
  immersiveStageIds.push("hero");

  // @ts-expect-error Stage definitions are compile-time readonly.
  immersiveStages[0].id = "proof";

  // @ts-expect-error Nested profile keyframes are compile-time readonly.
  immersiveStages[0].profiles.desktop.camera.position.x = 999;

  // @ts-expect-error Nested group weights are compile-time readonly.
  immersiveStages[0].profiles.mobile.groups.horizon = 0;
}

function sumWeights(
  groups: ImmersiveStageKeyframe["groups"],
): number {
  return groupKeys.reduce((sum, key) => sum + groups[key], 0);
}

function distance(a: Vec3, b: Vec3): number {
  return Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
}

function totalCameraTravel(profile: ImmersiveProfile): number {
  return immersiveStages.slice(1).reduce((total, stage, index) => {
    const previous = immersiveStages[index];

    return (
      total +
      distance(
        previous.profiles[profile].camera.position,
        stage.profiles[profile].camera.position,
      )
    );
  }, 0);
}

function numericRange(values: readonly number[]): number {
  return Math.max(...values) - Math.min(...values);
}

function interpolateHex(from: string, to: string, progress: number): string {
  const parse = (color: string) => [
    Number.parseInt(color.slice(1, 3), 16),
    Number.parseInt(color.slice(3, 5), 16),
    Number.parseInt(color.slice(5, 7), 16),
  ];
  const fromChannels = parse(from);
  const toChannels = parse(to);
  const channels = fromChannels.map((channel, index) =>
    Math.round(channel + (toChannels[index] - channel) * progress),
  );

  return `#${channels
    .map((channel) => channel.toString(16).padStart(2, "0"))
    .join("")}`;
}

function sceneState(sample: ImmersiveSceneSample) {
  return {
    camera: sample.camera,
    fog: sample.fog,
    terrain: sample.terrain,
    groups: sample.groups,
  };
}

function assertDeeplyFrozen(value: unknown, seen = new Set<object>()): void {
  if (value === null || typeof value !== "object" || seen.has(value)) {
    return;
  }

  seen.add(value);
  assert.equal(Object.isFrozen(value), true, "every definition node must be frozen");

  for (const child of Object.values(value)) {
    assertDeeplyFrozen(child, seen);
  }
}

describe("immersive stage contract", () => {
  it("keeps the eight approved spatial stages in exact journey order", () => {
    assert.deepEqual(immersiveStageIds, [
      "hero",
      "proof",
      "kota",
      "audiobook",
      "archon",
      "splash-ink",
      "research-labs",
      "contact",
    ]);
    assert.deepEqual(
      immersiveStages.map((stage) => stage.id),
      immersiveStageIds,
    );
    assert.deepEqual(
      immersiveStages.map((stage) => stage.space),
      [
        "open horizon",
        "signal corridor",
        "voice tunnel",
        "document chamber",
        "orchestration constellation",
        "splat landscape",
        "measurement plane",
        "quiet horizon",
      ],
    );
  });

  it("makes each stage mechanism dominant in every profile", () => {
    for (const stage of immersiveStages) {
      for (const profile of profiles) {
        const weights = stage.profiles[profile].groups;
        const dominant = dominantGroupByStage[stage.id];
        const competingMaximum = Math.max(
          ...groupKeys
            .filter((key) => key !== dominant)
            .map((key) => weights[key]),
        );

        assert.ok(
          weights[dominant] > competingMaximum,
          `${stage.id}/${profile} must visibly favor ${dominant}`,
        );
      }
    }
  });

  it("defines finite camera, fog, and numeric terrain values", () => {
    for (const stage of immersiveStages) {
      for (const profile of profiles) {
        const keyframe = stage.profiles[profile];
        const numericValues = [
          ...Object.values(keyframe.camera.position),
          ...Object.values(keyframe.camera.target),
          keyframe.camera.fov,
          keyframe.fog.density,
          ...Object.values(keyframe.terrain),
          ...Object.values(keyframe.groups),
        ];

        assert.equal(
          numericValues.every(Number.isFinite),
          true,
          `${stage.id}/${profile} must contain only finite numbers`,
        );
        assert.match(keyframe.fog.color, /^#[0-9a-f]{6}$/);
      }
    }
  });

  it("deep-freezes ordered IDs and every nested stage definition at runtime", () => {
    assertDeeplyFrozen(immersiveStageIds);
    assertDeeplyFrozen(immersiveStages);
  });

  it("looks up known stages and rejects unknown runtime IDs", () => {
    assert.equal(getImmersiveStage("kota").id, "kota");
    assert.throws(
      () => getImmersiveStage("unknown" as ImmersiveStageId),
      /unknown immersive stage.*unknown/i,
    );
    assert.throws(
      () =>
        sampleStagePair(
          "hero",
          "unknown" as ImmersiveStageId,
          0.5,
          "desktop",
        ),
      /unknown immersive stage.*unknown/i,
    );
  });
});

describe("immersive profile and easing helpers", () => {
  it("clamps finite and non-finite progress deterministically", () => {
    assert.equal(clamp01(-0.2), 0);
    assert.equal(clamp01(0.4), 0.4);
    assert.equal(clamp01(1.2), 1);
    assert.equal(clamp01(Number.NaN), 0);
    assert.equal(clamp01(Number.NEGATIVE_INFINITY), 0);
    assert.equal(clamp01(Number.POSITIVE_INFINITY), 1);
  });

  it("uses a clamped smoothstep curve", () => {
    assert.equal(smoothstep(-1), 0);
    assert.equal(smoothstep(0), 0);
    assert.equal(smoothstep(0.25), 0.15625);
    assert.equal(smoothstep(0.5), 0.5);
    assert.equal(smoothstep(1), 1);
    assert.equal(smoothstep(2), 1);
  });

  it("selects reduced motion first and switches mobile at 768px", () => {
    assert.equal(
      getImmersiveProfile({ reducedMotion: true, width: 1440 }),
      "reduced",
    );
    assert.equal(
      getImmersiveProfile({ reducedMotion: true, width: 390 }),
      "reduced",
    );
    assert.equal(
      getImmersiveProfile({ reducedMotion: false, width: 0 }),
      "mobile",
    );
    assert.equal(
      getImmersiveProfile({ reducedMotion: false, width: 767 }),
      "mobile",
    );
    assert.equal(
      getImmersiveProfile({ reducedMotion: false, width: 768 }),
      "desktop",
    );
    assert.equal(
      getImmersiveProfile({ reducedMotion: false, width: 1440 }),
      "desktop",
    );
  });
});

describe("adjacent immersive stage sampling", () => {
  it("matches the applicable desktop and mobile keyframes at both endpoints", () => {
    for (const profile of ["desktop", "mobile"] as const) {
      for (let index = 0; index < immersiveStageIds.length - 1; index += 1) {
        const from = immersiveStages[index];
        const to = immersiveStages[index + 1];
        const start = sampleStagePair(from.id, to.id, 0, profile);
        const end = sampleStagePair(from.id, to.id, 1, profile);

        assert.deepEqual(sceneState(start), from.profiles[profile]);
        assert.deepEqual(sceneState(end), to.profiles[profile]);
      }
    }
  });

  it("interpolates numeric fields with smoothstep and exposes transition metadata", () => {
    const from = getImmersiveStage("hero").profiles.desktop;
    const to = getImmersiveStage("proof").profiles.desktop;
    const sample = sampleStagePair("hero", "proof", 0.25, "desktop");
    const eased = 0.15625;

    assert.equal(
      sample.camera.position.x,
      from.camera.position.x +
        (to.camera.position.x - from.camera.position.x) * eased,
    );
    assert.equal(
      sample.camera.target.y,
      from.camera.target.y +
        (to.camera.target.y - from.camera.target.y) * eased,
    );
    assert.equal(
      sample.terrain.elevation,
      from.terrain.elevation +
        (to.terrain.elevation - from.terrain.elevation) * eased,
    );
    assert.deepEqual(sample.transition, {
      dominantStageId: "hero",
      easedProgress: eased,
      fromId: "hero",
      intervalIndex: 0,
      isTransitioning: true,
      journeyProgress: 0.25 / (immersiveStageIds.length - 1),
      localProgress: 0.25,
      toId: "proof",
    });
  });

  it("interpolates fog color channel-by-channel deterministically", () => {
    const from = getImmersiveStage("archon").profiles.desktop.fog.color;
    const to = getImmersiveStage("splash-ink").profiles.desktop.fog.color;
    const sample = sampleStagePair(
      "archon",
      "splash-ink",
      0.25,
      "desktop",
    );

    assert.equal(sample.fog.color, interpolateHex(from, to, smoothstep(0.25)));
    assert.equal(
      sampleStagePair("archon", "splash-ink", 0, "desktop").fog.color,
      from,
    );
    assert.equal(
      sampleStagePair("archon", "splash-ink", 1, "desktop").fog.color,
      to,
    );
  });

  it("clamps pair progress and rejects non-adjacent stage pairs", () => {
    const from = getImmersiveStage("proof").profiles.desktop;
    const to = getImmersiveStage("kota").profiles.desktop;

    assert.deepEqual(
      sceneState(sampleStagePair("proof", "kota", Number.NaN, "desktop")),
      from,
    );
    assert.deepEqual(
      sceneState(
        sampleStagePair(
          "proof",
          "kota",
          Number.POSITIVE_INFINITY,
          "desktop",
        ),
      ),
      to,
    );
    assert.throws(
      () => sampleStagePair("hero", "archon", 0.5, "desktop"),
      /adjacent.*hero.*archon/i,
    );
  });
});

describe("global immersive journey sampling", () => {
  it("clamps to exact first and last desktop keyframes", () => {
    assert.deepEqual(
      sceneState(sampleImmersiveJourney(-1, "desktop")),
      immersiveStages[0].profiles.desktop,
    );
    assert.deepEqual(
      sceneState(sampleImmersiveJourney(Number.NaN, "desktop")),
      immersiveStages[0].profiles.desktop,
    );
    assert.deepEqual(
      sceneState(sampleImmersiveJourney(99, "desktop")),
      immersiveStages.at(-1)?.profiles.desktop,
    );
    assert.deepEqual(
      sceneState(
        sampleImmersiveJourney(Number.POSITIVE_INFINITY, "desktop"),
      ),
      immersiveStages.at(-1)?.profiles.desktop,
    );
  });

  it("maps 0..1 across all seven adjacent intervals", () => {
    const intervalCount = immersiveStageIds.length - 1;

    for (let index = 0; index < immersiveStages.length; index += 1) {
      const boundary = sampleImmersiveJourney(index / intervalCount, "mobile");
      assert.deepEqual(sceneState(boundary), immersiveStages[index].profiles.mobile);
      assert.equal(boundary.transition.dominantStageId, immersiveStages[index].id);
    }

    const intervalIndex = 3;
    const localProgress = 0.25;
    const global = sampleImmersiveJourney(
      (intervalIndex + localProgress) / intervalCount,
      "desktop",
    );
    const direct = sampleStagePair(
      immersiveStageIds[intervalIndex],
      immersiveStageIds[intervalIndex + 1],
      localProgress,
      "desktop",
    );

    assert.deepEqual(global, direct);
    assert.equal(global.transition.intervalIndex, intervalIndex);
    assert.equal(global.transition.journeyProgress, (intervalIndex + localProgress) / intervalCount);
  });

  it("keeps weights normalized at every keyframe and representative sample", () => {
    for (const stage of immersiveStages) {
      for (const profile of profiles) {
        assert.ok(
          Math.abs(sumWeights(stage.profiles[profile].groups) - 1) < 1e-12,
          `${stage.id}/${profile} weights must total one`,
        );
      }
    }

    for (const profile of profiles) {
      for (let index = 0; index < immersiveStageIds.length - 1; index += 1) {
        for (const localProgress of [0, 0.25, 0.5, 0.75, 1]) {
          const sample = sampleStagePair(
            immersiveStageIds[index],
            immersiveStageIds[index + 1],
            localProgress,
            profile,
          );

          assert.ok(
            Math.abs(sumWeights(sample.groups) - 1) < 1e-12,
            `${profile} interval ${index} at ${localProgress} must stay normalized`,
          );
        }
      }
    }
  });
});

describe("responsive and reduced-motion stage behavior", () => {
  it("restrains mobile camera travel, FOV variation, and fog-density variation", () => {
    const desktopTravel = totalCameraTravel("desktop");
    const mobileTravel = totalCameraTravel("mobile");
    const desktopFovRange = numericRange(
      immersiveStages.map((stage) => stage.profiles.desktop.camera.fov),
    );
    const mobileFovRange = numericRange(
      immersiveStages.map((stage) => stage.profiles.mobile.camera.fov),
    );
    const desktopFogRange = numericRange(
      immersiveStages.map((stage) => stage.profiles.desktop.fog.density),
    );
    const mobileFogRange = numericRange(
      immersiveStages.map((stage) => stage.profiles.mobile.fog.density),
    );

    assert.ok(mobileTravel <= desktopTravel * 0.7);
    assert.ok(mobileFovRange < desktopFovRange);
    assert.ok(mobileFogRange < desktopFogRange);
  });

  it("quantizes reduced motion at the midpoint into static composed states", () => {
    const from = getImmersiveStage("kota").profiles.reduced;
    const to = getImmersiveStage("audiobook").profiles.reduced;

    for (const progress of [0, 0.1, 0.49]) {
      const sample = sampleStagePair(
        "kota",
        "audiobook",
        progress,
        "reduced",
      );
      assert.deepEqual(sceneState(sample), from);
      assert.equal(sample.transition.dominantStageId, "kota");
      assert.equal(sample.transition.easedProgress, 0);
      assert.equal(sample.transition.isTransitioning, false);
    }

    for (const progress of [0.5, 0.75, 1]) {
      const sample = sampleStagePair(
        "kota",
        "audiobook",
        progress,
        "reduced",
      );
      assert.deepEqual(sceneState(sample), to);
      assert.equal(sample.transition.dominantStageId, "audiobook");
      assert.equal(sample.transition.easedProgress, 1);
      assert.equal(sample.transition.isTransitioning, false);
    }
  });

  it("keeps global reduced-motion samples discrete on both sides of a boundary", () => {
    const intervalCount = immersiveStageIds.length - 1;
    const intervalIndex = 5;
    const before = sampleImmersiveJourney(
      (intervalIndex + 0.49) / intervalCount,
      "reduced",
    );
    const after = sampleImmersiveJourney(
      (intervalIndex + 0.5) / intervalCount,
      "reduced",
    );

    assert.deepEqual(
      sceneState(before),
      getImmersiveStage("splash-ink").profiles.reduced,
    );
    assert.deepEqual(
      sceneState(after),
      getImmersiveStage("research-labs").profiles.reduced,
    );
  });
});

describe("immersive model purity", () => {
  it("does not import rendering frameworks or access browser/time globals", () => {
    for (const file of ["types.ts", "immersiveStages.ts"]) {
      const source = fs.readFileSync(
        path.resolve(process.cwd(), "components/immersive", file),
        "utf8",
      );

      assert.doesNotMatch(
        source,
        /from\s+["'](?:react|gsap|three|@react-three\/[^"']+|framer-motion)["']/,
      );
      assert.doesNotMatch(
        source,
        /(?:\b(?:window|document|navigator)\s*(?:\.|\[)|\btypeof\s+(?:window|document|navigator)\b|\bglobalThis\.(?:window|document|navigator)\b)/,
      );
      assert.doesNotMatch(source, /\b(?:Date\.now|performance\.now|Math\.random)\b/);
    }
  });
});
