import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function InstructionsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Instructions</CardTitle>
      </CardHeader>

      <CardContent>
        <p className="text-sm text-muted-foreground">
          AI Employee instructions editor will be implemented here.
        </p>
      </CardContent>
    </Card>
  );
}