// Global UI component type overrides for React 19 + Next.js 15 compatibility

declare global {
  namespace JSX {
    interface IntrinsicElements {
      // Allow any props on any HTML elements for compatibility
    }
  }
}

// Comprehensive Radix UI type overrides
declare module "@radix-ui/react-*" {
  interface ComponentProps {
    children?: React.ReactNode
    className?: string
  }
}

// Extend all Radix UI components to accept children and className
type RadixUIComponent<T = {}> = T & {
  children?: React.ReactNode
  className?: string
}

// Module augmentation for all used Radix components
declare module "@radix-ui/react-select" {
  export interface SelectTriggerProps extends RadixUIComponent {
    size?: "sm" | "default"
  }
  export interface SelectContentProps extends RadixUIComponent {
    position?: "popper" | "item-aligned"
  }
  export interface SelectItemProps extends RadixUIComponent {
    value: string
  }
  export interface SelectValueProps extends RadixUIComponent {
    placeholder?: string
  }
}

declare module "@radix-ui/react-label" {
  export interface LabelProps extends RadixUIComponent {
    htmlFor?: string
  }
}

declare module "@radix-ui/react-tabs" {
  export interface TabsProps extends RadixUIComponent {
    defaultValue?: string
    value?: string
    onValueChange?: (value: string) => void
  }
  export interface TabsListProps extends RadixUIComponent {}
  export interface TabsTriggerProps extends RadixUIComponent {
    value: string
  }
  export interface TabsContentProps extends RadixUIComponent {
    value: string
  }
}

declare module "@radix-ui/react-avatar" {
  export interface AvatarFallbackProps extends RadixUIComponent {}
  export interface AvatarProps extends RadixUIComponent {}
  export interface AvatarImageProps extends RadixUIComponent {
    src?: string
    alt?: string
  }
}

declare module "@radix-ui/react-separator" {
  export interface SeparatorProps extends RadixUIComponent {
    orientation?: "horizontal" | "vertical"
  }
}

declare module "@radix-ui/react-dialog" {
  export interface DialogOverlayProps extends RadixUIComponent {}
  export interface DialogContentProps extends RadixUIComponent {}
  export interface DialogProps extends RadixUIComponent {
    open?: boolean
    onOpenChange?: (open: boolean) => void
  }
  export interface DialogPortalProps extends RadixUIComponent {}
  export interface DialogTitleProps extends RadixUIComponent {}
  export interface DialogDescriptionProps extends RadixUIComponent {}
}

declare module "@radix-ui/react-dropdown-menu" {
  export interface DropdownMenuTriggerProps extends RadixUIComponent {
    asChild?: boolean
  }
  export interface DropdownMenuProps extends RadixUIComponent {
    open?: boolean
    onOpenChange?: (open: boolean) => void
  }
  export interface DropdownMenuContentProps extends RadixUIComponent {
    align?: "start" | "center" | "end"
    side?: "top" | "right" | "bottom" | "left"
  }
  export interface DropdownMenuItemProps extends RadixUIComponent {
    onSelect?: () => void
    disabled?: boolean
  }
  export interface DropdownMenuSeparatorProps extends RadixUIComponent {}
  export interface DropdownMenuLabelProps extends RadixUIComponent {}
}

declare module "@radix-ui/react-checkbox" {
  export interface CheckboxProps extends RadixUIComponent {
    checked?: boolean
    onCheckedChange?: (checked: boolean) => void
    disabled?: boolean
  }
}

declare module "@radix-ui/react-switch" {
  export interface SwitchProps extends RadixUIComponent {
    checked?: boolean
    onCheckedChange?: (checked: boolean) => void
    disabled?: boolean
  }
}

declare module "@radix-ui/react-accordion" {
  export interface AccordionProps extends RadixUIComponent {
    type?: "single" | "multiple"
    collapsible?: boolean
    value?: string | string[]
    onValueChange?: (value: string | string[]) => void
  }
  export interface AccordionItemProps extends RadixUIComponent {
    value: string
  }
  export interface AccordionTriggerProps extends RadixUIComponent {}
  export interface AccordionContentProps extends RadixUIComponent {}
}

export {}