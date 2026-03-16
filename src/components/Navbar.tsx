import { Link, useNavigate } from "react-router-dom";
import { Heart, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

export function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg">
          <Heart className="h-6 w-6 text-accent" />
          <span className="hidden sm:inline text-primary">USHN</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
<Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Home</Link>
          <Link to="/about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">About</Link>
          {isAuthenticated ? (
            <>
              <Link to={user?.role === "hospital" ? "/hospital" : "/donor"}>
                <Button variant="outline" size="sm">Dashboard</Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleLogout}>Logout</Button>
            </>
          ) : (
            <>
              <Link to="/login"><Button variant="outline" size="sm">Login</Button></Link>
              <Link to="/register/hospital"><Button size="sm">Register</Button></Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t bg-background p-4 space-y-2">
<Link to="/" className="block py-2 text-sm" onClick={() => setMobileOpen(false)}>Home</Link>
          <Link to="/about" className="block py-2 text-sm" onClick={() => setMobileOpen(false)}>About</Link>
          {isAuthenticated ? (
            <>
              <Link to={user?.role === "hospital" ? "/hospital" : "/donor"} className="block py-2 text-sm" onClick={() => setMobileOpen(false)}>Dashboard</Link>
              <Button variant="ghost" size="sm" onClick={() => { handleLogout(); setMobileOpen(false); }}>Logout</Button>
            </>
          ) : (
            <>
              <Link to="/login" className="block py-2 text-sm" onClick={() => setMobileOpen(false)}>Login</Link>
              <Link to="/register/hospital" className="block py-2 text-sm" onClick={() => setMobileOpen(false)}>Register</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
