import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, BookOpen, ArrowLeft, Shield } from "lucide-react";

export default function Pastoral() {
  const navigate = useNavigate();

  const sections = [
    {
      title: "Pastoral Events",
      description: "View and manage pastoral events",
      icon: Calendar,
      path: "/pastoral/events",
      color: "pastoral"
    },
    {
      title: "Sacramental Scriptures",
      description: "View and manage sacramental scriptures",
      icon: BookOpen,
      path: "/pastoral/scriptures",
      color: "guidance"
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
              <h1 className="text-xl font-bold text-foreground">Pastoral Care</h1>
              <p className="text-xs text-muted-foreground">Events & Scriptures</p>
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
          <h2 className="text-4xl font-bold mb-3">Pastoral Services</h2>
          <p className="text-muted-foreground">Events and spiritual resources</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
          {sections.map((section) => {
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