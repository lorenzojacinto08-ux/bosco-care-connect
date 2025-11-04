import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Shield, Pencil, Eye, CalendarIcon, Clock, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function GuidanceHistory() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<any>(null);
  
  // Edit form state
  const [editDate, setEditDate] = useState<Date>();
  const [editTime, setEditTime] = useState("09:00");
  const [editReason, setEditReason] = useState("");
  const [editNotes, setEditNotes] = useState("");

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    setLoading(true);
    
    // Fetch schedules (only pending and confirmed)
    const { data: schedulesData, error: schedulesError } = await supabase
      .from("guidance_schedules")
      .select("*")
      .in("status", ["pending", "confirmed"])
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

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from("guidance_schedules")
      .update({ status })
      .eq("id", id);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update status"
      });
    } else {
      toast({
        title: "Success",
        description: "Status updated successfully"
      });
      fetchSchedules();
    }
  };

  const deleteSchedule = async (id: string) => {
    const { error } = await supabase
      .from("guidance_schedules")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete appointment"
      });
    } else {
      toast({
        title: "Success",
        description: "Appointment deleted successfully"
      });
      fetchSchedules();
    }
  };

  const markAsDone = async (id: string) => {
    const { error } = await supabase
      .from("guidance_schedules")
      .update({ status: "completed" })
      .eq("id", id);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to mark as done"
      });
    } else {
      toast({
        title: "Success",
        description: "Appointment marked as completed"
      });
      fetchSchedules();
    }
  };

  const openEditDialog = (schedule: any) => {
    setSelectedSchedule(schedule);
    const date = new Date(schedule.scheduled_date);
    setEditDate(date);
    setEditTime(format(date, "HH:mm"));
    setEditReason(schedule.reason);
    setEditNotes(schedule.notes || "");
    setEditDialogOpen(true);
  };

  const openViewDialog = (schedule: any) => {
    setSelectedSchedule(schedule);
    setViewDialogOpen(true);
  };

  const handleEditSubmit = async () => {
    if (!selectedSchedule || !editDate) return;

    // Combine date and time
    const [hours, minutes] = editTime.split(':');
    const combinedDateTime = new Date(editDate);
    combinedDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    const { error } = await supabase
      .from("guidance_schedules")
      .update({
        scheduled_date: combinedDateTime.toISOString(),
        reason: editReason,
        notes: editNotes
      })
      .eq("id", selectedSchedule.id);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update appointment"
      });
    } else {
      toast({
        title: "Success",
        description: "Appointment updated successfully"
      });
      setEditDialogOpen(false);
      fetchSchedules();
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
              <h1 className="text-xl font-bold text-foreground">Guidance Schedules</h1>
              <p className="text-xs text-muted-foreground">Manage Student Schedules</p>
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
            <CardTitle className="text-2xl">Student Schedules</CardTitle>
            <CardDescription>View and manage all student guidance schedules</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading...</div>
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
                        {new Date(schedule.scheduled_date).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            schedule.status === "completed"
                              ? "default"
                              : schedule.status === "approved"
                              ? "secondary"
                              : schedule.status === "rejected"
                              ? "destructive"
                              : "outline"
                          }
                        >
                          {schedule.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2 flex-wrap">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openViewDialog(schedule)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(schedule)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          {schedule.status !== "completed" && (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => markAsDone(schedule.id)}
                              className="bg-guidance hover:bg-guidance/90"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteSchedule(schedule.id)}
                          >
                            Delete
                          </Button>
                        </div>
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
              <DialogDescription>View full appointment information</DialogDescription>
            </DialogHeader>
            {selectedSchedule && (
              <div className="space-y-4">
                <div>
                  <Label className="text-muted-foreground">Student</Label>
                  <p className="font-medium">{selectedSchedule.profiles?.full_name}</p>
                  <p className="text-sm text-muted-foreground">{selectedSchedule.profiles?.email}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Scheduled Date & Time</Label>
                  <p className="font-medium">{new Date(selectedSchedule.scheduled_date).toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <div className="mt-1">
                    <Badge
                      variant={
                        selectedSchedule.status === "completed"
                          ? "default"
                          : selectedSchedule.status === "approved"
                          ? "secondary"
                          : selectedSchedule.status === "rejected"
                          ? "destructive"
                          : "outline"
                      }
                    >
                      {selectedSchedule.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Reason</Label>
                  <p className="font-medium whitespace-pre-wrap">{selectedSchedule.reason}</p>
                </div>
                {selectedSchedule.notes && (
                  <div>
                    <Label className="text-muted-foreground">Notes</Label>
                    <p className="font-medium whitespace-pre-wrap">{selectedSchedule.notes}</p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Appointment</DialogTitle>
              <DialogDescription>Update appointment details</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Scheduled Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !editDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {editDate ? format(editDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={editDate}
                        onSelect={setEditDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="editTime">Scheduled Time *</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="editTime"
                      type="time"
                      value={editTime}
                      onChange={(e) => setEditTime(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="editReason">Reason *</Label>
                <Textarea
                  id="editReason"
                  value={editReason}
                  onChange={(e) => setEditReason(e.target.value)}
                  rows={4}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="editNotes">Notes</Label>
                <Textarea
                  id="editNotes"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  rows={4}
                  placeholder="Additional information about the appointment..."
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleEditSubmit}>
                  Save Changes
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}