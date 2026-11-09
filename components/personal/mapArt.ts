// Shared by the browser composition and the downloadable SVG authoring script.
// These histories are illustrative. Coordinates place independently fitted maps.
export type MapArtStudy = "one-life" | "shared-places";

export const mapArtStudies = {
  "one-life": {
    title: "Two places, one history",
    width: 1200,
    height: 1200,
    description: "An illustrative history between Amsterdam and Los Angeles. Their real street drawings overlap in red and black ink.",
    layers: [
      { city: "amsterdam", x: -5, y: -25, size: 930, opacity: 0.76, arrival: "first" },
      { city: "los-angeles", x: 275, y: 315, size: 930, opacity: 0.74, arrival: "second" },
    ],
    labels: [
      { name: "Amsterdam", x: 85, y: 105, red: true, anchor: "start" },
      { name: "Los Angeles", x: 1120, y: 1150, red: false, anchor: "bottom-end" },
    ],
    threads: ["M344 358 C410 405 405 530 528 620 S724 685 800 798"],
  },
  "shared-places": {
    title: "Several histories, a shared place",
    width: 1500,
    height: 1300,
    description: "Three imagined histories meet in Amsterdam. Its red street impression overlaps black drawings of the Los Angeles, Pasadena and Long Beach areas.",
    layers: [
      { city: "los-angeles", x: -90, y: -15, size: 670, opacity: 0.50, arrival: "first" },
      { city: "pasadena", x: 845, y: 15, size: 630, opacity: 0.53, arrival: "second" },
      { city: "long-beach", x: 825, y: 700, size: 630, opacity: 0.52, arrival: "second" },
      { city: "amsterdam", x: 330, y: 280, size: 780, opacity: 0.80, arrival: "shared" },
    ],
    labels: [
      { name: "Los Angeles", x: 90, y: 650, red: false, anchor: "start" },
      { name: "Pasadena", x: 1390, y: 130, red: false, anchor: "end" },
      { name: "Long Beach", x: 1390, y: 1230, red: false, anchor: "bottom-end" },
      { name: "Amsterdam", x: 400, y: 1080, red: true, anchor: "start" },
    ],
    threads: [
      "M280 330 C365 435 480 430 607 585 S760 688 827 743",
      "M1155 330 C1080 404 1080 555 931 588 S730 619 621 677",
      "M1130 1040 C1030 1002 1032 853 905 819 S747 786 710 713",
    ],
  },
};
