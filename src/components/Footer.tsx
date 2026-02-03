import { Link } from "react-router-dom";
import { Heart, Mail, Phone, MapPin } from "lucide-react";
import logo from "@/assets/logo.png";

export function Footer() {
  return (
    <footer className="bg-foreground text-background py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="MUTPECC Logo" className="h-12 w-auto" />
            </div>
            <p className="text-background/70 text-sm leading-relaxed">
              Mental health guidance and counseling platform. Creating a safe space 
              for healing, growth, and support.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif font-semibold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {["Home", "About", "Vlog", "Events", "Activities"].map((link) => (
                <li key={link}>
                  <Link
                    to={`/${link.toLowerCase()}`}
                    className="text-background/70 hover:text-background transition-colors text-sm"
                  >
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-serif font-semibold text-lg mb-4">Support</h4>
            <ul className="space-y-2">
              {["Ask Executive", "Become a Counselor", "FAQs", "Privacy Policy"].map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-background/70 hover:text-background transition-colors text-sm"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-serif font-semibold text-lg mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-background/70 text-sm">
                <Mail className="w-4 h-4" />
                hello@mutpecc.org "need to be updated"
              </li>
              <li className="flex items-center gap-3 text-background/70 text-sm">
                <Phone className="w-4 h-4" />
                need to be updates
              </li>
              <li className="flex items-start gap-3 text-background/70 text-sm">
                <MapPin className="w-4 h-4 mt-0.5" />
                Murang'a University "need to be updated"
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-background/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-background/50 text-sm">
            © 2026 MUTPECC. All rights reserved.
          </p>
          <p className="text-background/50 text-sm flex items-center gap-1">
            Made with <Heart className="w-3 h-3 text-coral-400" /> for mental wellness
          </p>
        </div>
      </div>
    </footer>
  );
}
