import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Shield } from "lucide-react";

export default function GuidanceScheduling() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  
  // Form fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [studentId, setStudentId] = useState("");
  const [yearLevel, setYearLevel] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [concernType, setConcernType] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [reason, setReason] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");

  // Fetch user profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("id", user.id)
        .maybeSingle();
      
      if (data) {
        setFullName(data.full_name || "");
        setEmail(data.email || "");
      }
      setProfileLoading(false);
    };
    
    fetchProfile();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    // Compile detailed notes
    const detailedNotes = `
Student Information:
- Name: ${fullName}
- Email: ${email}
- Student ID: ${studentId}
- Year Level: ${yearLevel}
- Contact: ${contactNumber}
- Type of Concern: ${concernType}

Additional Information:
${additionalInfo}
    `.trim();

    const { error } = await supabase.from("guidance_schedules").insert({
      student_id: user.id,
      scheduled_date: scheduledDate,
      reason: reason,
      notes: detailedNotes,
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
      // Reset form
      setStudentId("");
      setYearLevel("");
      setContactNumber("");
      setConcernType("");
      setScheduledDate("");
      setReason("");
      setAdditionalInfo("");
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
            {profileLoading ? (
              <div className="text-center py-8">Loading profile...</div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Student Information Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground border-b pb-2">Student Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name *</Label>
                      <Input
                        id="fullName"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Enter your full name"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your.email@example.com"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="studentId">Student ID *</Label>
                      <Input
                        id="studentId"
                        value={studentId}
                        onChange={(e) => setStudentId(e.target.value)}
                        placeholder="e.g., 2024-00123"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="yearLevel">Year Level / Grade *</Label>
                      <Input
                        id="yearLevel"
                        value={yearLevel}
                        onChange={(e) => setYearLevel(e.target.value)}
                        placeholder="e.g., Grade 11, 3rd Year"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="contactNumber">Contact Number *</Label>
                      <Input
                        id="contactNumber"
                        type="tel"
                        value={contactNumber}
                        onChange={(e) => setContactNumber(e.target.value)}
                        placeholder="+63 XXX XXX XXXX"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Appointment Details Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground border-b pb-2">Appointment Details</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="concernType">Type of Concern *</Label>
                    <Select value={concernType} onValueChange={setConcernType} required>
                      <SelectTrigger id="concernType">
                        <SelectValue placeholder="Select type of concern" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Academic">Academic Concerns</SelectItem>
                        <SelectItem value="Personal">Personal/Emotional Issues</SelectItem>
                        <SelectItem value="Career">Career Guidance</SelectItem>
                        <SelectItem value="Behavioral">Behavioral Concerns</SelectItem>
                        <SelectItem value="Family">Family Issues</SelectItem>
                        <SelectItem value="Social">Social/Peer Relations</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="date">Preferred Date & Time *</Label>
                    <Input
                      id="date"
                      type="datetime-local"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="reason">Detailed Reason for Appointment *</Label>
                    <Textarea
                      id="reason"
                      placeholder="Please provide a detailed description of your concern..."
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      rows={4}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="additionalInfo">Additional Information (Optional)</Label>
                    <Textarea
                      id="additionalInfo"
                      placeholder="Any other relevant information you'd like to share..."
                      value={additionalInfo}
                      onChange={(e) => setAdditionalInfo(e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-guidance hover:bg-guidance/90 text-white" 
                  disabled={loading}
                  size="lg"
                >
                  {loading ? "Submitting..." : "Submit Appointment Request"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}