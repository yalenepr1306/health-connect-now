import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Phone, MapPin, Droplets, Calendar } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import * as profileService from "@/services/profileService";
import type { ProfileRecord } from "@/services/profileService";

export default function DonorProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<ProfileRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      const { data, error } = await profileService.getProfile(user.id);

      if (error) {
        toast({ title: "Profile load failed", description: error, variant: "destructive" });
        setLoading(false);
        return;
      }

      setProfile(data);
      setLoading(false);
    };

    loadProfile();
  }, [toast, user?.id]);

  // Subscribe to profile changes (e.g. availability toggle from another page)
  useEffect(() => {
    if (!user?.id) return;
    return profileService.subscribeToProfile(user.id, setProfile);
  }, [user?.id]);

  const formattedLastUpdate = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString()
    : "Not recorded";

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
              <CardTitle className="text-foreground">{profile?.name || user?.name || "—"}</CardTitle>
              <Badge variant={profile?.available ? "default" : "secondary"} className="mt-1">
                {profile?.available ? "Available" : "Unavailable"}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading profile...</p>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <Droplets className="h-4 w-4 text-accent" />
                <span className="text-sm text-muted-foreground">Blood Group: {profile?.blood_group || "—"}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">{profile?.phone || "—"}</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">{profile?.location || "—"}</span>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">Last Update: {formattedLastUpdate}</span>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
