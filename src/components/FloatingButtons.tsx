import { motion } from "framer-motion";
import { MessageCircle, Phone } from "lucide-react";

export function FloatingButtons() {
  const phoneNumber = "+254724742281";
  const whatsappNumber = phoneNumber;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1 }}
      className="fixed bottom-6 right-6 z-50 flex flex-col gap-3"
    >
      {/* WhatsApp Button */}
      <motion.a
        href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, "")}`}
        target="_blank"
        rel="noopener noreferrer"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] text-white shadow-elevated hover:shadow-glow transition-shadow"
      >
        <MessageCircle className="w-6 h-6" />
      </motion.a>

      {/* Phone Button */}
      <motion.a
        href={`tel:${phoneNumber}`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center justify-center w-14 h-14 rounded-full gradient-warm text-primary-foreground shadow-elevated hover:shadow-glow transition-shadow"
      >
        <Phone className="w-6 h-6" />
      </motion.a>
    </motion.div>
  );
}
