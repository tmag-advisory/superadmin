import { useEffect, useId, useRef, type ReactNode, type RefObject } from "react";
import { X } from "lucide-react";
import { cn } from "../lib/utils";

interface ModalProps {
    open: boolean;
    onClose: () => void;
    title: string;
    description?: string;
    children: ReactNode;
    /** Tailwind max-width class for the panel. */
    maxWidth?: string;
    /** Element to focus first when the modal opens (defaults to the first focusable). */
    initialFocusRef?: RefObject<HTMLElement | null>;
}

const FOCUSABLE =
    'a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])';

/**
 * Accessible modal: traps Tab focus, closes on Escape, restores focus to the
 * previously-focused element on close, and is labelled via `aria-labelledby`.
 */
export default function Modal({
    open,
    onClose,
    title,
    description,
    children,
    maxWidth = "max-w-md",
    initialFocusRef,
}: ModalProps) {
    const panelRef = useRef<HTMLDivElement>(null);
    const titleId = useId();
    const descId = useId();

    useEffect(() => {
        if (!open) return;
        const previouslyFocused = document.activeElement as HTMLElement | null;
        const panel = panelRef.current;

        const focusTarget =
            initialFocusRef?.current ??
            panel?.querySelector<HTMLElement>(FOCUSABLE) ??
            panel;
        focusTarget?.focus();

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                e.stopPropagation();
                onClose();
                return;
            }
            if (e.key !== "Tab" || !panel) return;
            const nodes = Array.from(
                panel.querySelectorAll<HTMLElement>(FOCUSABLE),
            ).filter((el) => el.offsetParent !== null || el === document.activeElement);
            if (nodes.length === 0) {
                e.preventDefault();
                panel.focus();
                return;
            }
            const first = nodes[0];
            const last = nodes[nodes.length - 1];
            const active = document.activeElement;
            if (e.shiftKey) {
                if (active === first || !panel.contains(active)) {
                    e.preventDefault();
                    last.focus();
                }
            } else if (active === last || !panel.contains(active)) {
                e.preventDefault();
                first.focus();
            }
        };

        document.addEventListener("keydown", onKeyDown, true);
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", onKeyDown, true);
            document.body.style.overflow = prevOverflow;
            previouslyFocused?.focus?.();
        };
    }, [open, onClose, initialFocusRef]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/50"
                onClick={onClose}
                aria-hidden="true"
            />
            <div
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                aria-describedby={description ? descId : undefined}
                tabIndex={-1}
                className={cn(
                    "relative bg-white rounded-2xl w-full p-6 shadow-xl outline-none max-h-[90vh] overflow-y-auto",
                    maxWidth,
                )}
            >
                <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="min-w-0">
                        <h2 id={titleId} className="text-lg font-semibold text-heading">
                            {title}
                        </h2>
                        {description && (
                            <p id={descId} className="text-sm text-muted mt-1">
                                {description}
                            </p>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close dialog"
                        className="p-2 -m-2 rounded-lg text-muted hover:text-heading hover:bg-gray-50 transition-colors shrink-0"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
}
