import * as React from "react"
import { cn } from "../../lib/utils"
import { ChevronDown } from "lucide-react"

interface SelectProps {
    value?: string;
    onValueChange?: (value: string) => void;
    children: React.ReactNode;
}

interface SelectTriggerProps {
    className?: string;
    children: React.ReactNode;
}

interface SelectContentProps {
    children: React.ReactNode;
}

interface SelectItemProps {
    value: string;
    children: React.ReactNode;
}

interface SelectValueProps {
    placeholder?: string;
}

const SelectContext = React.createContext<{
    value?: string;
    onValueChange?: (value: string) => void;
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    selectedLabel?: string;
    setSelectedLabel?: (label: string) => void;
    setItems: (items: Array<{ value: string, label: string }>) => void;
}>({
    isOpen: false,
    setIsOpen: () => { },
    setItems: () => { },
});

const Select: React.FC<SelectProps> = ({ value, onValueChange, children }) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [selectedLabel, setSelectedLabel] = React.useState<string>('');
    const [items, setItems] = React.useState<Array<{ value: string, label: string }>>([]);

    // Update selected label when value changes from outside
    React.useEffect(() => {
        if (!value) {
            setSelectedLabel('');
        } else if (value && items.length > 0) {
            const item = items.find(item => item.value === value);
            if (item) {
                setSelectedLabel(item.label);
            }
        }
    }, [value, items]);

    return (
        <SelectContext.Provider value={{
            value,
            onValueChange,
            isOpen,
            setIsOpen,
            selectedLabel,
            setSelectedLabel,
            setItems
        }}>
            <div className="relative">
                {children}
            </div>
        </SelectContext.Provider>
    );
};

const SelectTrigger: React.FC<SelectTriggerProps> = ({ className, children }) => {
    const { isOpen, setIsOpen } = React.useContext(SelectContext);

    return (
        <button
            type="button"
            className={cn(
                "flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50",
                className
            )}
            onClick={() => setIsOpen(!isOpen)}
        >
            {children}
            <ChevronDown className="h-4 w-4 opacity-50" />
        </button>
    );
};

const SelectValue: React.FC<SelectValueProps> = ({ placeholder }) => {
    const { value, selectedLabel } = React.useContext(SelectContext);

    // Display selectedLabel if available, otherwise value, otherwise placeholder
    const displayValue = selectedLabel || value || placeholder;

    return (
        <span className="text-left truncate block">
            {displayValue && displayValue !== placeholder ? (
                <span className="text-gray-900">{displayValue}</span>
            ) : (
                <span className="text-gray-400">{placeholder}</span>
            )}
        </span>
    );
};

const SelectContent: React.FC<SelectContentProps> = ({ children }) => {
    const { isOpen, setIsOpen, setItems } = React.useContext(SelectContext);
    const ref = React.useRef<HTMLDivElement>(null);

    // Collect items from children
    React.useEffect(() => {
        const itemsData: Array<{ value: string, label: string }> = [];
        React.Children.forEach(children, (child) => {
            if (React.isValidElement(child)) {
                const props = child.props as any;
                if (props.value && props.children) {
                    let label = '';
                    if (typeof props.children === 'string') {
                        label = props.children;
                    } else if (Array.isArray(props.children)) {
                        label = props.children.join('');
                    } else {
                        label = String(props.children);
                    }

                    itemsData.push({
                        value: props.value,
                        label: label.trim()
                    });
                }
            }
        });
        setItems(itemsData);
    }, [children, setItems]);

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, setIsOpen]);

    if (!isOpen) return null;

    return (
        <div
            ref={ref}
            className="absolute top-full z-50 mt-1 w-full rounded-md border border-gray-200 bg-white p-1 text-gray-900 shadow-lg max-h-60 overflow-auto"
        >
            {children}
        </div>
    );
};

const SelectItem: React.FC<SelectItemProps> = ({ value, children }) => {
    const { onValueChange, setIsOpen, value: selectedValue, setSelectedLabel } = React.useContext(SelectContext);

    const handleClick = () => {
        onValueChange?.(value);
        // Safe label extraction
        const label = typeof children === 'string' ? children : value;
        setSelectedLabel?.(label);
        setIsOpen(false);
    };

    const isSelected = selectedValue === value;

    return (
        <div
            className={cn(
                "relative flex w-full cursor-pointer select-none items-center rounded-sm py-2 px-3 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100",
                isSelected && "bg-primary-50 text-primary-600 font-medium"
            )}
            onClick={handleClick}
        >
            {children}
        </div>
    );
};

export {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
}
