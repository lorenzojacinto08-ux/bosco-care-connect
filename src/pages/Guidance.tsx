import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, History, ArrowLeft, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function Guidance() {
  const navigate = useNavigate();
  const { role } = useAuth();

  const sections = [
    {
      title: "Guidance Scheduling",
      description: "Schedule new guidance appointments",
      icon: Calendar,
      path: "/guidance/scheduling",
      color: "guidance"
    },
    {
      title: "Guidance History",
      description: "View past guidance appointments",
      icon: History,
      path: "/guidance/history",
      adminOnly: true,
      color: "pastoral"
    }
  ];

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-guidance to-pastoral flex items-center justify-center">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Guidance Center</h1>
              <p className="text-xs text-muted-foreground">Appointments & History</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate("/")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </div>
      </header>

      <main className="container px-4 py-16">
        <div className="mb-12 text-center">
          <h2 className="text-4xl font-bold mb-3">Guidance Services</h2>
          <p className="text-muted-foreground">Manage guidance appointments and history</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
          {sections.map((section) => {
            if (section.adminOnly && role !== "admin") return null;
            
            const Icon = section.icon;
            return (
              <Card
                key={section.path}
                className="cursor-pointer transition-all hover:shadow-lg relative overflow-hidden border-t-4"
                style={{ borderTopColor: `hsl(var(--${section.color}))` }}
                onClick={() => navigate(section.path)}
              >
                <CardHeader className="pb-4">
                  <div 
                    className="w-14 h-14 rounded-xl flex items-center justify-center mb-4"
                    style={{ backgroundColor: `hsl(var(--${section.color}))` }}
                  >
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  <CardTitle className="text-xl">{section.title}</CardTitle>
                  <CardDescription className="text-muted-foreground">{section.description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button variant="outline" className="w-full">
                    Open
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
}