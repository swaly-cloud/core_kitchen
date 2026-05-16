import { Sparkles } from "lucide-react";
import { Card, CardContent } from "./ui/Card";

interface ComingSoonProps {
  title: string;
  phase: string;
  description: string;
}

export function ComingSoon({ title, phase, description }: ComingSoonProps) {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      </div>
      <Card>
        <CardContent className="p-10 text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-brand-50 text-brand-700 flex items-center justify-center mb-4">
            <Sparkles className="h-6 w-6" />
          </div>
          <div className="text-xs font-medium text-brand-700 uppercase tracking-wider mb-2">
            {phase}
          </div>
          <h2 className="text-lg font-semibold mb-2">À venir prochainement</h2>
          <p className="text-zinc-500 max-w-md mx-auto text-sm leading-relaxed">{description}</p>
        </CardContent>
      </Card>
    </div>
  );
}
