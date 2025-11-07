import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, Shield, Eye } from "lucide-react";
import { format } from "date-fns";

export default function GuidanceHistoryArchive() {
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<any>(null);

  useEffect(() => {
    fetchCompletedSchedules();
  }, []);

  const fetchCompletedSchedules = async () => {
    setLoading(true);
    
    // Fetch completed schedules
    const { data: schedulesData, error: schedulesError } = await supabase
      .from("guidance_schedules")
      .select("*")
      .eq("status", "completed")
      .order("scheduled_date", { ascending: false });

    if (schedulesError || !schedulesData) {
      console.error("Error fetching schedules:", schedulesError);
      setLoading(false);
      return;
    }

    // Fetch profiles and student records for each schedule
    const schedulesWithDetails = await Promise.all(
      schedulesData.map(async (schedule) => {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("full_name, email")
          .eq("id", schedule.student_id)
          .single();
        
        const { data: studentData } = await supabase
          .from("student_records")
          .select("student_id, full_name")
          .eq("email_address", profileData?.email)
          .maybeSingle();
        
        return {
          ...schedule,
          profiles: profileData,
          student_record: studentData
        };
      })
    );

    setSchedules(schedulesWithDetails);
    setLoading(false);
  };

  const openViewDialog = (schedule: any) => {
    setSelectedSchedule(schedule);
    setViewDialogOpen(true);
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
              <h1 className="text-xl font-bold text-foreground">Guidance History Archive</h1>
              <p className="text-xs text-muted-foreground">Completed Appointments</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate("/guidance")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
      </header>

      <main className="container px-4 py-16">
        <Card className="border-t-4" style={{ borderTopColor: "hsl(var(--guidance))" }}>
          <CardHeader>
            <CardTitle className="text-2xl">Completed Appointments</CardTitle>
            <CardDescription>View history of all completed guidance sessions</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : schedules.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No completed appointments yet
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schedules.map((schedule) => (
                    <TableRow key={schedule.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {schedule.student_record?.full_name || schedule.profiles?.full_name}
                          </div>
                          <div className="text-sm text-muted-foreground">{schedule.profiles?.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {format(new Date(schedule.scheduled_date), "PPP p")}
                      </TableCell>
                      <TableCell>
                        <Badge variant="default">Completed</Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openViewDialog(schedule)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
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
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Appointment Details</DialogTitle>
              <DialogDescription>View completed appointment information</DialogDescription>
            </DialogHeader>
            {selectedSchedule && (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Student</p>
                  <p className="font-medium">{selectedSchedule.profiles?.full_name}</p>
                  <p className="text-sm text-muted-foreground">{selectedSchedule.profiles?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Scheduled Date & Time</p>
                  <p className="font-medium">{format(new Date(selectedSchedule.scheduled_date), "PPP p")}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <div className="mt-1">
                    <Badge variant="default">Completed</Badge>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Reason</p>
                  <p className="font-medium whitespace-pre-wrap">{selectedSchedule.reason}</p>
                </div>
                {selectedSchedule.notes && (
                  <div>
                    <p className="text-sm text-muted-foreground">Notes</p>
                    <p className="font-medium whitespace-pre-wrap">{selectedSchedule.notes}</p>
                  </div>
                )}
                {selectedSchedule.remarks && (
                  <div>
                    <p className="text-sm text-muted-foreground">Session Remarks</p>
                    <p className="font-medium whitespace-pre-wrap">{selectedSchedule.remarks}</p>
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