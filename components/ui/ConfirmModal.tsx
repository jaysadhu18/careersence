"use client";

import { ReactNode } from "react";
import { Modal } from "./Modal";
import { Button } from "./Button";

interface ConfirmModalProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void | Promise<void>;
    title: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
    variant?: "danger" | "primary" | "secondary";
    loading?: boolean;
}

export function ConfirmModal({
    open,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = "Confirm",
    cancelText = "Cancel",
    variant = "danger",
    loading = false,
}: ConfirmModalProps) {
    return (
        <Modal open={open} onClose={onClose} title={title} size="sm">
            <div className="space-y-4">
                {description && (
                    <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
                        {description}
                    </p>
                )}
                <div className="flex justify-end gap-3 mt-6">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        disabled={loading}
                    >
                        {cancelText}
                    </Button>
                    <Button
                        variant={variant === "danger" ? "primary" : variant}
                        className={variant === "danger" ? "bg-red-600 hover:bg-red-700" : ""}
                        onClick={onConfirm}
                        loading={loading}
                    >
                        {confirmText}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
