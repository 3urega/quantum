export {};

declare global {
  interface Window {
    /** Inyectado por `QuantumApiBaseScript` (Railway / Docker con env en runtime). */
    __QUANTUM_API_BASE__?: string;
  }
}
