import {
  Toast,
  ToastActionElement,
  ToastProps,
} from "@/components/ui/toast"
import { useToast as useToastPrimitive } from "@/components/ui/use-toast"

export type ToastActionProps = React.ButtonHTMLAttributes<HTMLButtonElement>

export function useToast() {
  const { toast, dismiss, toasts } = useToastPrimitive()

  return {
    toast,
    dismiss,
    toasts,
  }
}