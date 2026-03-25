import { Link } from "react-router-dom";
import { Heart, Droplets, Activity, Bell, Building2, ArrowRight, UserPlus, RefreshCw, Search, Users, Clock, Shield, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import heroImg from "@/assets/hero-medical.jpg";
import donateCtaImg from "@/assets/donate-cta.jpg";
import hospitalImg from "@/assets/hospital.jpg";
import donorsImg from "@/assets/donors.jpg";

const features = [
  { icon: Droplets, title: "Real-time Blood Availability", desc: "Track blood stock levels across hospitals in real-time.", color: "bg-destructive/10 text-destructive" },
  { icon: Activity, title: "Organ Availability Tracking", desc: "Monitor organ availability and match donors instantly.", color: "bg-primary/10 text-primary" },
  { icon: Bell, title: "Emergency Donor Alerts", desc: "Instant notifications to matching donors during emergencies.", color: "bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))]" },
  { icon: Building2, title: "Inter-Hospital Sharing", desc: "Seamless resource sharing between connected hospitals.", color: "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]" },
];

const steps = [
  { icon: UserPlus, title: "Register", desc: "Sign up as a Hospital or Donor" },
  { icon: RefreshCw, title: "Update Availability", desc: "Hospitals update blood/organ stock" },
  { icon: Bell, title: "Get Alerts", desc: "Donors receive emergency notifications" },
  { icon: Search, title: "Connect", desc: "Hospitals connect with donors & hospitals" },
];

const stats = [
  { value: "500+", label: "Hospitals Connected", icon: Building2 },
  { value: "10K+", label: "Active Donors", icon: Users },
  { value: "24/7", label: "Real-time Monitoring", icon: Clock },
  { value: "99.9%", label: "Uptime Guarantee", icon: Shield },
];

export default function Index() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero with background image */}
      <section className="relative overflow-hidden min-h-[600px] flex items-center">
        <div className="absolute inset-0">
          <img src={heroImg} alt="Medical healthcare blood cells" width={1920} height={1080} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/40" />
        </div>
        <div className="container relative z-10 py-20 md:py-32">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 text-sm mb-6">
              <Heart className="h-4 w-4 text-accent animate-pulse" />
              <span className="text-accent font-medium">Saving Lives Together</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 leading-tight">
              Unified Smart{" "}
              <span className="text-primary relative">
                Hospital Network
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none">
                  <path d="M2 10C50 4 100 2 150 6C200 10 250 4 298 8" stroke="hsl(var(--accent))" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
              Real-time Blood & Organ Availability and Donor Matching System — connecting hospitals and donors when every second counts.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/register/hospital">
                <Button size="lg" className="gap-2 shadow-lg shadow-primary/25 text-base px-8">
                  <Building2 className="h-5 w-5" /> Register as Hospital
                </Button>
              </Link>
              <Link to="/register/donor">
                <Button size="lg" variant="outline" className="gap-2 border-accent text-accent hover:bg-accent hover:text-accent-foreground text-base px-8">
                  <Heart className="h-5 w-5" /> Register as Donor
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="relative -mt-12 z-20">
        <div className="container">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 bg-card rounded-2xl shadow-xl border p-6 md:p-8">
            {stats.map((stat) => (
              <div key={stat.label} className="flex items-center gap-3 p-2">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl md:text-3xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs md:text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container py-20 md:py-28">
        <div className="text-center mb-14">
          <span className="text-sm font-semibold text-primary uppercase tracking-widest">Features</span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 mt-2">Everything You Need</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">Comprehensive tools for efficient blood and organ management across your hospital network.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f) => (
            <Card key={f.title} className="group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-0 shadow-md">
              <CardContent className="pt-8 pb-6">
                <div className={`h-14 w-14 rounded-2xl ${f.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                  <f.icon className="h-7 w-7" />
                </div>
                <h3 className="font-bold text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Hospital & Donor Split Section */}
      <section className="bg-secondary/30 py-20 md:py-28">
        <div className="container">
          <div className="text-center mb-14">
            <span className="text-sm font-semibold text-primary uppercase tracking-widest">Join Us</span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 mt-2">Two Ways to Save Lives</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Hospital Card */}
            <div className="group relative rounded-2xl overflow-hidden shadow-lg">
              <img src={hospitalImg} alt="Modern hospital facility" width={800} height={600} loading="lazy" className="w-full h-72 object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  <span className="text-sm font-semibold text-primary">For Hospitals</span>
                </div>
                <h3 className="text-2xl font-bold mb-2 text-foreground">Manage Your Resources</h3>
                <p className="text-sm text-muted-foreground mb-4">Update blood stock, track organs, send emergency alerts, and connect with donors instantly.</p>
                <Link to="/register/hospital">
                  <Button className="gap-2">
                    Register Hospital <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
            {/* Donor Card */}
            <div className="group relative rounded-2xl overflow-hidden shadow-lg">
              <img src={donorsImg} alt="Blood donors smiling" width={800} height={600} loading="lazy" className="w-full h-72 object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="h-5 w-5 text-accent" />
                  <span className="text-sm font-semibold text-accent">For Donors</span>
                </div>
                <h3 className="text-2xl font-bold mb-2 text-foreground">Become a Lifesaver</h3>
                <p className="text-sm text-muted-foreground mb-4">Register as a donor, set your availability, and receive alerts when someone needs your help.</p>
                <Link to="/register/donor">
                  <Button variant="outline" className="gap-2 border-accent text-accent hover:bg-accent hover:text-accent-foreground">
                    Register as Donor <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="text-center mb-14">
            <span className="text-sm font-semibold text-primary uppercase tracking-widest">Process</span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 mt-2">How It Works</h2>
            <p className="text-muted-foreground">Simple steps to save lives</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((s, i) => (
              <div key={s.title} className="flex flex-col items-center text-center group">
                <div className="relative mb-6">
                  <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-shadow">
                    <s.icon className="h-9 w-9 text-primary-foreground" />
                  </div>
                  <span className="absolute -top-3 -right-3 h-8 w-8 rounded-full bg-accent text-accent-foreground text-sm font-bold flex items-center justify-center shadow-md">
                    {i + 1}
                  </span>
                </div>
                <h3 className="font-bold text-lg mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA with image */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={donateCtaImg} alt="Blood donation concept" width={1280} height={720} loading="lazy" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/90 to-background/80" />
        </div>
        <div className="container relative z-10 py-20 md:py-28">
          <div className="max-w-xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Make a Difference?</h2>
            <p className="text-muted-foreground mb-8 text-lg leading-relaxed">
              Join the network and help save lives by connecting hospitals and donors in real-time. Every donation counts.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/register/donor">
                <Button size="lg" className="gap-2 shadow-lg shadow-primary/25 text-base px-8">
                  Get Started <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/about">
                <Button size="lg" variant="outline" className="gap-2 text-base px-8">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
