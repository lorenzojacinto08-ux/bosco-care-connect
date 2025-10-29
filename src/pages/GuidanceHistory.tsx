import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Shield } from "lucide-react";

export default function GuidanceHistory() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("guidance_schedules")
      .select("*, profiles(full_name, email)")
      .order("scheduled_date", { ascending: false });

    if (!error && data) {
      setSchedules(data);
    }
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

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-guidance to-pastoral flex items-center justify-center">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Guidance History</h1>
              <p className="text-xs text-muted-foreground">Manage Appointments</p>
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
            <CardTitle className="text-2xl">Guidance History</CardTitle>
            <CardDescription>View and manage all guidance appointments</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schedules.map((schedule) => (
                    <TableRow key={schedule.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{schedule.profiles?.full_name}</div>
                          <div className="text-sm text-muted-foreground">{schedule.profiles?.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(schedule.scheduled_date).toLocaleString()}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{schedule.reason}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            schedule.status === "approved"
                              ? "default"
                              : schedule.status === "rejected"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {schedule.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Select
                            value={schedule.status}
                            onValueChange={(value) => updateStatus(schedule.id, value)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="approved">Approved</SelectItem>
                              <SelectItem value="rejected">Rejected</SelectItem>
                            </SelectContent>
                          </Select>
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
      </main>
    </div>
  );
}