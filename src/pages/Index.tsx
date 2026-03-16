import { Link } from "react-router-dom";
import { Heart, Droplets, Activity, Bell, Building2, ArrowRight, UserPlus, RefreshCw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const features = [
  { icon: Droplets, title: "Real-time Blood Availability", desc: "Track blood stock levels across hospitals in real-time." },
  { icon: Activity, title: "Organ Availability Tracking", desc: "Monitor organ availability and match donors instantly." },
  { icon: Bell, title: "Emergency Donor Alerts", desc: "Instant notifications to matching donors during emergencies." },
  { icon: Building2, title: "Inter-Hospital Resource Sharing", desc: "Seamless resource sharing between connected hospitals." },
];

const steps = [
  { icon: UserPlus, title: "Register", desc: "Sign up as a Hospital or Donor" },
  { icon: RefreshCw, title: "Update Availability", desc: "Hospitals update blood/organ stock" },
  { icon: Bell, title: "Get Alerts", desc: "Donors receive emergency notifications" },
  { icon: Search, title: "Connect", desc: "Hospitals connect with donors & hospitals" },
];

export default function Index() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="container py-20 md:py-32 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 rounded-full border bg-background px-4 py-1.5 text-sm mb-6">
            <Heart className="h-4 w-4 text-accent" />
            <span className="text-muted-foreground">Saving Lives Together</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight max-w-3xl mb-4">
            Unified Smart <span className="text-primary">Hospital Network</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-8">
            Real-time Blood & Organ Availability and Donor Matching System — connecting hospitals and donors when every second counts.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/register/hospital">
              <Button size="lg" className="gap-2">
                <Building2 className="h-4 w-4" /> Register as Hospital
              </Button>
            </Link>
            <Link to="/register/donor">
              <Button size="lg" variant="outline" className="gap-2 border-accent text-accent hover:bg-accent hover:text-accent-foreground">
                <Heart className="h-4 w-4" /> Register as Donor
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3">Key Features</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">Everything hospitals and donors need for efficient blood and organ management.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f) => (
            <Card key={f.title} className="group hover:shadow-lg transition-shadow border-t-4 border-t-primary">
              <CardContent className="pt-6">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <f.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-secondary/50 py-20">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">How It Works</h2>
            <p className="text-muted-foreground">Simple steps to save lives</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((s, i) => (
              <div key={s.title} className="flex flex-col items-center text-center">
                <div className="relative">
                  <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center mb-4">
                    <s.icon className="h-7 w-7 text-primary-foreground" />
                  </div>
                  <span className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-accent text-accent-foreground text-sm font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                </div>
                <h3 className="font-semibold mb-1">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container py-20 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Make a Difference?</h2>
        <p className="text-muted-foreground mb-8 max-w-lg mx-auto">Join the network and help save lives by connecting hospitals and donors in real-time.</p>
        <Link to="/register/donor">
          <Button size="lg" className="gap-2">
            Get Started <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </section>

      <Footer />
    </div>
  );
}
