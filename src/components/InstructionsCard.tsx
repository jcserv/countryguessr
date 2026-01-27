import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function InstructionsCard() {
  const isMac =
    typeof navigator !== "undefined" &&
    navigator.platform.toUpperCase().includes("MAC");
  const modKey = isMac ? "⌘" : "Ctrl";

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          Instructions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 text-sm">
          <p className="text-muted-foreground">
            Click on a country or territory on the map to select it! If you
            can&apos;t find a country, click the &apos;Random Country&apos;
            button to get a new country you haven&apos;t guessed yet.
          </p>
          <div className="hidden md:block space-y-2 pt-2 border-t">
            <h3 className="mb-2 font-medium text-sm">Controls</h3>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Reset View</span>
              <kbd className="bg-muted px-2 py-0.5 rounded font-mono text-xs">
                Esc
              </kbd>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Random Country</span>
              <kbd className="bg-muted px-2 py-0.5 rounded font-mono text-xs">
                {modKey}+R
              </kbd>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Select</span>
              <kbd className="bg-muted px-2 py-0.5 rounded font-mono text-xs">
                Click
              </kbd>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Navigate</span>
              <kbd className="bg-muted px-2 py-0.5 rounded font-mono text-xs">
                ←/→/↑/↓
              </kbd>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Guess</span>
              <kbd className="bg-muted px-2 py-0.5 rounded font-mono text-xs">
                Enter / Double Click
              </kbd>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
