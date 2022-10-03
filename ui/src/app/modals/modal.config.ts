export interface ModalConfig {
    modalTitle: string
    dismissButtonLabel?: string
    closeButtonLabel?: string
    shouldClose?(): Promise<boolean> | boolean
    shouldDismiss?(): Promise<boolean> | boolean
    onClose?(): Promise<unknown>
    onDismiss?(): Promise<unknown>
    disableCloseButton?(): boolean
    disableDismissButton?(): boolean
    hideCloseButton?(): boolean
    hideDismissButton?(): boolean
}