"use client";

import Button from "../ui/Button";
import { MessageCircle } from "lucide-react";
import { createWhatsAppLink } from "../../lib/utils";

export default function WhatsAppButton({
  phone,
  title,
  rentPrice,
  area,
  className,
  size = "md",
  disabled = false,
  label = "Contact on WhatsApp",
}) {
  const link = createWhatsAppLink({ phone, title, rentPrice, area });

  return (
    <a
      href={disabled ? undefined : link}
      target="_blank"
      rel="noopener noreferrer"
      className={disabled ? "pointer-events-none opacity-50" : "inline-block"}
    >
      <Button
        variant="whatsapp"
        size={size}
        disabled={disabled}
        className={className}
      >
        <MessageCircle className="h-4 w-4 fill-white" />
        <span>{label}</span>
      </Button>
    </a>
  );
}
