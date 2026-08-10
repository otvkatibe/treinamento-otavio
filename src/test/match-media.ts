type LegacyMediaQueryListener = (
  this: MediaQueryList,
  event: MediaQueryListEvent,
) => void;

class DeterministicMediaQueryList extends EventTarget implements MediaQueryList {
  readonly media: string;
  onchange: ((this: MediaQueryList, ev: MediaQueryListEvent) => void) | null = null;
  private currentMatches: boolean;
  private readonly legacyListeners = new Set<LegacyMediaQueryListener>();

  constructor(media: string, matches: boolean) {
    super();
    this.media = media;
    this.currentMatches = matches;
  }

  get matches(): boolean {
    return this.currentMatches;
  }

  addListener(callback: LegacyMediaQueryListener | null): void {
    if (callback) {
      this.legacyListeners.add(callback);
    }
  }

  removeListener(callback: LegacyMediaQueryListener | null): void {
    if (callback) {
      this.legacyListeners.delete(callback);
    }
  }

  update(matches: boolean): void {
    if (matches === this.currentMatches) {
      return;
    }

    this.currentMatches = matches;
    const event = new Event('change') as MediaQueryListEvent;
    Object.defineProperties(event, {
      matches: { value: matches },
      media: { value: this.media },
    });

    this.onchange?.call(this, event);
    this.legacyListeners.forEach((listener) => listener.call(this, event));
    this.dispatchEvent(event);
  }
}

export interface MatchMediaController {
  getWidth(): number;
  setWidth(width: number): void;
}

function queryMatches(query: string, width: number): boolean {
  const maxWidth = /max-width:\s*([\d.]+)px/i.exec(query);
  const minWidth = /min-width:\s*([\d.]+)px/i.exec(query);

  if (maxWidth && width > Number(maxWidth[1])) {
    return false;
  }
  if (minWidth && width < Number(minWidth[1])) {
    return false;
  }
  return Boolean(maxWidth || minWidth);
}

export function installMatchMedia(initialWidth = 1024): MatchMediaController {
  let width = initialWidth;
  const mediaQueryLists = new Set<DeterministicMediaQueryList>();

  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: (query: string): MediaQueryList => {
      const mediaQueryList = new DeterministicMediaQueryList(
        query,
        queryMatches(query, width),
      );
      mediaQueryLists.add(mediaQueryList);
      return mediaQueryList;
    },
  });

  return {
    getWidth(): number {
      return width;
    },
    setWidth(nextWidth: number): void {
      width = nextWidth;
      mediaQueryLists.forEach((mediaQueryList) => {
        mediaQueryList.update(queryMatches(mediaQueryList.media, width));
      });
    },
  };
}
