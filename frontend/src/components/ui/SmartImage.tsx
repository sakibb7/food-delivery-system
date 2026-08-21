"use client";

import NextImage, { ImageProps as NextImageProps } from "next/image";
import { useState, useCallback, useRef, useEffect, CSSProperties } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type ObjectFit = "contain" | "cover" | "fill" | "none" | "scale-down";
type ObjectPosition = string
type LoadingStrategy = "lazy" | "eager";
type DecodeStrategy = "async" | "sync" | "auto";

export interface SmartImageProps
    extends Omit<NextImageProps, "onLoad" | "onError" | "placeholder" | "blurDataURL"> {
    // ── Core next/image passthrough ──────────────────────────────────────────
    src: string;
    alt: string;
    width?: number;
    height?: number;
    fill?: boolean;
    quality?: number;                  // 1–100, default 75
    priority?: boolean;                // disables lazy-load; use for LCP images
    loading?: LoadingStrategy;
    sizes?: string;                    // e.g. "(max-width: 768px) 100vw, 50vw"
    unoptimized?: boolean;             // skip Next.js image optimisation
    loader?: NextImageProps["loader"]; // custom loader function

    // ── Object fit / position ────────────────────────────────────────────────
    objectFit?: ObjectFit;            // default "cover"
    objectPosition?: ObjectPosition;  // default "center"

    // ── Placeholder / blur ───────────────────────────────────────────────────
    placeholder?: "blur" | "empty" | "none";
    blurDataURL?: string;             // base64 LQIP; required for external src + blur
    blurAmount?: 1 | 2 | 3;          // 1 → blur-sm, 2 → blur, 3 → blur-lg; default 2

    // ── Aspect ratio ─────────────────────────────────────────────────────────
    /**
     * Tailwind aspect-ratio class applied to the container.
     * e.g. "aspect-video", "aspect-square", "aspect-[4/3]"
     */
    aspectRatio?: string;

    // ── Styling ──────────────────────────────────────────────────────────────
    className?: string;               // applied to the <img> element
    containerClassName?: string;      // applied to the <figure> wrapper

    // ── Rounded corners ──────────────────────────────────────────────────────
    /**
     * true → "rounded-lg"; or any Tailwind class e.g. "rounded-full", "rounded-2xl"
     */
    rounded?: boolean | string;

    // ── Shadow ───────────────────────────────────────────────────────────────
    /**
     * true → "shadow-lg"; or any Tailwind class e.g. "shadow-xl", "shadow-2xl"
     */
    shadow?: boolean | string;

    // ── Overlay ──────────────────────────────────────────────────────────────
    overlay?: boolean;                // dark gradient scrim (good for text on images)
    overlayClassName?: string;        // override/extend overlay Tailwind classes
    overlayContent?: React.ReactNode; // content rendered above the overlay

    // ── Fallback / error ─────────────────────────────────────────────────────
    fallbackSrc?: string;             // swapped in when src fails to load
    fallbackElement?: React.ReactNode; // custom element shown on error (if no fallbackSrc)

    // ── Skeleton ─────────────────────────────────────────────────────────────
    showSkeleton?: boolean;           // animated shimmer while loading, default true
    skeletonClassName?: string;       // override/extend skeleton Tailwind classes

    // ── Zoom on hover ────────────────────────────────────────────────────────
    zoomOnHover?: boolean;
    /**
     * sm → scale-105, md → scale-110, lg → scale-125. Default "sm"
     */
    zoomScale?: "sm" | "md" | "lg";

    // ── Fade-in on load ──────────────────────────────────────────────────────
    fadeIn?: boolean;                 // opacity transition when image loads, default true
    /**
     * fast → 150ms, normal → 300ms, slow → 700ms. Default "normal"
     */
    fadeInDuration?: "fast" | "normal" | "slow";

    // ── Scroll reveal ────────────────────────────────────────────────────────
    revealOnScroll?: boolean;         // defer load until near viewport
    revealThreshold?: number;         // IntersectionObserver threshold 0–1, default 0.1

    // ── Decode ───────────────────────────────────────────────────────────────
    decoding?: DecodeStrategy;

    // ── Callbacks ────────────────────────────────────────────────────────────
    onLoad?: (event: React.SyntheticEvent<HTMLImageElement>) => void;
    onError?: (event: React.SyntheticEvent<HTMLImageElement>) => void;
    onVisible?: () => void;           // fires when image enters the viewport

    // ── Accessibility ────────────────────────────────────────────────────────
    role?: string;
    aria?: Record<string, string>;    // e.g. { label: "profile photo" }

    // ── Caption ──────────────────────────────────────────────────────────────
    caption?: string;
    captionClassName?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TRANSPARENT_PIXEL =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

const ZOOM_CLASS: Record<"sm" | "md" | "lg", string> = {
    sm: "hover:scale-105",
    md: "hover:scale-110",
    lg: "hover:scale-125",
};

const BLUR_CLASS: Record<1 | 2 | 3, string> = {
    1: "blur-sm",
    2: "blur",
    3: "blur-lg",
};

const FADE_DURATION_CLASS: Record<"fast" | "normal" | "slow", string> = {
    fast: "duration-150",
    normal: "duration-300",
    slow: "duration-700",
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function SmartImage({
    src,
    alt,
    width,
    height,
    fill,
    quality = 75,
    priority = false,
    loading,
    sizes,
    unoptimized = false,
    loader,

    objectFit = "cover",
    objectPosition = "center",

    placeholder = "none",
    blurDataURL,
    blurAmount = 2,

    aspectRatio,

    className = "",
    containerClassName = "",

    rounded,
    shadow,

    overlay = false,
    overlayClassName = "",
    overlayContent,

    fallbackSrc,
    fallbackElement,

    showSkeleton = true,
    skeletonClassName = "",

    zoomOnHover = false,
    zoomScale = "sm",

    fadeIn = true,
    fadeInDuration = "normal",

    revealOnScroll = false,
    revealThreshold = 0.1,

    decoding = "async",

    onLoad,
    onError,
    onVisible,

    role,
    aria = {},

    caption,
    captionClassName = "",

    ...rest
}: SmartImageProps) {
    const [loaded, setLoaded] = useState(false);
    const [errored, setErrored] = useState(false);
    const [inView, setInView] = useState(!revealOnScroll);

    const containerRef = useRef<HTMLElement>(null);
    const imgSrc = errored && fallbackSrc ? fallbackSrc : src;

    // ── Intersection Observer ─────────────────────────────────────────────────
    useEffect(() => {
        if (!revealOnScroll || inView) return;
        const el = containerRef.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setInView(true);
                    onVisible?.();
                    observer.disconnect();
                }
            },
            { threshold: revealThreshold }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, [revealOnScroll, inView, revealThreshold, onVisible]);

    // ── Handlers ──────────────────────────────────────────────────────────────
    const handleLoad = useCallback(
        (e: React.SyntheticEvent<HTMLImageElement>) => {
            setLoaded(true);
            onLoad?.(e);
        },
        [onLoad]
    );

    const handleError = useCallback(
        (e: React.SyntheticEvent<HTMLImageElement>) => {
            if (!errored) setErrored(true);
            onError?.(e);
        },
        [errored, onError]
    );

    // ── Derived classes ───────────────────────────────────────────────────────
    const roundedClass =
        rounded === true ? "rounded-lg" : typeof rounded === "string" ? rounded : "";

    const shadowClass =
        shadow === true ? "shadow-lg" : typeof shadow === "string" ? shadow : "";

    const imgBlurClass =
        placeholder !== "none" && !loaded ? BLUR_CLASS[blurAmount] : "";

    const imgFadeClass = fadeIn
        ? [
            "transition-opacity ease-in-out",
            FADE_DURATION_CLASS[fadeInDuration],
            loaded ? "opacity-100" : "opacity-0"
        ].filter(Boolean).join(" ")
        : "";

    const imgZoomClass = zoomOnHover
        ? ["transition-transform duration-300 ease-in-out", ZOOM_CLASS[zoomScale]].filter(Boolean).join(" ")
        : "";

    // ── next/image placeholder props ─────────────────────────────────────────
    const resolvedPlaceholder: NextImageProps["placeholder"] =
        placeholder === "blur" ? "blur" : placeholder === "empty" ? "empty" : undefined;

    const resolvedBlurDataURL =
        placeholder === "blur" ? (blurDataURL ?? TRANSPARENT_PIXEL) : undefined;

    // ── Aria spread ──────────────────────────────────────────────────────────
    const ariaProps = Object.fromEntries(
        Object.entries(aria).map(([k, v]) => [`aria-${k}`, v])
    );

    // ── objectFit / objectPosition via inline style ───────────────────────────
    // Tailwind's object-* classes don't cover all CSS values (e.g. custom positions)
    const imgInlineStyle: CSSProperties = { objectFit, objectPosition };

    // ─── Render ───────────────────────────────────────────────────────────────
    return (
        <figure
            ref={containerRef}
            className={[
                "relative overflow-hidden block",
                aspectRatio,
                fill ? "w-full h-full" : "",
                roundedClass,
                shadowClass,
                containerClassName
            ].filter(Boolean).join(" ")}
        >
            {/* ── Skeleton ────────────────────────────────────────────────────── */}
            {showSkeleton && !loaded && !errored && (
                <span
                    aria-hidden="true"
                    className={[
                        "absolute inset-0 z-10",
                        "animate-pulse bg-linear-to-r from-gray-200 via-gray-100 to-gray-200",
                        roundedClass,
                        skeletonClassName
                    ].filter(Boolean).join(" ")}
                />
            )}

            {/* ── Image ───────────────────────────────────────────────────────── */}
            {inView && !errored && (
                <NextImage
                    src={imgSrc}
                    alt={alt}
                    {...(fill ? { fill: true } : { width, height })}
                    quality={quality}
                    priority={priority}
                    loading={priority ? undefined : (loading ?? "lazy")}
                    sizes={sizes}
                    unoptimized={unoptimized}
                    loader={loader}
                    placeholder={resolvedPlaceholder}
                    blurDataURL={resolvedBlurDataURL}
                    decoding={decoding}
                    className={[imgBlurClass, imgFadeClass, imgZoomClass, className].filter(Boolean).join(" ")}
                    style={imgInlineStyle}
                    onLoad={handleLoad}
                    onError={handleError}
                    role={role}
                    {...ariaProps}
                    {...(rest as Record<string, unknown>)}
                />
            )}

            {/* ── Fallback element ─────────────────────────────────────────────── */}
            {errored && !fallbackSrc && fallbackElement && (
                <div className="absolute inset-0 flex items-center justify-center">
                    {fallbackElement}
                </div>
            )}

            {/* ── Overlay ──────────────────────────────────────────────────────── */}
            {overlay && (
                <span
                    aria-hidden="true"
                    className={[
                        "absolute inset-0 z-20 pointer-events-none",
                        "bg-linear-to-t from-black/65 via-transparent to-transparent",
                        overlayClassName
                    ].filter(Boolean).join(" ")}
                />
            )}

            {/* ── Overlay content ──────────────────────────────────────────────── */}
            {overlayContent && (
                <div className="absolute inset-0 z-30 flex items-end p-4">
                    {overlayContent}
                </div>
            )}

            {/* ── Caption ──────────────────────────────────────────────────────── */}
            {caption && (
                <figcaption
                    className={[
                        "absolute bottom-0 left-0 right-0 z-40",
                        "px-3 py-2 text-xs text-white bg-black/45",
                        captionClassName
                    ].filter(Boolean).join(" ")}
                >
                    {caption}
                </figcaption>
            )}
        </figure>
    );
}