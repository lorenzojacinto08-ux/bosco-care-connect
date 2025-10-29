import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Shield } from "lucide-react";

export default function GuidanceScheduling() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [scheduledDate, setScheduledDate] = useState("");
  const [reason, setReason] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    const { error } = await supabase.from("guidance_schedules").insert({
      student_id: user.id,
      scheduled_date: scheduledDate,
      reason: reason,
      status: "pending"
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to schedule appointment"
      });
    } else {
      toast({
        title: "Success",
        description: "Your appointment request has been submitted"
      });
      setScheduledDate("");
      setReason("");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-guidance to-pastoral flex items-center justify-center">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Guidance Scheduling</h1>
              <p className="text-xs text-muted-foreground">Request an Appointment</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate("/guidance")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
      </header>

      <main className="container px-4 py-16 max-w-2xl mx-auto">
        <Card className="border-t-4" style={{ borderTopColor: "hsl(var(--guidance))" }}>
          <CardHeader>
            <CardTitle className="text-2xl">Schedule Guidance Appointment</CardTitle>
            <CardDescription>Request a new guidance appointment</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="date">Preferred Date & Time</Label>
                <Input
                  id="date"
                  type="datetime-local"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reason">Reason for Appointment</Label>
                <Textarea
                  id="reason"
                  placeholder="Please describe why you need guidance..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={5}
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-guidance hover:bg-guidance/90" 
                disabled={loading}
              >
                {loading ? "Submitting..." : "Submit Request"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}