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
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Shield, CalendarIcon, Clock } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

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
  const [scheduledDate, setScheduledDate] = useState<Date>();
  const [scheduledTime, setScheduledTime] = useState("09:00");
  const [reason, setReason] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");

  // Fetch student record and check for existing pending schedules
  useEffect(() => {
    const fetchStudentRecord = async () => {
      if (!user) return;
      
      // Check if student already has a pending schedule
      const { data: existingSchedule } = await supabase
        .from("guidance_schedules")
        .select("id")
        .eq("student_id", user.id)
        .in("status", ["pending", "confirmed"])
        .maybeSingle();
      
      if (existingSchedule) {
        toast({
          title: "Existing Schedule",
          description: "You already have a pending appointment. Please wait for it to be completed.",
        });
        navigate("/");
        return;
      }
      
      // First try to get student record by email
      const { data: studentRecord } = await supabase
        .from("student_records")
        .select("*")
        .eq("email_address", user.email)
        .maybeSingle();
      
      if (studentRecord) {
        // Pre-fill all fields from student record
        setFullName(studentRecord.full_name || "");
        setEmail(studentRecord.email_address || "");
        setStudentId(studentRecord.student_id || "");
        setYearLevel(studentRecord.grade_year_level || "");
        setContactNumber(studentRecord.phone_number || "");
      } else {
        // Fallback to profile if no student record
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, email")
          .eq("id", user.id)
          .maybeSingle();
        
        if (profile) {
          setFullName(profile.full_name || "");
          setEmail(profile.email || "");
        }
      }
      setProfileLoading(false);
    };
    
    fetchStudentRecord();
  }, [user, navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !scheduledDate) return;

    setLoading(true);

    // Combine date and time
    const [hours, minutes] = scheduledTime.split(':');
    const combinedDateTime = new Date(scheduledDate);
    combinedDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

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
      scheduled_date: combinedDateTime.toISOString(),
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
      setLoading(false);
    } else {
      toast({
        title: "Success",
        description: "Your appointment request has been submitted"
      });
      navigate("/");
    }
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
                {/* Student Information Display */}
                {(fullName || email || studentId || yearLevel || contactNumber) && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground border-b pb-2">Student Information</h3>
                    <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                      {fullName && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Name:</span>
                          <span className="font-medium">{fullName}</span>
                        </div>
                      )}
                      {email && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Email:</span>
                          <span className="font-medium">{email}</span>
                        </div>
                      )}
                      {studentId && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Student ID:</span>
                          <span className="font-medium">{studentId}</span>
                        </div>
                      )}
                      {yearLevel && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Year Level:</span>
                          <span className="font-medium">{yearLevel}</span>
                        </div>
                      )}
                      {contactNumber && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Contact:</span>
                          <span className="font-medium">{contactNumber}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

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
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Preferred Date *</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !scheduledDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {scheduledDate ? format(scheduledDate, "PPP") : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={scheduledDate}
                            onSelect={setScheduledDate}
                            disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="time">Preferred Time *</Label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="time"
                          type="time"
                          value={scheduledTime}
                          onChange={(e) => setScheduledTime(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
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