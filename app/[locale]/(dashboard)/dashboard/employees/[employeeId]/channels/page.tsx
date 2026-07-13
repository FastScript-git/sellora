import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Props = {
  title: string;
};

function Placeholder({ title }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>

      <CardContent>
        <p className="text-sm text-muted-foreground">
          This section will be implemented in a future sprint.
        </p>
      </CardContent>
    </Card>
  );
}

export default function Page() {
  return <Placeholder title="Channels" />;
}