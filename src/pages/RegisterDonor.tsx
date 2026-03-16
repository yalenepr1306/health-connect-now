import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Navbar } from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { BLOOD_GROUPS } from "@/lib/mock-data";
import { useAuth } from "@/contexts/AuthContext";

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

    // 4. Insert role
    const { error: roleError } = await supabase.from("user_roles").insert({
      user_id: userId,
      role: "donor",
    });

    if (roleError) {
      toast({ title: "Error saving role", description: roleError.message, variant: "destructive" });
      setIsLoading(false);
      return;
    }

    // 5. Now refresh profile in AuthContext so redirect works
    setRegistering(false);
    await refreshProfile();

    toast({ title: "Registration Successful!", description: "Welcome to USHN Donor Dashboard." });
    setIsLoading(false);
    navigate("/donor");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-4 bg-secondary/30">
        <Card className="w-full max-w-lg">
          <CardHeader className="text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center mb-2">
              <Heart className="h-6 w-6 text-accent" />
            </div>
            <CardTitle className="text-2xl">Donor Registration</CardTitle>
            <CardDescription>Register to help save lives</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" placeholder="Enter your name" value={form.name} onChange={(e) => update("name", e.target.value)} maxLength={100} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="Enter your email" value={form.email} onChange={(e) => update("email", e.target.value)} maxLength={200} />
              </div>
              <div className="space-y-2">
                <Label>Blood Group</Label>
                <Select value={form.bloodGroup} onValueChange={(v) => update("bloodGroup", v)}>
                  <SelectTrigger><SelectValue placeholder="Select blood group" /></SelectTrigger>
                  <SelectContent>
                    {BLOOD_GROUPS.map((bg) => <SelectItem key={bg} value={bg}>{bg}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" placeholder="Enter phone number" value={form.phone} onChange={(e) => update("phone", e.target.value)} maxLength={20} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" placeholder="Enter your location" value={form.location} onChange={(e) => update("location", e.target.value)} maxLength={200} />
              </div>
              <div className="flex items-center justify-between">
                <Label>Available for Donation</Label>
                <Switch checked={available} onCheckedChange={setAvailable} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="Create password (min 6 chars)" value={form.password} onChange={(e) => update("password", e.target.value)} maxLength={128} />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Registering..." : "Register as Donor"}
              </Button>
            </form>
            <p className="text-center text-sm text-muted-foreground mt-4">
              Want to register a hospital? <Link to="/register/hospital" className="text-primary underline">Click here</Link>
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
