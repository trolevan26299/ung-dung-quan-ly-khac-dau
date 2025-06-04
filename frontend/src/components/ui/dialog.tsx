import * as React from "react"
import { cn } from "../../lib/utils"
import { X } from "lucide-react"

interface DialogProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    children: React.ReactNode;
}

interface DialogContentProps {
    className?: string;
    children: React.ReactNode;
}

interface DialogTriggerProps {
    asChild?: boolean;
    children: React.ReactNode;
}

const Dialog: React.FC<DialogProps> = ({ open = false, onOpenChange, children }) => {
    React.useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && onOpenChange) {
                onOpenChange(false);
            }
        };

        if (open) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [open, onOpenChange]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
                className="fixed inset-0 bg-black/50"
                onClick={() => onOpenChange?.(false)}
            />
            <div className="relative z-50 max-h-[90vh] overflow-auto">
                {children}
            </div>
        </div>
    );
};

const DialogTrigger: React.FC<DialogTriggerProps> = ({ asChild, children }) => {
    if (asChild) {
        return <>{children}</>;
    }
    return <div>{children}</div>;
};

const DialogContent: React.FC<DialogContentProps> = ({ className, children }) => (
    <div
        className={cn(
            "bg-white rounded-lg shadow-lg p-6 w-full max-w-md mx-4",
            className
        )}
    >
        {children}
    </div>
);

const DialogHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="flex flex-col space-y-1.5 text-center sm:text-left mb-4">
        {children}
    </div>
);

const DialogTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <h2 className="text-lg font-semibold leading-none tracking-tight">
        {children}
    </h2>
);

export {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
}
