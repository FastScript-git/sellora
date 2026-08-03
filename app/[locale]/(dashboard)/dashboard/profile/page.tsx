import {
  CircleUserRound,
  Mail,
  Shield,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">
          Profile
        </h1>

        <p className="mt-2 text-muted-foreground">
          Manage your account information.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>
            Account
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <span className="flex size-14 items-center justify-center rounded-full bg-primary text-lg font-semibold text-primary-foreground">
              ER
            </span>

            <div>
              <p className="font-medium">
                Evgenii Rybalka
              </p>

              <p className="text-sm text-muted-foreground">
                Workspace owner
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center gap-3 rounded-xl border p-4">
              <CircleUserRound className="size-5 text-muted-foreground" />

              <div>
                <p className="text-sm font-medium">
                  Name
                </p>

                <p className="text-sm text-muted-foreground">
                  Evgenii Rybalka
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl border p-4">
              <Mail className="size-5 text-muted-foreground" />

              <div>
                <p className="text-sm font-medium">
                  Email
                </p>

                <p className="text-sm text-muted-foreground">
                  —
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl border p-4">
              <Shield className="size-5 text-muted-foreground" />

              <div>
                <p className="text-sm font-medium">
                  Role
                </p>

                <p className="text-sm text-muted-foreground">
                  Workspace owner
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
