"use client";

import { useFormStatus } from "react-dom";
import React from "react";
import { Button } from "@/components/ui/button";

interface SubmitButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
}

export function SubmitButton({ children, formAction, className, style, variant, size, ...props }: SubmitButtonProps & React.ComponentProps<typeof Button>) {
    const { pending } = useFormStatus();

    return (
        <Button
            {...props}
            variant={variant}
            size={size}
            className={className}
            style={style}
            formAction={formAction}
            loading={pending}
            disabled={pending || props.disabled}
        >
            {children}
        </Button>
    );
}
