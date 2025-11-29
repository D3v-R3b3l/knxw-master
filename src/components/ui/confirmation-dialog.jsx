import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle, Trash2 } from "lucide-react";

export function ConfirmationDialog({ 
  open, 
  onOpenChange, 
  title = "Confirm Action", 
  description = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  variant = "default", // "default" | "destructive"
  icon
}) {
  const handleConfirm = () => {
    onConfirm?.();
    onOpenChange?.(false);
  };

  const getIcon = () => {
    if (icon) return icon;
    if (variant === "destructive") return <Trash2 className="w-5 h-5 text-red-500" />;
    return <AlertTriangle className="w-5 h-5 text-amber-500" />;
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-[#111111] border-[#262626] text-white max-w-md">
        <AlertDialogHeader className="space-y-4">
          <div className="flex items-center gap-3">
            {getIcon()}
            <AlertDialogTitle className="text-white text-lg font-semibold">
              {title}
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-[#a3a3a3] text-sm leading-relaxed">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-3">
          <AlertDialogCancel className="bg-[#1a1a1a] border-[#262626] text-white hover:bg-[#262626] hover:text-white">
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleConfirm}
            className={variant === "destructive" 
              ? "bg-red-600 hover:bg-red-700 text-white" 
              : "bg-[#00d4ff] hover:bg-[#0ea5e9] text-[#0a0a0a]"
            }
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}