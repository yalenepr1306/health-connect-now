import { Heart } from "lucide-react";
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="border-t bg-secondary/50">
      <div className="container py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 font-bold text-lg mb-4">
            <Heart className="h-5 w-5 text-accent" />
            <span className="text-primary">USHN</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Unified Smart Hospital Network — connecting hospitals and donors for real-time blood & organ availability.
          </p>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-sm">Quick Links</h4>
<div className="space-y-2">
            <Link to="/" className="block text-sm text-muted-foreground hover:text-foreground">Home</Link>
            <Link to="/about" className="block text-sm text-muted-foreground hover:text-foreground">About</Link>
          </div>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-sm">For Hospitals</h4>
          <div className="space-y-2">
            <Link to="/register/hospital" className="block text-sm text-muted-foreground hover:text-foreground">Register Hospital</Link>
            <Link to="/login" className="block text-sm text-muted-foreground hover:text-foreground">Hospital Login</Link>
          </div>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-sm">For Donors</h4>
          <div className="space-y-2">
            <Link to="/register/donor" className="block text-sm text-muted-foreground hover:text-foreground">Register as Donor</Link>
            <Link to="/login" className="block text-sm text-muted-foreground hover:text-foreground">Donor Login</Link>
          </div>
        </div>
      </div>
      <div className="border-t py-4 text-center text-sm text-muted-foreground">
        © 2026 Unified Smart Hospital Network. All rights reserved.
      </div>
    </footer>
  );
}
