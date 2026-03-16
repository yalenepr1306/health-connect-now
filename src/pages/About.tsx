import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Heart, Shield, Users, Zap } from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container py-16 flex-1">
        <h1 className="text-4xl font-bold mb-4">About USHN</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mb-12">
          The Unified Smart Hospital Network is a healthcare platform designed to bridge the gap between hospitals and blood/organ donors through real-time availability tracking and intelligent matching.
        </p>
        <div className="grid md:grid-cols-2 gap-8">
          {[
            { icon: Heart, title: "Our Mission", desc: "To ensure no patient suffers due to lack of blood or organ availability by creating a connected healthcare ecosystem." },
            { icon: Shield, title: "Trust & Safety", desc: "All hospitals are verified through license validation, and donor data is protected with enterprise-grade security." },
            { icon: Users, title: "Community", desc: "Thousands of donors and hospitals connected in a single network, ready to respond to emergencies." },
            { icon: Zap, title: "Real-time", desc: "Instant updates on blood stock, organ availability, and emergency alerts ensure the fastest possible response." },
          ].map((item) => (
            <div key={item.title} className="flex gap-4">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <item.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
