export interface CaseStudyStage {
  readonly name: string;
  readonly detail: string;
}

export interface CaseStudyRelatedLink {
  readonly label: string;
  readonly href: string;
  readonly note: string;
}

export interface CaseStudyContent {
  readonly slug: string;
  readonly title: string;
  readonly status: "Active R&D";
  readonly outcome: string;
  readonly problem: string;
  readonly constraint: string;
  readonly mechanism: string;
  readonly architecture: readonly CaseStudyStage[];
  readonly limits: readonly string[];
  readonly artifact: string;
  readonly related: readonly CaseStudyRelatedLink[];
}

export const caseStudies: Readonly<Record<string, CaseStudyContent>> = {
  "splash-ink": {
    slug: "splash-ink",
    title: "Splash Ink",
    status: "Active R&D",
    outcome:
      "A research pipeline that lifts a single classical ink painting into an explorable spatial scene, rendered as Gaussian splats inside a scroll-driven web viewer.",
    problem:
      "Classical 山水 and 水墨 paintings are deliberately flat: one viewpoint, no parallax, no second exposure, no depth ground truth. Everything a conventional photogrammetry or multi-view reconstruction pipeline requires is missing by construction, so turning one painting into a scene a camera can move through means the missing structure has to be inferred — and the inference has to be inspectable rather than hidden.",
    constraint:
      "The pipeline gets exactly one image per scene. The full-quality reconstruction model needs CUDA 12 and roughly 8 GB of VRAM, while the finished scene still has to travel to an ordinary browser and stay smooth under native scrolling. Each painting also carries its own attribution and license, tracked per entry in the dataset manifest.",
    mechanism:
      "A Python pipeline prepares the source painting, estimates depth, and initializes a point set, then optimizes a single-image 3D Gaussian Splatting representation from those points. A stub model mode runs the identical pipeline stages on CPU so the system stays testable end to end without the CUDA model. Each reconstructed scene gets an authored camera path through an inspection step, and a scroll-driven Three.js web viewer plays that path back as the visitor moves through the page.",
    architecture: [
      {
        name: "Prepare",
        detail:
          "Each painting enters from a manifest that records per-painting attribution and license, then is normalized for reconstruction.",
      },
      {
        name: "Depth and points",
        detail:
          "A monocular depth estimate seeds the initial point set, standing in for the multi-view geometry a single painting cannot provide.",
      },
      {
        name: "Splat optimization",
        detail:
          "3D Gaussian Splatting optimizes the scene from the initialized points — on the real CUDA model when available, or in stub mode to exercise the pipeline on CPU.",
      },
      {
        name: "Camera authoring",
        detail:
          "An inspection tool steps through each reconstructed scene so a deliberate camera path can be authored per painting rather than generated blindly.",
      },
      {
        name: "Delivery",
        detail:
          "A scroll-driven web viewer binds the authored camera path to native scrolling, keeping the scene explorable without hijacking the page.",
      },
    ],
    limits: [
      "One painting is an under-constrained input: regions the artist never painted must be inferred, so occluded areas can come out sparse, smeared, or invented.",
      "Reconstruction quality depends heavily on the source image; compositions without usable depth cues fall apart spatially.",
      "The full-quality model requires CUDA 12 and roughly 8 GB of VRAM. The CPU stub mode proves the pipeline runs, not that the reconstruction looks good.",
      "Every scene currently needs a hand-authored camera path. This is a research prototype with per-painting effort, not a self-serve reconstruction product.",
    ],
    artifact:
      "Python reconstruction pipeline and scroll-driven web viewer, each with their own test suites: pipeline tests, web unit tests, and end-to-end viewer tests.",
    related: [
      {
        label: "Spectral World Player",
        href: "/work/spectral-world",
        note: "The companion real-time lab: audio analysis driving a Three.js world under a frame budget.",
      },
      {
        label: "Field notes",
        href: "/blog",
        note: "Technical writing on production systems and the boundaries this practice works on.",
      },
    ],
  },
  "spectral-world": {
    slug: "spectral-world",
    title: "Spectral World Player",
    status: "Active R&D",
    outcome:
      "A browser application that turns one local audio file into a living 3D world — terrain, pillars, particles, and forward flight — driven entirely by real-time audio analysis, with no backend and no upload.",
    problem:
      "Most audio visualizers draw the FFT directly and end up looking like charts. The research question here is interpretation: deciding what each spectral region should mean spatially, so a bass swell reads as weight and gravity, mids read as architecture breathing, highs read as scattered light — and a beat is an event in the world rather than a spike on a graph.",
    constraint:
      "Everything must run inside one browser tab at interactive frame rates. Audio analysis, mapping, and rendering share a single main thread; the audio file never leaves the machine; and the world has to react within a frame of the music while keeping frame time stable enough that the reaction is believable.",
    mechanism:
      "A local file feeds the Web Audio API, where an AnalyserNode produces a 2048-point FFT. Feature extraction folds the bins into seven perceptually spaced bands plus volume and centroid; per-feature attack and release envelopes smooth them; a bass-energy detector with a cooldown window fires beats; spectral-flux onset detection separates kick, snare, and hat events; and rolling energy memory detects builds and drops across the whole track. A fingerprint of the song's opening seconds deterministically selects one of three directed world themes, and a mapping layer translates the interpreted features into world signals that drive instanced pillars, typed-array particles, pooled shockwaves, and camera motion.",
    architecture: [
      {
        name: "Analyze",
        detail:
          "Web Audio AnalyserNode FFT becomes seven frequency bands with volume and spectral centroid, extracted every frame from the local file.",
      },
      {
        name: "Interpret",
        detail:
          "Attack/release smoothing, energy-history beat detection with a cooldown, per-band onsets, and rolling build/drop memory turn raw bands into musical events.",
      },
      {
        name: "Direct",
        detail:
          "A deterministic song fingerprint picks one of three themes — each owning palette, fog, flight speed, and a salience budget so one hero layer leads instead of every effect competing.",
      },
      {
        name: "Render",
        detail:
          "Instanced pillar rings, typed-array particle systems, pooled shockwave meshes, and preallocated scratch buffers keep the frame loop allocation-free, with quality presets trading visual density for frame time.",
      },
    ],
    limits: [
      "Desktop-focused: there are no touch controls and no mobile-tuned camera yet.",
      "Terrain deformation runs on the CPU each frame; GPU shader displacement is a roadmap item, not shipped.",
      "Theme changes snap rather than cross-fade, and section-aware transitions are not built.",
      "Beat and onset interpretation depends on the recording. 60 fps on a modern desktop at the medium preset is the design target, not a measured guarantee across devices.",
      "One local file per session; all state is in-memory and disappears with the tab.",
    ],
    artifact:
      "Vite, TypeScript, and Three.js application. The deterministic audio pipeline — smoothing, feature extraction, beat and onset detection, memory, theming, and mapping — is covered by unit tests; the scene graph is exercised manually in the browser.",
    related: [
      {
        label: "Splash Ink",
        href: "/work/splash-ink",
        note: "The companion research prototype: a single painting lifted into an explorable splat scene.",
      },
      {
        label: "KOTA",
        href: "/work/kota",
        note: "The production counterpart: real-time audio interpreted under live operational constraints.",
      },
    ],
  },
};

export function getCaseStudy(slug: string): CaseStudyContent | undefined {
  return caseStudies[slug];
}
