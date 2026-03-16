import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Navbar } from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

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
    // 1. Sign up
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    });

    if (signUpError || !signUpData.user) {
      toast({ title: "Registration Failed", description: signUpError?.message ?? "Unknown error", variant: "destructive" });
      setIsLoading(false);
      return;
    }

    // 2. Sign in immediately to get active session for RLS
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

    // 3. Insert profile (session is active now)
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

    // 4. Insert role
    const { error: roleError } = await supabase.from("user_roles").insert({
      user_id: userId,
      role: "hospital",
    });

    if (roleError) {
      toast({ title: "Error saving role", description: roleError.message, variant: "destructive" });
      setIsLoading(false);
      return;
    }

    // 5. Now refresh profile in AuthContext so redirect works
    setRegistering(false);
    await refreshProfile();

    toast({ title: "Registration Successful!", description: "Welcome to USHN Hospital Dashboard." });
    setIsLoading(false);
    navigate("/hospital");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-4 bg-secondary/30">
        <Card className="w-full max-w-lg">
          <CardHeader className="text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">Hospital Registration</CardTitle>
            <CardDescription>Register your hospital to join the network</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Hospital Name</Label>
                <Input id="name" placeholder="Enter hospital name" value={form.name} onChange={(e) => update("name", e.target.value)} maxLength={200} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" placeholder="Enter location" value={form.location} onChange={(e) => update("location", e.target.value)} maxLength={200} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="license">License Number</Label>
                <Input id="license" placeholder="Enter license number" value={form.license} onChange={(e) => update("license", e.target.value)} maxLength={50} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact">Contact Number</Label>
                <Input id="contact" placeholder="Enter contact number" value={form.contact} onChange={(e) => update("contact", e.target.value)} maxLength={20} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="Enter email" value={form.email} onChange={(e) => update("email", e.target.value)} maxLength={255} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="Create password (min 6 chars)" value={form.password} onChange={(e) => update("password", e.target.value)} maxLength={128} />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Registering..." : "Register Hospital"}
              </Button>
            </form>
            <p className="text-center text-sm text-muted-foreground mt-4">
              Want to register as a donor? <Link to="/register/donor" className="text-primary underline">Click here</Link>
            </p>
            <p className="text-center text-sm text-muted-foreground mt-2">
              Already have an account? <Link to="/login" className="text-primary underline">Login</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
