import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, Shield, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function StudentRecords() {
  const navigate = useNavigate();
  const { role } = useAuth();
  const { toast } = useToast();

  // Redirect if not admin
  if (role !== "admin") {
    navigate("/");
    return null;
  }
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any>(null);

  // Form state
  const [studentId, setStudentId] = useState("");
  const [fullName, setFullName] = useState("");
  const [gender, setGender] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState<Date>();
  const [gradeYearLevel, setGradeYearLevel] = useState("");
  const [sectionProgram, setSectionProgram] = useState("");
  const [address, setAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [parentGuardianName, setParentGuardianName] = useState("");
  const [guardianContact, setGuardianContact] = useState("");
  const [guardianRelationship, setGuardianRelationship] = useState("");
  const [currentStatus, setCurrentStatus] = useState("Active");
  const [averageGrade, setAverageGrade] = useState("");
  const [subjectsCourses, setSubjectsCourses] = useState("");
  const [educationLevel, setEducationLevel] = useState<"grade_school" | "high_school" | "senior_high" | "college">("high_school");

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("student_records")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setStudents(data);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const studentData = {
      student_id: studentId,
      full_name: fullName,
      gender,
      date_of_birth: dateOfBirth ? format(dateOfBirth, "yyyy-MM-dd") : null,
      grade_year_level: gradeYearLevel,
      section_program: sectionProgram,
      address,
      phone_number: phoneNumber,
      email_address: emailAddress,
      parent_guardian_name: parentGuardianName,
      guardian_contact: guardianContact,
      guardian_relationship: guardianRelationship,
      current_status: currentStatus,
      average_grade: averageGrade,
      subjects_courses: subjectsCourses,
      education_level: educationLevel
    };

    let error;
    if (editingStudent) {
      ({ error } = await supabase
        .from("student_records")
        .update(studentData)
        .eq("id", editingStudent.id));
    } else {
      ({ error } = await supabase.from("student_records").insert(studentData));
    }

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message
      });
    } else {
      toast({
        title: "Success",
        description: `Student ${editingStudent ? "updated" : "added"} successfully`
      });
      resetForm();
      setOpen(false);
      fetchStudents();
    }
  };

  const deleteStudent = async (id: string) => {
    const { error } = await supabase.from("student_records").delete().eq("id", id);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete student"
      });
    } else {
      toast({
        title: "Success",
        description: "Student deleted successfully"
      });
      fetchStudents();
    }
  };

  const startEdit = (student: any) => {
    setEditingStudent(student);
    setStudentId(student.student_id);
    setFullName(student.full_name);
    setGender(student.gender || "");
    setDateOfBirth(student.date_of_birth ? new Date(student.date_of_birth) : undefined);
    setGradeYearLevel(student.grade_year_level);
    setSectionProgram(student.section_program || "");
    setAddress(student.address || "");
    setPhoneNumber(student.phone_number || "");
    setEmailAddress(student.email_address || "");
    setParentGuardianName(student.parent_guardian_name || "");
    setGuardianContact(student.guardian_contact || "");
    setGuardianRelationship(student.guardian_relationship || "");
    setCurrentStatus(student.current_status);
    setAverageGrade(student.average_grade || "");
    setSubjectsCourses(student.subjects_courses || "");
    setEducationLevel(student.education_level);
    setOpen(true);
  };

  const resetForm = () => {
    setEditingStudent(null);
    setStudentId("");
    setFullName("");
    setGender("");
    setDateOfBirth(undefined);
    setGradeYearLevel("");
    setSectionProgram("");
    setAddress("");
    setPhoneNumber("");
    setEmailAddress("");
    setParentGuardianName("");
    setGuardianContact("");
    setGuardianRelationship("");
    setCurrentStatus("Active");
    setAverageGrade("");
    setSubjectsCourses("");
    setEducationLevel("high_school");
  };

  const filterStudentsByLevel = (level: string) => {
    return students.filter(s => s.education_level === level);
  };

  const StudentTable = ({ data }: { data: any[] }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Student ID</TableHead>
          <TableHead>Full Name</TableHead>
          <TableHead>Grade/Year</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className="text-center text-muted-foreground">
              No students found
            </TableCell>
          </TableRow>
        ) : (
          data.map((student) => (
            <TableRow key={student.id}>
              <TableCell className="font-medium">{student.student_id}</TableCell>
              <TableCell>{student.full_name}</TableCell>
              <TableCell>{student.grade_year_level}</TableCell>
              <TableCell>{student.current_status}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => startEdit(student)}>
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteStudent(student.id)}
                  >
                    Delete
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-guidance to-pastoral flex items-center justify-center">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Student Records</h1>
              <p className="text-xs text-muted-foreground">Manage Student Information</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate("/student-applications")}>
              View Applications
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate("/")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
            <Dialog open={open} onOpenChange={(isOpen) => {
              setOpen(isOpen);
              if (!isOpen) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Student
                </Button>
              </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingStudent ? "Edit" : "Add"} Student Record</DialogTitle>
                <DialogDescription>
                  {editingStudent ? "Update" : "Enter"} student information
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="studentId">Student ID *</Label>
                    <Input
                      id="studentId"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      required
                    />
                  </div>
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
                    <Label htmlFor="gender">Gender</Label>
                    <Select value={gender} onValueChange={setGender}>
                      <SelectTrigger id="gender">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Date of Birth</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !dateOfBirth && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dateOfBirth ? format(dateOfBirth, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={dateOfBirth}
                          onSelect={setDateOfBirth}
                          disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gradeLevel">Grade / Year Level *</Label>
                    <Input
                      id="gradeLevel"
                      value={gradeYearLevel}
                      onChange={(e) => setGradeYearLevel(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="section">Section / Program</Label>
                    <Input
                      id="section"
                      value={sectionProgram}
                      onChange={(e) => setSectionProgram(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={emailAddress}
                      onChange={(e) => setEmailAddress(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="parent">Parent/Guardian Name</Label>
                    <Input
                      id="parent"
                      value={parentGuardianName}
                      onChange={(e) => setParentGuardianName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="guardianContact">Guardian Contact</Label>
                    <Input
                      id="guardianContact"
                      value={guardianContact}
                      onChange={(e) => setGuardianContact(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="relationship">Relationship</Label>
                    <Input
                      id="relationship"
                      value={guardianRelationship}
                      onChange={(e) => setGuardianRelationship(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Current Status *</Label>
                    <Select value={currentStatus} onValueChange={setCurrentStatus}>
                      <SelectTrigger id="status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Transferred">Transferred</SelectItem>
                        <SelectItem value="Graduated">Graduated</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="avgGrade">Average Grade</Label>
                    <Input
                      id="avgGrade"
                      value={averageGrade}
                      onChange={(e) => setAverageGrade(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="educationLevel">Education Level *</Label>
                    <Select value={educationLevel} onValueChange={(value: any) => setEducationLevel(value)}>
                      <SelectTrigger id="educationLevel">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="grade_school">Grade School</SelectItem>
                        <SelectItem value="high_school">High School</SelectItem>
                        <SelectItem value="senior_high">Senior High School</SelectItem>
                        <SelectItem value="college">College</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="subjects">Subjects / Courses Enrolled</Label>
                    <Input
                      id="subjects"
                      value={subjectsCourses}
                      onChange={(e) => setSubjectsCourses(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button 
                    type="submit" 
                    className="flex-1 bg-guidance hover:bg-guidance/90"
                  >
                    {editingStudent ? "Update" : "Create"}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => {
                      setOpen(false);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <main className="container px-4 py-16">
        <Card className="border-t-4" style={{ borderTopColor: "hsl(var(--student))" }}>
          <CardHeader>
            <CardTitle className="text-2xl">Student Records</CardTitle>
            <CardDescription>Manage student information by education level</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : (
              <Tabs defaultValue="high_school">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="grade_school">Grade School</TabsTrigger>
                  <TabsTrigger value="high_school">High School</TabsTrigger>
                  <TabsTrigger value="senior_high">Senior High</TabsTrigger>
                  <TabsTrigger value="college">College</TabsTrigger>
                </TabsList>
                <TabsContent value="grade_school" className="mt-4">
                  <StudentTable data={filterStudentsByLevel("grade_school")} />
                </TabsContent>
                <TabsContent value="high_school" className="mt-4">
                  <StudentTable data={filterStudentsByLevel("high_school")} />
                </TabsContent>
                <TabsContent value="senior_high" className="mt-4">
                  <StudentTable data={filterStudentsByLevel("senior_high")} />
                </TabsContent>
                <TabsContent value="college" className="mt-4">
                  <StudentTable data={filterStudentsByLevel("college")} />
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}