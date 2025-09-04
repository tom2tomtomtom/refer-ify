// Type declarations for UI components with React 19 compatibility

import * as React from "react"

declare module "@radix-ui/react-select" {
  interface SelectTriggerProps {
    children?: React.ReactNode
    className?: string
    size?: "sm" | "default"
  }
  
  interface SelectContentProps {
    children?: React.ReactNode
    className?: string
    position?: "popper" | "item-aligned"
  }
  
  interface SelectItemProps {
    children?: React.ReactNode
    className?: string
    value: string
  }
  
  interface SelectValueProps {
    placeholder?: string
    className?: string
  }
}

declare module "@radix-ui/react-label" {
  interface LabelProps {
    children?: React.ReactNode
    htmlFor?: string
    className?: string
  }
}

declare module "@radix-ui/react-tabs" {
  interface TabsProps {
    children?: React.ReactNode
    defaultValue?: string
    className?: string
    value?: string
    onValueChange?: (value: string) => void
  }
  
  interface TabsListProps {
    children?: React.ReactNode
    className?: string
  }
  
  interface TabsTriggerProps {
    children?: React.ReactNode
    value: string
    className?: string
  }
  
  interface TabsContentProps {
    children?: React.ReactNode
    value: string
    className?: string
  }
}

declare module "@radix-ui/react-avatar" {
  interface AvatarFallbackProps {
    children?: React.ReactNode
    className?: string
  }
  
  interface AvatarProps {
    children?: React.ReactNode
    className?: string
  }
  
  interface AvatarImageProps {
    src?: string
    alt?: string
    className?: string
  }
}

declare module "@radix-ui/react-separator" {
  interface SeparatorProps {
    className?: string
    orientation?: "horizontal" | "vertical"
  }
}

declare module "@radix-ui/react-dialog" {
  interface DialogOverlayProps {
    className?: string
  }
  
  interface DialogContentProps {
    children?: React.ReactNode
    className?: string
  }
  
  interface DialogProps {
    children?: React.ReactNode
    open?: boolean
    onOpenChange?: (open: boolean) => void
  }
  
  interface DialogPortalProps {
    children?: React.ReactNode
  }
  
  interface DialogTitleProps {
    children?: React.ReactNode
    className?: string
  }
  
  interface DialogDescriptionProps {
    children?: React.ReactNode
    className?: string
  }
}

declare module "@radix-ui/react-dropdown-menu" {
  interface DropdownMenuTriggerProps {
    children?: React.ReactNode
    className?: string
    asChild?: boolean
  }
  
  interface DropdownMenuProps {
    children?: React.ReactNode
    open?: boolean
    onOpenChange?: (open: boolean) => void
  }
  
  interface DropdownMenuContentProps {
    children?: React.ReactNode
    className?: string
    align?: "start" | "center" | "end"
    side?: "top" | "right" | "bottom" | "left"
  }
  
  interface DropdownMenuItemProps {
    children?: React.ReactNode
    className?: string
    onSelect?: () => void
    disabled?: boolean
  }
  
  interface DropdownMenuSeparatorProps {
    className?: string
  }
  
  interface DropdownMenuLabelProps {
    children?: React.ReactNode
    className?: string
  }
}