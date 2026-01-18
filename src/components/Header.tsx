import { Link } from "@tanstack/react-router";
import { Github } from "lucide-react";

import { ModeToggle } from "@/components";
import { TimerDisplay } from "@/components/TimerDisplay";
import { Button } from "@/components/ui";

export const Header: React.FC = () => {
  return (
    <header className="flex justify-between items-center gap-2 px-2 md:px-4 py-2 md:py-4 overflow-hidden">
      <h1 className="font-extrabold text-xl sm:text-2xl md:text-4xl lg:text-5xl tracking-tight scroll-m-20 shrink-0">
        <Link to="/">🌎 CountryGuessr</Link>
      </h1>
      <div>
        <TimerDisplay />
      </div>
      <div className="flex items-center gap-1 sm:gap-2 md:gap-4">
        <div className="flex items-center gap-1 sm:gap-2">
          <Link
            to="/"
            className="hidden sm:inline-flex items-center hover:underline"
          >
            Play
          </Link>
          <Link
            to="/stats"
            className="hidden sm:inline-flex items-center hover:underline"
          >
            Stats
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="p-2"
            onClick={() => {
              window.open("https://github.com/jcserv/countryguessr", "_blank");
            }}
          >
            <Github className="w-4 h-4" />
          </Button>
          <ModeToggle />
        </div>
      </div>
    </header>
  );
};
