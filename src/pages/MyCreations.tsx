import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import TemplateGames from "@/components/TemplateGames";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";
import CreationEditor from "@/components/CreationEditor";
import WorkGallery from "@/components/WorkGallery";
import { Play, Heart, Trash2, Globe, Lock, Loader2, Gamepad2, FolderOpen, Users } from "lucide-react";
import { toast } from "sonner";

interface Creation {
  id: string;
  title: string;
  prompt: string;
  html_code: string;
  plays: number;
  likes: number;
  is_public: boolean;
  created_at: string;
}

const MyCreations = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [creations, setCreations] = useState<Creation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCreation, setSelectedCreation] = useState<Creation | null>(null);
  
  // Get initial tab from hash
  const getInitialTab = () => {
    const hash = location.hash.replace("#", "");
    if (["my-creations", "templates", "explore"].includes(hash)) {
      return hash;
    }
    return "my-creations";
  };
  const [activeTab, setActiveTab] = useState(getInitialTab);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchCreations();
    }
  }, [user]);

  const fetchCreations = async () => {
    try {
      const { data, error } = await supabase
        .from("creations")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCreations(data || []);
    } catch (error) {
      console.error("Error fetching creations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this creation?")) return;

    try {
      const { error } = await supabase.from("creations").delete().eq("id", id);
      if (error) throw error;
      setCreations((prev) => prev.filter((c) => c.id !== id));
      toast.success("Creation deleted");
    } catch (error) {
      console.error("Error deleting:", error);
      toast.error("Failed to delete");
    }
  };

  const handleTogglePublic = async (creation: Creation) => {
    try {
      const { error } = await supabase
        .from("creations")
        .update({ is_public: !creation.is_public })
        .eq("id", creation.id);

      if (error) throw error;
      setCreations((prev) =>
        prev.map((c) => (c.id === creation.id ? { ...c, is_public: !c.is_public } : c))
      );
      toast.success(creation.is_public ? "Made private" : "Made public");
    } catch (error) {
      console.error("Error updating:", error);
      toast.error("Failed to update");
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (selectedCreation) {
    return (
      <div className="min-h-screen bg-background pt-20 px-6">
        <Navbar />
        <div className="max-w-5xl mx-auto py-8">
          <CreationEditor
            initialCode={selectedCreation.html_code}
            prompt={selectedCreation.prompt}
            creationId={selectedCreation.id}
            onClose={() => {
              setSelectedCreation(null);
              fetchCreations();
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-20 sm:pt-24 pb-16 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="mb-6 sm:mb-8">
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">Game Center</h1>
            <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">
              Play, create, and share amazing games
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={(v) => {
            setActiveTab(v);
            window.location.hash = v;
          }}>
            <TabsList className="mb-6 sm:mb-8 w-full sm:w-auto grid grid-cols-3 sm:flex">
              <TabsTrigger value="my-creations" className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4">
                <FolderOpen className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">My </span>Creations
              </TabsTrigger>
              <TabsTrigger value="templates" className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4">
                <Gamepad2 className="w-3 h-3 sm:w-4 sm:h-4" />
                Templates
              </TabsTrigger>
              <TabsTrigger value="explore" className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4">
                <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                Explore
              </TabsTrigger>
            </TabsList>

            {/* My Creations Tab */}
            <TabsContent value="my-creations">
              {creations.length === 0 ? (
                <div className="text-center py-12 sm:py-16 bg-muted/30 rounded-2xl border border-border">
                  <p className="text-muted-foreground mb-4 text-sm sm:text-base">You haven't created anything yet</p>
                  <Button onClick={() => navigate("/")} size="sm">Create your first game</Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {creations.map((creation) => (
                    <div
                      key={creation.id}
                      className="group bg-card rounded-xl border border-border overflow-hidden hover:border-primary/30 transition-all duration-300 shadow-soft hover:shadow-medium"
                    >
                      {/* Preview */}
                      <div
                        className="aspect-video relative cursor-pointer"
                        onClick={() => setSelectedCreation(creation)}
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20" />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-foreground/10 backdrop-blur-sm">
                          <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                            <Play className="w-5 h-5 text-primary-foreground ml-0.5" />
                          </div>
                        </div>
                      </div>

                      {/* Info */}
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-display font-semibold text-foreground line-clamp-1">
                            {creation.title}
                          </h3>
                          <button
                            onClick={() => handleTogglePublic(creation)}
                            className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                            title={creation.is_public ? "Make private" : "Make public"}
                          >
                            {creation.is_public ? (
                              <Globe className="w-4 h-4 text-primary" />
                            ) : (
                              <Lock className="w-4 h-4 text-muted-foreground" />
                            )}
                          </button>
                        </div>

                        <p className="text-xs text-muted-foreground line-clamp-1 mb-3">
                          {creation.prompt}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Play className="w-3 h-3" />
                              {creation.plays}
                            </span>
                            <span className="flex items-center gap-1">
                              <Heart className="w-3 h-3" />
                              {creation.likes}
                            </span>
                          </div>

                          <button
                            onClick={() => handleDelete(creation.id)}
                            className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Template Games Tab */}
            <TabsContent value="templates">
              <TemplateGames />
            </TabsContent>

            {/* Explore Tab */}
            <TabsContent value="explore">
              <WorkGallery />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default MyCreations;
