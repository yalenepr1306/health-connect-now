import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Heart, Building2, User, Mail, Phone, MapPin, Lock, Droplets, ArrowRight, Shield, Bell, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { BLOOD_GROUPS } from "@/lib/mock-data";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import donorsImg from "@/assets/donors.jpg";

export default function RegisterDonor() {
  const [form, setForm] = useState({ name: "", bloodGroup: "", phone: "", email: "", location: "", password: "" });
  const [available, setAvailable] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { refreshProfile, setRegistering } = useAuth();

  const update = (field: string, value: string) => setForm((p) => ({ ...p, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.values(form).some((v) => !v.trim())) {
      toast({ title: "Error", description: "Please fill in all fields", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    setRegistering(true);
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    });

    if (signUpError || !signUpData.user) {
      toast({ title: "Registration Failed", description: signUpError?.message ?? "Unknown error", variant: "destructive" });
      setIsLoading(false);
      return;
    }

    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    });

    if (signInError || !signInData.session) {
      toast({ title: "Auth Error", description: signInError?.message ?? "Could not authenticate after signup", variant: "destructive" });
      setIsLoading(false);
      return;
    }

    const userId = signInData.user.id;

    const { error: profileError } = await supabase.from("profiles").insert({
      user_id: userId,
      name: form.name,
      email: form.email,
      phone: form.phone,
      blood_group: form.bloodGroup,
      location: form.location,
      available,
    });

    if (profileError) {
      toast({ title: "Error saving profile", description: profileError.message, variant: "destructive" });
      setIsLoading(false);
      return;
    }

    const { error: roleError } = await supabase.from("user_roles").insert({
      user_id: userId,
      role: "donor",
    });

    if (roleError) {
      toast({ title: "Error saving role", description: roleError.message, variant: "destructive" });
      setIsLoading(false);
      return;
    }

    setRegistering(false);
    await refreshProfile();

    toast({ title: "Registration Successful!", description: "Welcome to USHN Donor Dashboard." });
    setIsLoading(false);
    navigate("/donor");
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-5/12 relative overflow-hidden">
        <img src={donorsImg} alt="Blood donors" className="w-full h-full object-cover" width={800} height={600} />
        <div className="absolute inset-0 bg-gradient-to-br from-accent/90 via-accent/75 to-accent/60" />
        <div className="absolute inset-0 flex flex-col justify-between p-10">
          <Link to="/" className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-accent-foreground/20 backdrop-blur-sm flex items-center justify-center">
              <Heart className="h-6 w-6 text-accent-foreground" />
            </div>
            <span className="text-xl font-bold text-accent-foreground">USHN</span>
          </Link>

          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-accent-foreground leading-tight">
              Become a<br />
              <span className="text-accent-foreground/80">Lifesaver Today</span>
            </h2>
            <p className="text-accent-foreground/70 max-w-sm leading-relaxed">
              Register as a donor and help save lives. Get notified when someone needs your blood type.
            </p>
            <div className="space-y-4 pt-2">
              {[
                { icon: Bell, text: "Get emergency alerts instantly" },
                { icon: Shield, text: "Your data is secure & private" },
                { icon: Activity, text: "Track your donation history" },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-accent-foreground/10 flex items-center justify-center">
                    <item.icon className="h-4 w-4 text-accent-foreground/80" />
                  </div>
                  <span className="text-sm text-accent-foreground/70">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-accent-foreground/40">© 2025 Unified Smart Hospital Network</p>
        </div>
      </div>

      {/* Right panel - Form */}
      <div className="flex-1 flex flex-col">
        <div className="lg:hidden flex items-center justify-between p-4 border-b bg-background">
          <Link to="/" className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-accent" />
            <span className="font-bold text-primary">USHN</span>
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center p-6 md:p-10 bg-background overflow-auto">
          <div className="w-full max-w-[480px]">
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent mb-4">
                <Heart className="h-3.5 w-3.5" />
                Donor Registration
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Register as a Donor</h1>
              <p className="text-muted-foreground">Fill in your details to start saving lives</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="name" placeholder="Enter your name" value={form.name} onChange={(e) => update("name", e.target.value)} maxLength={100} className="pl-10 h-11 rounded-xl" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="email" type="email" placeholder="Enter your email" value={form.email} onChange={(e) => update("email", e.target.value)} maxLength={200} className="pl-10 h-11 rounded-xl" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Blood Group</Label>
                  <Select value={form.bloodGroup} onValueChange={(v) => update("bloodGroup", v)}>
                    <SelectTrigger className="h-11 rounded-xl pl-10 relative">
                      <Droplets className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <SelectValue placeholder="Select blood group" />
                    </SelectTrigger>
                    <SelectContent>
                      {BLOOD_GROUPS.map((bg) => <SelectItem key={bg} value={bg}>{bg}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="phone" placeholder="Enter phone number" value={form.phone} onChange={(e) => update("phone", e.target.value)} maxLength={20} className="pl-10 h-11 rounded-xl" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location" className="text-sm font-medium">Location</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="location" placeholder="Enter your location" value={form.location} onChange={(e) => update("location", e.target.value)} maxLength={200} className="pl-10 h-11 rounded-xl" />
                </div>
              </div>

              <div className="flex items-center justify-between rounded-xl border bg-secondary/30 p-4">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "h-9 w-9 rounded-lg flex items-center justify-center transition-colors",
                    available ? "bg-[hsl(var(--success))]/10" : "bg-muted"
                  )}>
                    <Activity className={cn("h-4 w-4", available ? "text-[hsl(var(--success))]" : "text-muted-foreground")} />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Available for Donation</Label>
                    <p className="text-xs text-muted-foreground">{available ? "You will receive alerts" : "You won't receive alerts"}</p>
                  </div>
                </div>
                <Switch checked={available} onCheckedChange={setAvailable} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="password" type="password" placeholder="Create password (min 6 chars)" value={form.password} onChange={(e) => update("password", e.target.value)} maxLength={128} className="pl-10 h-11 rounded-xl" />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 rounded-xl text-base font-semibold gap-2 shadow-lg bg-accent hover:bg-accent/90 text-accent-foreground shadow-accent/20 mt-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full animate-spin" />
                    Registering...
                  </span>
                ) : (
                  <>
                    Register as Donor <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground">or</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/register/hospital" className="flex-1">
                <Button variant="outline" className="w-full rounded-xl h-11 gap-2 text-sm">
                  <Building2 className="h-4 w-4" /> Register as Hospital
                </Button>
              </Link>
              <Link to="/login" className="flex-1">
                <Button variant="outline" className="w-full rounded-xl h-11 gap-2 text-sm">
                  Already have an account?
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
