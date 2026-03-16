import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Phone, MapPin, Droplets, Calendar } from "lucide-react";

export default function DonorProfile() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">My Profile</h1>
      <Card className="max-w-lg">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div>
              <CardTitle className="text-muted-foreground">—</CardTitle>
              <Badge variant="secondary" className="mt-1">Unavailable</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Droplets className="h-4 w-4 text-accent" />
            <span className="text-sm text-muted-foreground">Blood Group: —</span>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="h-4 w-4 text-primary" />
            <span className="text-sm text-muted-foreground">—</span>
          </div>
          <div className="flex items-center gap-3">
            <MapPin className="h-4 w-4 text-primary" />
            <span className="text-sm text-muted-foreground">—</span>
          </div>
          <div className="flex items-center gap-3">
            <Calendar className="h-4 w-4 text-primary" />
            <span className="text-sm text-muted-foreground">Last Donation: —</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
