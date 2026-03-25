import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Heart, Building2, Mail, Lock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import heroImg from "@/assets/hero-medical.jpg";

type LoginMode = "hospital" | "donor";

export default function Login() {
  const [mode, setMode] = useState<LoginMode>("hospital");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login, user, session, profileError } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user?.role) {
      navigate(user.role === "donor" ? "/donor" : "/hospital", { replace: true });
      return;
    }

    if (session && profileError) {
      toast({
        title: "Login blocked",
        description: profileError,
        variant: "destructive",
      });
      setIsLoading(false);
    }
  }, [user, session, profileError, navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      toast({ title: "Error", description: "Please fill in all fields", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    const { error } = await login(email.trim(), password);

    if (error) {
      toast({ title: "Login Failed", description: error, variant: "destructive" });
      setIsLoading(false);
    }
  };

  const isHospital = mode === "hospital";

  return (
    <div className="min-h-screen flex">
      {/* Left side - Image panel (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src={heroImg}
          alt="Medical healthcare"
          className="w-full h-full object-cover"
          width={1920}
          height={1080}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/70 to-primary/50" />
        <div className="absolute inset-0 flex flex-col justify-between p-12">
          <Link to="/" className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary-foreground/20 backdrop-blur-sm flex items-center justify-center">
              <Heart className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-primary-foreground">USHN</span>
          </Link>

          <div className="space-y-6">
            <h2 className="text-4xl font-bold text-primary-foreground leading-tight">
              Welcome Back to the<br />
              <span className="text-accent-foreground/90">Lifesaving Network</span>
            </h2>
            <p className="text-primary-foreground/80 text-lg max-w-md leading-relaxed">
              Connect with hospitals and donors in real-time. Every second counts when saving lives.
            </p>
            <div className="flex gap-6 pt-4">
              {[
                { val: "500+", label: "Hospitals" },
                { val: "10K+", label: "Donors" },
                { val: "24/7", label: "Monitoring" },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <p className="text-2xl font-bold text-primary-foreground">{s.val}</p>
                  <p className="text-xs text-primary-foreground/60">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-primary-foreground/40">
            © 2025 Unified Smart Hospital Network
          </p>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="flex-1 flex flex-col">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b bg-background">
          <Link to="/" className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-accent" />
            <span className="font-bold text-primary">USHN</span>
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center p-6 md:p-12 bg-background">
          <div className="w-full max-w-[420px]">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Sign In</h1>
              <p className="text-muted-foreground">Choose your role and access your dashboard</p>
            </div>

            {/* Role Toggle */}
            <div className="grid grid-cols-2 gap-3 mb-8">
              <button
                type="button"
                onClick={() => setMode("hospital")}
                className={cn(
                  "relative flex flex-col items-center gap-2 rounded-xl p-4 border-2 transition-all duration-200",
                  isHospital
                    ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
                    : "border-border bg-card hover:border-muted-foreground/30 hover:bg-secondary/50"
                )}
              >
                <div className={cn(
                  "h-12 w-12 rounded-xl flex items-center justify-center transition-colors",
                  isHospital ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                )}>
                  <Building2 className="h-6 w-6" />
                </div>
                <span className={cn(
                  "text-sm font-semibold",
                  isHospital ? "text-primary" : "text-muted-foreground"
                )}>
                  Hospital
                </span>
                {isHospital && (
                  <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary flex items-center justify-center">
                    <div className="h-2 w-2 rounded-full bg-primary-foreground" />
                  </div>
                )}
              </button>

              <button
                type="button"
                onClick={() => setMode("donor")}
                className={cn(
                  "relative flex flex-col items-center gap-2 rounded-xl p-4 border-2 transition-all duration-200",
                  !isHospital
                    ? "border-accent bg-accent/5 shadow-md shadow-accent/10"
                    : "border-border bg-card hover:border-muted-foreground/30 hover:bg-secondary/50"
                )}
              >
                <div className={cn(
                  "h-12 w-12 rounded-xl flex items-center justify-center transition-colors",
                  !isHospital ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground"
                )}>
                  <Heart className="h-6 w-6" />
                </div>
                <span className={cn(
                  "text-sm font-semibold",
                  !isHospital ? "text-accent" : "text-muted-foreground"
                )}>
                  Donor
                </span>
                {!isHospital && (
                  <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-accent flex items-center justify-center">
                    <div className="h-2 w-2 rounded-full bg-accent-foreground" />
                  </div>
                )}
              </button>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder={isHospital ? "hospital@example.com" : "donor@example.com"}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    maxLength={255}
                    className="pl-10 h-12 rounded-xl"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    maxLength={128}
                    className="pl-10 h-12 rounded-xl"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className={cn(
                  "w-full h-12 rounded-xl text-base font-semibold gap-2 shadow-lg transition-all",
                  isHospital
                    ? "shadow-primary/20 hover:shadow-primary/30"
                    : "bg-accent hover:bg-accent/90 text-accent-foreground shadow-accent/20 hover:shadow-accent/30"
                )}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  <>
                    {isHospital ? "Sign in as Hospital" : "Sign in as Donor"}
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-8">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground">New to USHN?</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Register links */}
            <div className="grid grid-cols-2 gap-3">
              <Link to="/register/hospital">
                <Button variant="outline" className="w-full rounded-xl h-11 gap-2 text-sm">
                  <Building2 className="h-4 w-4" />
                  Register Hospital
                </Button>
              </Link>
              <Link to="/register/donor">
                <Button variant="outline" className="w-full rounded-xl h-11 gap-2 text-sm border-accent/30 text-accent hover:bg-accent/5">
                  <Heart className="h-4 w-4" />
                  Register Donor
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
