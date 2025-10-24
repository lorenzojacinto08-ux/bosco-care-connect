import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, History, ArrowLeft } from "lucide-react";
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
      iconColor: "text-blue-500"
    },
    {
      title: "Guidance History",
      description: "View past guidance appointments",
      icon: History,
      path: "/guidance/history",
      adminOnly: true,
      iconColor: "text-purple-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center px-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </div>
      </header>

      <main className="container px-4 py-8">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold mb-2">Guidance Center</h2>
          <p className="text-muted-foreground">Manage guidance appointments and history</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
          {sections.map((section) => {
            if (section.adminOnly && role !== "admin") return null;
            
            const Icon = section.icon;
            return (
              <Card
                key={section.path}
                className="cursor-pointer transition-all hover:shadow-lg hover:scale-105"
                onClick={() => navigate(section.path)}
              >
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 ${section.iconColor}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <CardTitle>{section.title}</CardTitle>
                  <CardDescription>{section.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="secondary" className="w-full">
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