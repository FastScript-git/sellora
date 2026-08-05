"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type WorkflowDetailsCardProps = {
  name: string;
  description: string;
  isNameValid: boolean;
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
};

export function WorkflowDetailsCard({
  name,
  description,
  isNameValid,
  onNameChange,
  onDescriptionChange,
}: WorkflowDetailsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Workflow details
        </CardTitle>

        <CardDescription>
          Give the workflow a clear name and optional
          description.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="workflow-name">
            Workflow name
          </Label>

          <Input
            id="workflow-name"
            value={name}
            maxLength={120}
            placeholder="Example: Qualify new leads"
            aria-invalid={
              name.length > 0 &&
              !isNameValid
            }
            onChange={(event) =>
              onNameChange(
                event.target.value,
              )
            }
          />

          <div className="flex items-center justify-between gap-4 text-xs text-muted-foreground">
            <span>
              Use a name that explains the workflow goal.
            </span>

            <span>
              {name.length}/120
            </span>
          </div>

          {name.length > 0 &&
          !isNameValid ? (
            <p className="text-xs text-destructive">
              Enter at least 2 characters.
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="workflow-description">
            Description
          </Label>

          <Textarea
            id="workflow-description"
            value={description}
            maxLength={500}
            rows={4}
            placeholder="Describe what this workflow should accomplish..."
            onChange={(event) =>
              onDescriptionChange(
                event.target.value,
              )
            }
          />

          <div className="flex justify-end text-xs text-muted-foreground">
            {description.length}/500
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
