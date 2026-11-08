import { whatsappUrl } from "@/lib/config";

export function WhatsAppIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden focusable="false" fill="currentColor">
      <path d="M16.04 3C9.4 3 4 8.36 4 14.97c0 2.11.56 4.17 1.62 5.99L4 28l7.24-1.89A12.1 12.1 0 0 0 16.04 27C22.68 27 28 21.64 28 15.03 28 8.4 22.68 3 16.04 3Zm0 21.95c-1.8 0-3.57-.48-5.11-1.39l-.37-.22-4.3 1.12 1.15-4.17-.24-.38a9.86 9.86 0 0 1-1.52-5.27c0-5.5 4.5-9.97 10.04-9.97 5.5 0 9.96 4.5 9.96 10.04 0 5.5-4.47 10.24-9.6 10.24Zm5.5-7.44c-.3-.15-1.78-.88-2.06-.98-.28-.1-.48-.15-.68.15-.2.3-.78.98-.96 1.18-.18.2-.35.22-.65.07-.3-.15-1.27-.47-2.42-1.49-.9-.8-1.5-1.78-1.67-2.08-.18-.3-.02-.46.13-.61.14-.13.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.38-.02-.53-.08-.15-.68-1.63-.93-2.23-.24-.58-.49-.5-.68-.51h-.58c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48 0 1.47 1.07 2.88 1.21 3.08.15.2 2.1 3.2 5.08 4.49.71.3 1.27.49 1.7.63.72.23 1.37.2 1.88.12.57-.08 1.78-.73 2.03-1.43.25-.7.25-1.31.18-1.43-.07-.13-.27-.2-.57-.35Z" />
    </svg>
  );
}

export function WhatsAppFab() {
  return (
    <a
      href={whatsappUrl("Hello Madras Cloth Emporium! I have a question.")}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="group fixed bottom-5 right-5 z-30 inline-flex h-14 items-center gap-2 rounded-full bg-[#1f7a4d] pl-4 pr-4 text-white shadow-[0_14px_30px_-10px_rgba(31,122,77,0.7)] transition-all duration-500 hover:pr-5 sm:bottom-7 sm:right-7"
    >
      <WhatsAppIcon className="h-7 w-7" />
      <span className="max-w-0 overflow-hidden whitespace-nowrap text-sm font-semibold transition-all duration-500 group-hover:max-w-40 group-focus-visible:max-w-40">
        Chat with us
      </span>
    </a>
  );
}
