import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Building2, Heart, MapPin, FileText, Phone, Mail, Lock, ArrowRight, Shield, Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import hospitalImg from "@/assets/hospital.jpg";

export default function RegisterHospital() {
  const [form, setForm] = useState({ name: "", location: "", license: "", contact: "", email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { refreshProfile, setRegistering } = useAuth();
  const { toast } = useToast();

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
      location: form.location,
      license_number: form.license,
      contact_number: form.contact,
    });

    if (profileError) {
      toast({ title: "Error saving profile", description: profileError.message, variant: "destructive" });
      setIsLoading(false);
      return;
    }

    const { error: roleError } = await supabase.from("user_roles").insert({
      user_id: userId,
      role: "hospital",
    });

    if (roleError) {
      toast({ title: "Error saving role", description: roleError.message, variant: "destructive" });
      setIsLoading(false);
      return;
    }

    setRegistering(false);
    await refreshProfile();

    toast({ title: "Registration Successful!", description: "Welcome to USHN Hospital Dashboard." });
    setIsLoading(false);
    navigate("/hospital");
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-5/12 relative overflow-hidden">
        <img src={hospitalImg} alt="Hospital building" className="w-full h-full object-cover" width={800} height={600} />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/75 to-primary/60" />
        <div className="absolute inset-0 flex flex-col justify-between p-10">
          <Link to="/" className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary-foreground/20 backdrop-blur-sm flex items-center justify-center">
              <Heart className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-primary-foreground">USHN</span>
          </Link>

          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-primary-foreground leading-tight">
              Join the<br />
              <span className="text-primary-foreground/80">Hospital Network</span>
            </h2>
            <p className="text-primary-foreground/70 max-w-sm leading-relaxed">
              Connect your hospital to a real-time network of donors and healthcare facilities.
            </p>
            <div className="space-y-4 pt-2">
              {[
                { icon: Shield, text: "Verified & secure platform" },
                { icon: Clock, text: "Real-time blood & organ tracking" },
                { icon: Users, text: "Access thousands of donors" },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-primary-foreground/10 flex items-center justify-center">
                    <item.icon className="h-4 w-4 text-primary-foreground/80" />
                  </div>
                  <span className="text-sm text-primary-foreground/70">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-primary-foreground/40">© 2025 Unified Smart Hospital Network</p>
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
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-4">
                <Building2 className="h-3.5 w-3.5" />
                Hospital Registration
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Create Your Account</h1>
              <p className="text-muted-foreground">Register your hospital to join the USHN network</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">Hospital Name</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="name" placeholder="Enter hospital name" value={form.name} onChange={(e) => update("name", e.target.value)} maxLength={200} className="pl-10 h-11 rounded-xl" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location" className="text-sm font-medium">Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="location" placeholder="Enter location" value={form.location} onChange={(e) => update("location", e.target.value)} maxLength={200} className="pl-10 h-11 rounded-xl" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="license" className="text-sm font-medium">License Number</Label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="license" placeholder="Enter license number" value={form.license} onChange={(e) => update("license", e.target.value)} maxLength={50} className="pl-10 h-11 rounded-xl" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact" className="text-sm font-medium">Contact Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="contact" placeholder="Enter contact number" value={form.contact} onChange={(e) => update("contact", e.target.value)} maxLength={20} className="pl-10 h-11 rounded-xl" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="email" type="email" placeholder="Enter email" value={form.email} onChange={(e) => update("email", e.target.value)} maxLength={255} className="pl-10 h-11 rounded-xl" />
                </div>
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
                className="w-full h-12 rounded-xl text-base font-semibold gap-2 shadow-lg shadow-primary/20 mt-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Registering...
                  </span>
                ) : (
                  <>
                    Register Hospital <ArrowRight className="h-4 w-4" />
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
              <Link to="/register/donor" className="flex-1">
                <Button variant="outline" className="w-full rounded-xl h-11 gap-2 text-sm border-accent/30 text-accent hover:bg-accent/5">
                  <Heart className="h-4 w-4" /> Register as Donor
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
