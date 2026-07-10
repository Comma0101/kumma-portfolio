export const PAGE_TRANSITION_SECONDS = 0.35;

interface NavigationIntent {
  button: number;
  metaKey: boolean;
  ctrlKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
  target: string;
  download: boolean;
}

export const shouldAnimateNavigation = ({
  button,
  metaKey,
  ctrlKey,
  shiftKey,
  altKey,
  target,
  download,
}: NavigationIntent) =>
  button === 0 &&
  !metaKey &&
  !ctrlKey &&
  !shiftKey &&
  !altKey &&
  target !== "_blank" &&
  !download;
