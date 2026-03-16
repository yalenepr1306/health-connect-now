import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Heart, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Navbar } from "@/components/Navbar";
import { cn } from "@/lib/utils";

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
    // Success redirect is handled by the effect above once role data is ready.
  };

  const isHospital = mode === "hospital";

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-4 bg-secondary/30">
        <div className="w-full max-w-md">

          {/* Role Toggle */}
          <div className="flex rounded-xl overflow-hidden border bg-background shadow-sm mb-6">
            <button
              type="button"
              onClick={() => setMode("hospital")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors",
                isHospital
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary"
              )}
            >
              <Building2 className="h-4 w-4" />
              Login as Hospital
            </button>
            <button
              type="button"
              onClick={() => setMode("donor")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors",
                !isHospital
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-secondary"
              )}
            >
              <Heart className="h-4 w-4" />
              Login as Donor
            </button>
          </div>

          {/* Login Card */}
          <div className="bg-background rounded-xl border shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className={cn(
                "h-10 w-10 rounded-full flex items-center justify-center",
                isHospital ? "bg-primary/10" : "bg-accent/10"
              )}>
                {isHospital
                  ? <Building2 className="h-5 w-5 text-primary" />
                  : <Heart className="h-5 w-5 text-accent" />
                }
              </div>
              <div>
                <h2 className="font-bold text-lg leading-tight">
                  {isHospital ? "Hospital Login" : "Donor Login"}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {isHospital ? "Access your hospital dashboard" : "Access your donor dashboard"}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={isHospital ? "hospital@example.com" : "donor@example.com"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  maxLength={255}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  maxLength={128}
                />
              </div>
              <Button
                type="submit"
                className={cn("w-full", !isHospital && "bg-accent hover:bg-accent/90 text-accent-foreground")}
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : isHospital ? "Login as Hospital" : "Login as Donor"}
              </Button>
            </form>

            <p className="text-center text-xs text-muted-foreground mt-5">
              Don't have an account?{" "}
              <Link to="/register/hospital" className="text-primary underline">Register Hospital</Link>
              {" "}or{" "}
              <Link to="/register/donor" className="text-primary underline">Register Donor</Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
