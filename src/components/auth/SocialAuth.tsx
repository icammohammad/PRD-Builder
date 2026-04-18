import React from "react";
import { Button } from "@/components/ui/button";
import { Chrome, Github } from "lucide-react";

export function SocialAuth() {
  return (
    <div className="grid gap-2">
      <Button variant="outline" type="button" className="w-full gap-2 font-normal">
        <Chrome className="w-4 h-4" />
        Continue with Google
      </Button>
      <Button variant="outline" type="button" className="w-full gap-2 font-normal">
        <Github className="w-4 h-4" />
        Continue with GitHub
      </Button>
    </div>
  );
}
