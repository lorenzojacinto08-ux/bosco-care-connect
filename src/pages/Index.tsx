import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Heart, Users, LogOut } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const { user, role, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  if (!user) {
    navigate("/auth");
    return null;
  }

  const cards = [
    {
      title: "Guidance",
      description: "Schedule appointments and view guidance history",
      icon: BookOpen,
      path: "/guidance",
      iconColor: "text-blue-500"
    },
    {
      title: "Pastoral",
      description: "View events and sacramental scriptures",
      icon: Heart,
      path: "/pastoral",
      iconColor: "text-rose-500"
    },
    {
      title: "Student Records",
      description: "Manage student information and records",
      icon: Users,
      path: "/student-records",
      adminOnly: true,
      iconColor: "text-green-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <h1 className="text-2xl font-bold">BoscoCare</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {role === "admin" ? "Admin" : "Student"}
            </span>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container px-4 py-8">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold mb-2">Welcome to BoscoCare</h2>
          <p className="text-muted-foreground">Select a section to get started</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
          {cards.map((card) => {
            if (card.adminOnly && role !== "admin") return null;
            
            const Icon = card.icon;
            return (
              <Card
                key={card.path}
                className="cursor-pointer transition-all hover:shadow-lg hover:scale-105"
                onClick={() => navigate(card.path)}
              >
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 ${card.iconColor}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <CardTitle>{card.title}</CardTitle>
                  <CardDescription>{card.description}</CardDescription>
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
};

export default Index;
