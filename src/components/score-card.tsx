interface ScoreCardProps {
  title: string;
  score: number;
  description: string;
}

export function ScoreCard({ title, score, description }: ScoreCardProps) {
  return (
    <div className="rounded-lg border p-4">
      <h3 className="mb-2 font-semibold">{title}</h3>
      <div className="mb-2 text-3xl font-bold">{Math.round(score * 100)}%</div>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
