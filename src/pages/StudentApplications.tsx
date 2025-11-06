import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Users, Eye, CheckCircle, XCircle } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function StudentApplications() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    
    const { data, error } = await supabase
      .from("student_applications")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching applications:", error);
    } else {
      setApplications(data || []);
    }
    
    setLoading(false);
  };

  const approveApplication = async (application: any) => {
    // Insert into student_records
    const { error: insertError } = await supabase
      .from("student_records")
      .insert({
        full_name: application.full_name,
        student_id: application.student_id,
        date_of_birth: application.date_of_birth,
        gender: application.gender,
        email_address: application.email_address,
        phone_number: application.phone_number,
        address: application.address,
        grade_year_level: application.grade_year_level,
        section_program: application.section_program,
        education_level: application.education_level,
        parent_guardian_name: application.parent_guardian_name,
        guardian_contact: application.guardian_contact,
        guardian_relationship: application.guardian_relationship,
        current_status: "Active"
      });

    if (insertError) {
      console.error("Insert error:", insertError);
      toast({
        variant: "destructive",
        title: "Error",
        description: insertError.message || "Failed to create student record"
      });
      return;
    }

    // Update application status
    const { error: updateError } = await supabase
      .from("student_applications")
      .update({ status: "approved" })
      .eq("id", application.id);

    if (updateError) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update application status"
      });
    } else {
      toast({
        title: "Success",
        description: "Application approved and student record created"
      });
      setViewDialogOpen(false);
      fetchApplications();
    }
  };

  const rejectApplication = async (id: string) => {
    if (!rejectionReason.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please provide a reason for rejection"
      });
      return;
    }

    const { error } = await supabase
      .from("student_applications")
      .update({ 
        status: "rejected",
        rejection_reason: rejectionReason
      })
      .eq("id", id);

    if (error) {
      console.error("Rejection error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to reject application"
      });
    } else {
      toast({
        title: "Success",
        description: "Application rejected with reason"
      });
      setViewDialogOpen(false);
      setRejectionReason("");
      fetchApplications();
    }
  };

  const openViewDialog = (application: any) => {
    setSelectedApplication(application);
    setRejectionReason("");
    setViewDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-student to-guidance flex items-center justify-center">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Student Applications</h1>
              <p className="text-xs text-muted-foreground">Review and Approve</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate("/student-records")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
      </header>

      <main className="container px-4 py-16">
        <Card className="border-t-4" style={{ borderTopColor: "hsl(var(--student))" }}>
          <CardHeader>
            <CardTitle className="text-2xl">Pending Applications</CardTitle>
            <CardDescription>Review and approve student applications</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : applications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No applications found</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Student ID</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date Submitted</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications.map((application) => (
                    <TableRow key={application.id}>
                      <TableCell className="font-medium">{application.full_name}</TableCell>
                      <TableCell>{application.student_id}</TableCell>
                      <TableCell>{application.email_address}</TableCell>
                      <TableCell>{application.grade_year_level}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            application.status === "approved"
                              ? "default"
                              : application.status === "rejected"
                              ? "destructive"
                              : "outline"
                          }
                        >
                          {application.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(application.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openViewDialog(application)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* View Dialog */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Application Details</DialogTitle>
              <DialogDescription>Review student application information</DialogDescription>
            </DialogHeader>
            {selectedApplication && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">Personal Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Full Name</p>
                      <p className="font-medium">{selectedApplication.full_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Student ID</p>
                      <p className="font-medium">{selectedApplication.student_id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Date of Birth</p>
                      <p className="font-medium">
                        {selectedApplication.date_of_birth 
                          ? new Date(selectedApplication.date_of_birth).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Gender</p>
                      <p className="font-medium">{selectedApplication.gender || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{selectedApplication.email_address}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium">{selectedApplication.phone_number || "N/A"}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-muted-foreground">Address</p>
                      <p className="font-medium">{selectedApplication.address || "N/A"}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">Academic Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Education Level</p>
                      <p className="font-medium capitalize">{selectedApplication.education_level}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Grade/Year Level</p>
                      <p className="font-medium">{selectedApplication.grade_year_level}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-muted-foreground">Section/Program</p>
                      <p className="font-medium">{selectedApplication.section_program || "N/A"}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">Guardian Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Parent/Guardian Name</p>
                      <p className="font-medium">{selectedApplication.parent_guardian_name || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Contact</p>
                      <p className="font-medium">{selectedApplication.guardian_contact || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Relationship</p>
                      <p className="font-medium">{selectedApplication.guardian_relationship || "N/A"}</p>
                    </div>
                  </div>
                </div>

                {selectedApplication.status === "pending" && (
                  <div className="space-y-4 pt-4 border-t">
                    <div className="space-y-2">
                      <Label htmlFor="rejection-reason">Rejection Reason (if rejecting)</Label>
                      <Textarea
                        id="rejection-reason"
                        placeholder="Provide a reason if you're rejecting this application..."
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        rows={3}
                      />
                    </div>
                    <div className="flex gap-3 justify-end">
                      <Button
                        variant="outline"
                        onClick={() => rejectApplication(selectedApplication.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Reject
                      </Button>
                      <Button
                        onClick={() => approveApplication(selectedApplication)}
                        className="bg-student hover:bg-student/90 text-white"
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Approve & Create Record
                      </Button>
                    </div>
                  </div>
                )}

                {selectedApplication.status === "rejected" && selectedApplication.rejection_reason && (
                  <div className="space-y-2 p-4 border rounded-lg bg-destructive/10">
                    <p className="text-sm font-semibold text-destructive">Rejection Reason:</p>
                    <p className="text-sm">{selectedApplication.rejection_reason}</p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
