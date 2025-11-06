import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, Shield, Eye } from "lucide-react";

export default function SacramentalScriptures() {
  const navigate = useNavigate();
  const { role, user } = useAuth();
  const { toast } = useToast();
  const [scriptures, setScriptures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editingScripture, setEditingScripture] = useState<any>(null);
  const [selectedScripture, setSelectedScripture] = useState<any>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [sacramentType, setSacramentType] = useState("");

  useEffect(() => {
    fetchScriptures();
  }, []);

  const fetchScriptures = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("sacramental_scriptures")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setScriptures(data);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const scriptureData = {
      title,
      content,
      sacrament_type: sacramentType,
      created_by: user.id
    };

    let error;
    if (editingScripture) {
      ({ error } = await supabase
        .from("sacramental_scriptures")
        .update(scriptureData)
        .eq("id", editingScripture.id));
    } else {
      ({ error } = await supabase.from("sacramental_scriptures").insert(scriptureData));
    }

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save scripture"
      });
    } else {
      toast({
        title: "Success",
        description: `Scripture ${editingScripture ? "updated" : "created"} successfully`
      });
      resetForm();
      setOpen(false);
      fetchScriptures();
    }
  };

  const deleteScripture = async (id: string) => {
    const { error } = await supabase.from("sacramental_scriptures").delete().eq("id", id);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete scripture"
      });
    } else {
      toast({
        title: "Success",
        description: "Scripture deleted successfully"
      });
      fetchScriptures();
    }
  };

  const startEdit = (scripture: any) => {
    setEditingScripture(scripture);
    setTitle(scripture.title);
    setContent(scripture.content);
    setSacramentType(scripture.sacrament_type || "");
    setOpen(true);
  };

  const resetForm = () => {
    setEditingScripture(null);
    setTitle("");
    setContent("");
    setSacramentType("");
  };

  const openViewDialog = (scripture: any) => {
    setSelectedScripture(scripture);
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
              <h1 className="text-xl font-bold text-foreground">Sacramental Scriptures</h1>
              <p className="text-xs text-muted-foreground">Spiritual Resources</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate("/pastoral")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            {role === "admin" && (
              <Dialog open={open} onOpenChange={(isOpen) => {
                setOpen(isOpen);
                if (!isOpen) resetForm();
              }}>
                <DialogTrigger asChild>
                  <Button className="bg-pastoral hover:bg-pastoral/90 text-white">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Scripture
                  </Button>
                </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingScripture ? "Edit" : "Add"} Sacramental Scripture</DialogTitle>
                  <DialogDescription>
                    {editingScripture ? "Update" : "Create a new"} sacramental scripture
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sacramentType">Sacrament Type</Label>
                    <Input
                      id="sacramentType"
                      value={sacramentType}
                      onChange={(e) => setSacramentType(e.target.value)}
                      placeholder="e.g., Baptism, Communion, etc."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="content">Content</Label>
                    <Textarea
                      id="content"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      rows={8}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full bg-pastoral hover:bg-pastoral/90 text-white">
                    {editingScripture ? "Update" : "Create"} Scripture
                  </Button>
                </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </header>

      <main className="container px-4 py-16">
        <Card className="border-t-4" style={{ borderTopColor: "hsl(var(--pastoral))" }}>
          <CardHeader>
            <CardTitle className="text-2xl">Sacramental Scriptures</CardTitle>
            <CardDescription>Spiritual texts and readings</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : scriptures.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No scriptures found</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Sacrament Type</TableHead>
                    <TableHead>Content Preview</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scriptures.map((scripture) => (
                    <TableRow key={scripture.id}>
                      <TableCell className="font-medium">{scripture.title}</TableCell>
                      <TableCell>{scripture.sacrament_type || "N/A"}</TableCell>
                      <TableCell className="max-w-md">
                        <p className="truncate">{scripture.content}</p>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openViewDialog(scripture)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {role === "admin" && (
                            <>
                              <Button size="sm" variant="outline" onClick={() => startEdit(scripture)}>
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => deleteScripture(scripture.id)}
                              >
                                Delete
                              </Button>
                            </>
                          )}
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
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedScripture?.title}</DialogTitle>
              {selectedScripture?.sacrament_type && (
                <DialogDescription>{selectedScripture.sacrament_type}</DialogDescription>
              )}
            </DialogHeader>
            {selectedScripture && (
              <div className="space-y-4">
                <div className="prose prose-sm max-w-none">
                  <p className="whitespace-pre-wrap">{selectedScripture.content}</p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}