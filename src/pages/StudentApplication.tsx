import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Users, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function StudentApplication() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [existingApplication, setExistingApplication] = useState<any>(null);
  
  // Form fields
  const [fullName, setFullName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [gradeYearLevel, setGradeYearLevel] = useState("");
  const [sectionProgram, setSectionProgram] = useState("");
  const [educationLevel, setEducationLevel] = useState("");
  const [parentGuardianName, setParentGuardianName] = useState("");
  const [guardianContact, setGuardianContact] = useState("");
  const [guardianRelationship, setGuardianRelationship] = useState("");

  useEffect(() => {
    const checkExistingApplication = async () => {
      if (!user) return;
      
      const { data: application } = await supabase
        .from("student_applications")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      
      if (application) {
        setExistingApplication(application);
      } else {
        // Pre-fill with profile data
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, email")
          .eq("id", user.id)
          .maybeSingle();
        
        if (profile) {
          setFullName(profile.full_name || "");
          setEmail(profile.email || user.email || "");
        }
      }
    };
    
    checkExistingApplication();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    const applicationData = {
      user_id: user.id,
      full_name: fullName,
      student_id: studentId,
      date_of_birth: dateOfBirth || null,
      gender: gender || null,
      email_address: email,
      phone_number: phoneNumber || null,
      address: address || null,
      grade_year_level: gradeYearLevel,
      section_program: sectionProgram || null,
      education_level: educationLevel,
      parent_guardian_name: parentGuardianName || null,
      guardian_contact: guardianContact || null,
      guardian_relationship: guardianRelationship || null,
      status: "pending",
      rejection_reason: null
    };

    const { error } = await supabase
      .from("student_applications")
      .insert(applicationData);

    if (error) {
      console.error("Application error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to submit application"
      });
      setLoading(false);
    } else {
      toast({
        title: "Success",
        description: "Your application has been submitted for review"
      });
      navigate("/");
    }
  };

  const handleResubmit = async () => {
    if (!user || !existingApplication) return;
    
    setLoading(true);
    
    // Update existing application to pending and clear rejection reason
    const { error } = await supabase
      .from("student_applications")
      .update({ 
        status: "pending",
        rejection_reason: null
      })
      .eq("id", existingApplication.id);
    
    if (error) {
      console.error("Resubmit error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to resubmit application"
      });
      setLoading(false);
    } else {
      toast({
        title: "Success",
        description: "Your application has been resubmitted for review"
      });
      // Refresh the application status
      const { data } = await supabase
        .from("student_applications")
        .select("*")
        .eq("id", existingApplication.id)
        .maybeSingle();
      
      setExistingApplication(data);
      setLoading(false);
    }
  };

  if (existingApplication) {
    return (
      <div className="min-h-screen bg-muted/30">
        <header className="border-b bg-background">
          <div className="container flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-student to-guidance flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Student Application</h1>
                <p className="text-xs text-muted-foreground">Application Status</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate("/")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </div>
        </header>

        <main className="container px-4 py-16 max-w-2xl mx-auto">
          <Card className="border-t-4" style={{ borderTopColor: existingApplication.status === "rejected" ? "hsl(var(--destructive))" : "hsl(var(--student))" }}>
            <CardHeader>
              <div className="flex items-center gap-3">
                {existingApplication.status === "rejected" ? (
                  <AlertCircle className="h-8 w-8 text-destructive" />
                ) : (
                  <CheckCircle className="h-8 w-8 text-student" />
                )}
                <div>
                  <CardTitle className="text-2xl">
                    {existingApplication.status === "rejected" ? "Application Rejected" : "Application Submitted"}
                  </CardTitle>
                  <CardDescription>
                    {existingApplication.status === "rejected" 
                      ? "Your application was not approved" 
                      : "Your application is under review"}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Status:</span>
                    <span className="font-semibold text-lg capitalize">{existingApplication.status}</span>
                  </div>
                </div>

                {existingApplication.status === "rejected" && existingApplication.rejection_reason && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Rejection Reason</AlertTitle>
                    <AlertDescription>
                      {existingApplication.rejection_reason}
                    </AlertDescription>
                  </Alert>
                )}

                <p className="text-sm text-muted-foreground">
                  Your application was submitted on {new Date(existingApplication.created_at).toLocaleDateString()}.
                  {existingApplication.status === "pending" && " The admin will review your application and update your student record upon approval."}
                  {existingApplication.status === "approved" && " Your application has been approved and a student record has been created."}
                  {existingApplication.status === "rejected" && " Please review the rejection reason above and resubmit if you'd like to apply again."}
                </p>

                {existingApplication.status === "rejected" && (
                  <Button 
                    onClick={handleResubmit}
                    disabled={loading}
                    className="w-full bg-student hover:bg-student/90 text-white"
                    size="lg"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    {loading ? "Resubmitting..." : "Resubmit Application"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-student to-guidance flex items-center justify-center">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Student Application</h1>
              <p className="text-xs text-muted-foreground">Fill Your Information</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate("/")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
      </header>

      <main className="container px-4 py-16 max-w-3xl mx-auto">
        <Card className="border-t-4" style={{ borderTopColor: "hsl(var(--student))" }}>
          <CardHeader>
            <CardTitle className="text-2xl">Student Information Form</CardTitle>
            <CardDescription>Please fill in all required fields to submit your application</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground border-b pb-2">Personal Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="studentId">Student ID *</Label>
                    <Input
                      id="studentId"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select value={gender} onValueChange={setGender}>
                      <SelectTrigger id="gender">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    <Input
                      id="phoneNumber"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground border-b pb-2">Academic Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="educationLevel">Education Level *</Label>
                    <Select value={educationLevel} onValueChange={setEducationLevel} required>
                      <SelectTrigger id="educationLevel">
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="elementary">Elementary</SelectItem>
                        <SelectItem value="junior_high">Junior High School</SelectItem>
                        <SelectItem value="senior_high">Senior High School</SelectItem>
                        <SelectItem value="college">College</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="gradeYearLevel">Grade/Year Level *</Label>
                    <Input
                      id="gradeYearLevel"
                      placeholder="e.g., Grade 7, Year 1"
                      value={gradeYearLevel}
                      onChange={(e) => setGradeYearLevel(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sectionProgram">Section/Program</Label>
                  <Input
                    id="sectionProgram"
                    placeholder="e.g., Section A, STEM"
                    value={sectionProgram}
                    onChange={(e) => setSectionProgram(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground border-b pb-2">Guardian Information</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="parentGuardianName">Parent/Guardian Name</Label>
                  <Input
                    id="parentGuardianName"
                    value={parentGuardianName}
                    onChange={(e) => setParentGuardianName(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="guardianContact">Guardian Contact</Label>
                    <Input
                      id="guardianContact"
                      value={guardianContact}
                      onChange={(e) => setGuardianContact(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="guardianRelationship">Relationship</Label>
                    <Input
                      id="guardianRelationship"
                      placeholder="e.g., Mother, Father"
                      value={guardianRelationship}
                      onChange={(e) => setGuardianRelationship(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-student hover:bg-student/90 text-white" 
                disabled={loading}
                size="lg"
              >
                {loading ? "Submitting..." : "Submit Application"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
