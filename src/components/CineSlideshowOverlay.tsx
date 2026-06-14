"use client";

import Image from "next/image";
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";

import type { CinemaSlide } from "@/game/data/cinema-slides";
import {
  getOpenedCinemaLinks,
  markCinemaLinkOpened,
} from "@/game/systems/cinema/visited-links";
import { setCineVideoOpen } from "@/game/ui-overlay-store";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseCinemaSlidesResponse(value: unknown): CinemaSlide[] | null {
  if (!isRecord(value) || !Array.isArray(value.slides)) {
    return null;
  }

  const parsedSlides = value.slides.map(parseCinemaSlide);

  return parsedSlides.every((slide) => slide !== null)
    ? parsedSlides
    : null;
}

function parseCinemaSlide(value: unknown): CinemaSlide | null {
  if (!isRecord(value) || typeof value.id !== "string" || typeof value.kind !== "string") {
    return null;
  }

  if (value.kind === "links") {
    if (!Array.isArray(value.items)) return null;
    const items = (value.items as unknown[]).map((item) => {
      if (!isRecord(item) || typeof item.url !== "string" || typeof item.label !== "string") {
        return null;
      }
      return { url: item.url, label: item.label };
    });
    return items.some((item) => item === null)
      ? null
      : { id: value.id, kind: "links", items: items as Array<{ url: string; label: string }> };
  }

  if (value.kind === "image") {
    return (
      typeof value.src === "string" &&
      typeof value.alt === "string" &&
      typeof value.fileName === "string"
    )
      ? {
          id: value.id,
          kind: "image",
          src: value.src,
          alt: value.alt,
          fileName: value.fileName,
        }
      : null;
  }

  if (value.kind === "video") {
    return (
      typeof value.src === "string" &&
      typeof value.label === "string" &&
      typeof value.fileName === "string"
    )
      ? {
          id: value.id,
          kind: "video",
          src: value.src,
          label: value.label,
          fileName: value.fileName,
        }
      : null;
  }

  if (value.kind === "youtube") {
    return (
      typeof value.youtubeId === "string" &&
      typeof value.label === "string"
    )
      ? {
          id: value.id,
          kind: "youtube",
          youtubeId: value.youtubeId,
          label: value.label,
        }
      : null;
  }

  return null;
}

function canRestoreFocus(element: HTMLElement | null): element is HTMLElement {
  if (!element || !element.isConnected) {
    return false;
  }

  if (typeof element.focus !== "function") {
    return false;
  }

  if (element.hasAttribute("disabled")) {
    return false;
  }

  const tabIndex = element.tabIndex;

  return (
    tabIndex >= 0 ||
    element.isContentEditable ||
    /^(A|AREA|BUTTON|IFRAME|INPUT|SELECT|TEXTAREA)$/.test(element.tagName)
  );
}

function isInteractiveElement(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  const tagName = target.tagName;

  return (
    target.isContentEditable ||
    tagName === "INPUT" ||
    tagName === "TEXTAREA" ||
    tagName === "SELECT" ||
    tagName === "BUTTON" ||
    tagName === "AUDIO" ||
    tagName === "VIDEO" ||
    tagName === "IFRAME" ||
    target.closest(
      'button, a[href], input, textarea, select, summary, [role="button"], [role="link"], [contenteditable="true"]',
    ) !== null
  );
}

export function CineSlideshowOverlay() {
  const [slides, setSlides] = useState<CinemaSlide[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [openedLinks, setOpenedLinks] = useState<Set<string>>(() => new Set());
  const [reloadToken, setReloadToken] = useState(0);
  const shellRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const titleId = useId();

  useEffect(() => {
    setOpenedLinks(new Set(getOpenedCinemaLinks()));
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function loadSlides() {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const response = await fetch("/api/cinema/slides", {
          method: "GET",
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`bad-status-${response.status}`);
        }

        const payload: unknown = await response.json();
        const nextSlides = parseCinemaSlidesResponse(payload);

        if (nextSlides === null) {
          throw new Error("invalid-payload");
        }

        setSlides(nextSlides);
        setCurrentIndex((index) =>
          nextSlides.length === 0 ? 0 : Math.min(index, nextSlides.length - 1),
        );
      } catch {
        if (controller.signal.aborted) {
          return;
        }

        setSlides([]);
        setCurrentIndex(0);
        setErrorMessage(
          "La pantalla se quedo en silencio. Intenta abrir la sala otra vez.",
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void loadSlides();

    return () => controller.abort();
  }, [reloadToken]);

  useEffect(() => {
    restoreFocusRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    window.requestAnimationFrame(() => {
      closeButtonRef.current?.focus();
    });

    return () => {
      if (canRestoreFocus(restoreFocusRef.current)) {
        restoreFocusRef.current.focus();
      }
    };
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented) {
        return;
      }

      if (event.key === "Escape") {
        event.preventDefault();
        setCineVideoOpen(false);
        return;
      }

      if (
        isLoading ||
        slides.length === 0 ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        isInteractiveElement(event.target)
      ) {
        return;
      }

      if (event.key === "ArrowLeft" || event.key === "a" || event.key === "A") {
        event.preventDefault();
        setCurrentIndex((index) => Math.max(0, index - 1));
      }

      if (event.key === "ArrowRight" || event.key === "d" || event.key === "D") {
        event.preventDefault();
        setCurrentIndex((index) => Math.min(slides.length - 1, index + 1));
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isLoading, slides]);

  const currentSlide = slides[currentIndex] ?? null;
  const positionLabel = useMemo(() => {
    if (slides.length === 0) {
      return "0 / 0";
    }

    return `${currentIndex + 1} / ${slides.length}`;
  }, [currentIndex, slides.length]);

  function handleExit() {
    setCineVideoOpen(false);
  }

  function handlePrevious() {
    setCurrentIndex((index) => Math.max(0, index - 1));
  }

  function handleNext() {
    setCurrentIndex((index) => Math.min(slides.length - 1, index + 1));
  }

  function handleLinkOpen(url: string) {
    const openedWindow = window.open(url, "_blank", "noopener,noreferrer");

    if (!openedWindow) {
      return;
    }

    markCinemaLinkOpened(url);
    setOpenedLinks((current) => {
      const next = new Set(current);
      next.add(url);
      return next;
    });
  }

  function renderCurrentSlide() {
    if (isLoading) {
      return (
        <div className="cine-slideshow-status">
          <p className="cine-slideshow-status-title">Preparando la funcion</p>
          <p className="cine-slideshow-status-body">
            Encendiendo el proyector y ordenando los recuerdos.
          </p>
        </div>
      );
    }

    if (errorMessage) {
      return (
        <div className="cine-slideshow-status is-error">
          <p className="cine-slideshow-status-title">No se pudo abrir la sala</p>
          <p className="cine-slideshow-status-body">{errorMessage}</p>
          <button
            className="cine-slideshow-link-button"
            onClick={() => setReloadToken((value) => value + 1)}
            type="button"
          >
            Reintentar
          </button>
        </div>
      );
    }

    if (!currentSlide) {
      return (
        <div className="cine-slideshow-status is-error">
          <p className="cine-slideshow-status-title">La cartelera esta vacia</p>
          <p className="cine-slideshow-status-body">
            Todavia no hay recuerdos cargados para esta sala.
          </p>
        </div>
      );
    }

    if (currentSlide.kind === "links") {
      return (
        <div className="cine-slideshow-links-panel">
          <ul className="cine-slideshow-links-list">
            {currentSlide.items.map((item) => {
              const isOpened = openedLinks.has(item.url);
              return (
                <li key={item.url} className="cine-slideshow-links-item">
                  <span className="cine-slideshow-links-url">{item.url}</span>
                  <button
                    className={`cine-slideshow-links-open${isOpened ? " is-opened" : ""}`}
                    onClick={() => handleLinkOpen(item.url)}
                    type="button"
                  >
                    {isOpened ? "Abierto" : "Abrir"}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      );
    }

    if (currentSlide.kind === "image") {
      return (
        <div className="cine-slideshow-stage-frame">
          <div className="cine-slideshow-image-wrap">
            <Image
              className="cine-slideshow-image"
              src={currentSlide.src}
              alt={currentSlide.alt}
              fill
              sizes="(max-width: 720px) 100vw, 940px"
              unoptimized
            />
          </div>
        </div>
      );
    }

    if (currentSlide.kind === "video") {
      return (
        <div className="cine-slideshow-stage-frame">
          <video
            className="cine-slideshow-video"
            controls
            playsInline
            preload="metadata"
            src={currentSlide.src}
          />
        </div>
      );
    }

    const embedUrl =
      `https://www.youtube.com/embed/${currentSlide.youtubeId}` +
      `?autoplay=1&rel=0&modestbranding=1`;

    return (
      <div className="cine-slideshow-stage-frame is-youtube">
        <iframe
          className="cine-slideshow-youtube"
          src={embedUrl}
          allow="autoplay; fullscreen"
          allowFullScreen
          title="Final del cine"
        />
      </div>
    );
  }

  function handleShellKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Tab" || !shellRef.current) {
      return;
    }

    const focusableElements = shellRef.current.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], iframe, video[controls], [tabindex]:not([tabindex="-1"])',
    );

    if (focusableElements.length === 0) {
      event.preventDefault();
      closeButtonRef.current?.focus();
      return;
    }

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    const activeElement =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    if (!event.shiftKey && activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }

    if (event.shiftKey && activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    }
  }

  return (
    <div className="cine-slideshow-overlay" onClick={handleExit}>
      <div
        className="cine-slideshow-shell"
        ref={shellRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onKeyDown={handleShellKeyDown}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          className="cine-slideshow-close"
          ref={closeButtonRef}
          onClick={handleExit}
          type="button"
          aria-label="Cerrar sala de cine"
        >
          X
        </button>

        <div className="cine-slideshow-header">
          <div>
            <p className="cine-slideshow-kicker">Cine de la plaza</p>
            <h1 className="cine-slideshow-title" id={titleId}>
              Sesion de recuerdos
            </h1>
          </div>
          <div className="cine-slideshow-position" aria-live="polite">
            {positionLabel}
          </div>
        </div>

        <div className="cine-slideshow-stage">{renderCurrentSlide()}</div>

        <div className="cine-slideshow-footer">
          <button
            className="cine-slideshow-nav"
            onClick={handlePrevious}
            type="button"
            disabled={isLoading || currentIndex <= 0}
          >
            Anterior
          </button>
          <button
            className="cine-slideshow-nav"
            onClick={handleNext}
            type="button"
            disabled={isLoading || slides.length === 0 || currentIndex >= slides.length - 1}
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
}
