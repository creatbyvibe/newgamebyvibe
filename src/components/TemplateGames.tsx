import { useState } from "react";
import { templateGames } from "@/data/templateGames";
import { Button } from "@/components/ui/button";
import { Play, Gamepad2, Puzzle, Zap, Target } from "lucide-react";
import CreationEditor from "./CreationEditor";

const categoryIcons: Record<string, React.ReactNode> = {
  puzzle: <Puzzle className="w-4 h-4" />,
  action: <Zap className="w-4 h-4" />,
  skill: <Target className="w-4 h-4" />,
};

const categoryColors: Record<string, string> = {
  puzzle: "from-purple-500 to-pink-500",
  action: "from-orange-500 to-red-500",
  skill: "from-blue-500 to-cyan-500",
};

const TemplateGames = () => {
  const [selectedGame, setSelectedGame] = useState<typeof templateGames[0] | null>(null);
  const [filter, setFilter] = useState<string>("all");

  const categories = ["all", ...new Set(templateGames.map(g => g.category))];
  const filteredGames = filter === "all" 
    ? templateGames 
    : templateGames.filter(g => g.category === filter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
            <Gamepad2 className="w-6 h-6 text-primary" />
            Template Games
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Play, remix, and share these original games
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2">
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={filter === cat ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(cat)}
              className="capitalize"
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      {/* Games Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredGames.map((game) => (
          <div
            key={game.id}
            className="group bg-background rounded-2xl border border-border overflow-hidden hover:shadow-lg transition-all"
          >
            {/* Preview */}
            <div className="aspect-video relative overflow-hidden bg-muted">
              <iframe
                srcDoc={game.code}
                className="w-full h-full border-0 pointer-events-none scale-[0.5] origin-top-left"
                style={{ width: "200%", height: "200%" }}
                sandbox="allow-scripts"
                title={game.title}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              
              {/* Category Badge */}
              <div className={`absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-white bg-gradient-to-r ${categoryColors[game.category]}`}>
                {categoryIcons[game.category]}
                {game.category}
              </div>

              {/* Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  size="lg"
                  onClick={() => setSelectedGame(game)}
                  className="gap-2 shadow-lg"
                >
                  <Play className="w-5 h-5" />
                  Play Now
                </Button>
              </div>
            </div>

            {/* Info */}
            <div className="p-4">
              <h3 className="font-display font-semibold text-foreground group-hover:text-primary transition-colors">
                {game.title}
              </h3>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {game.description}
              </p>
              
              <div className="flex items-center gap-2 mt-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedGame(game)}
                  className="flex-1 gap-1.5"
                >
                  <Play className="w-3.5 h-3.5" />
                  Play
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Game Editor Modal */}
      {selectedGame && (
        <CreationEditor
          initialCode={selectedGame.code}
          prompt={`Template: ${selectedGame.title} - ${selectedGame.description}`}
          onClose={() => setSelectedGame(null)}
        />
      )}
    </div>
  );
};

export default TemplateGames;