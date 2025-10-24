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
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus } from "lucide-react";

export default function SacramentalScriptures() {
  const navigate = useNavigate();
  const { role, user } = useAuth();
  const { toast } = useToast();
  const [scriptures, setScriptures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingScripture, setEditingScripture] = useState<any>(null);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/pastoral")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          {role === "admin" && (
            <Dialog open={open} onOpenChange={(isOpen) => {
              setOpen(isOpen);
              if (!isOpen) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button>
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
                  <Button type="submit" className="w-full">
                    {editingScripture ? "Update" : "Create"} Scripture
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </header>

      <main className="container px-4 py-8">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold mb-2">Sacramental Scriptures</h2>
          <p className="text-muted-foreground">Spiritual texts and readings</p>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : scriptures.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No scriptures found</div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {scriptures.map((scripture) => (
              <Card key={scripture.id}>
                <CardHeader>
                  <CardTitle>{scripture.title}</CardTitle>
                  {scripture.sacrament_type && (
                    <CardDescription>{scripture.sacrament_type}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-4">
                    {scripture.content}
                  </p>
                  {role === "admin" && (
                    <div className="flex gap-2">
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
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}