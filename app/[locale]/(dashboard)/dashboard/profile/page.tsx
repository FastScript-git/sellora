import Image from "next/image";

import {
  CircleUserRound,
  Mail,
  Shield,
  UsersRound,
} from "lucide-react";
import { currentUser } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/dashboard/shared/page-header";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getCurrentWorkspace } from "@/lib/current-workspace";
import { prisma } from "@/lib/prisma";

type ProfilePageProps = {
  params: Promise<{
    locale: string;
  }>;
};

function getInitials(
  firstName: string | null,
  lastName: string | null,
  email: string,
) {
  const initials = [
    firstName?.trim().charAt(0),
    lastName?.trim().charAt(0),
  ]
    .filter(Boolean)
    .join("")
    .toUpperCase();

  return initials || email.charAt(0).toUpperCase();
}

export default async function ProfilePage({
  params,
}: ProfilePageProps) {
  const { locale } = await params;

  const clerkUser = await currentUser();

  if (!clerkUser) {
    notFound();
  }

  const workspace = await getCurrentWorkspace();

  const primaryEmail =
    clerkUser.primaryEmailAddress?.emailAddress ??
    clerkUser.emailAddresses[0]?.emailAddress ??
    "";

  const membership =
    await prisma.workspaceMember.findFirst({
      where: {
        workspaceId: workspace.id,
        user: {
          externalAuthId: clerkUser.id,
        },
      },
      select: {
        role: true,
      },
    });

  const fullName = [
    clerkUser.firstName,
    clerkUser.lastName,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  const displayName =
    fullName ||
    primaryEmail ||
    (locale === "uk"
      ? "Користувач Sellora"
      : "Sellora user");

  const role = membership?.role ?? "MEMBER";

  const roleLabel =
    locale === "uk"
      ? role === "OWNER"
        ? "Власник робочого простору"
        : role === "ADMIN"
          ? "Адміністратор"
          : "Учасник"
      : role === "OWNER"
        ? "Workspace owner"
        : role === "ADMIN"
          ? "Administrator"
          : "Member";

  const copy =
    locale === "uk"
      ? {
          title: "Профіль",
          description:
            "Переглядайте інформацію про свій акаунт і робочий простір.",
          account: "Акаунт",
          name: "Ім’я",
          email: "Email",
          role: "Роль",
          workspace: "Робочий простір",
        }
      : {
          title: "Profile",
          description:
            "Review your account and workspace information.",
          account: "Account",
          name: "Name",
          email: "Email",
          role: "Role",
          workspace: "Workspace",
        };

  const initials = getInitials(
    clerkUser.firstName,
    clerkUser.lastName,
    primaryEmail,
  );

  return (
    <div className="min-w-0 space-y-6">
      <PageHeader
        title={copy.title}
        description={copy.description}
      />

      <Card className="min-w-0">
        <CardHeader>
          <CardTitle>
            {copy.account}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex min-w-0 items-center gap-4">
            {clerkUser.imageUrl ? (
              <Image
                src={clerkUser.imageUrl}
                alt=""
                width={56}
                height={56}
                className="size-14 shrink-0 rounded-full object-cover"
              />
            ) : (
              <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-semibold text-primary-foreground">
                {initials}
              </span>
            )}

            <div className="min-w-0">
              <p className="truncate font-medium">
                {displayName}
              </p>

              <p className="mt-1 truncate text-sm text-muted-foreground">
                {roleLabel}
              </p>
            </div>
          </div>

          <div className="grid min-w-0 gap-4 md:grid-cols-2">
            <ProfileItem
              icon={CircleUserRound}
              label={copy.name}
              value={displayName}
            />

            <ProfileItem
              icon={Mail}
              label={copy.email}
              value={primaryEmail || "—"}
            />

            <ProfileItem
              icon={Shield}
              label={copy.role}
              value={roleLabel}
            />

            <ProfileItem
              icon={UsersRound}
              label={copy.workspace}
              value={workspace.name}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

type ProfileItemProps = {
  icon: typeof CircleUserRound;
  label: string;
  value: string;
};

function ProfileItem({
  icon: Icon,
  label,
  value,
}: ProfileItemProps) {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-xl border p-4">
      <Icon className="size-5 shrink-0 text-muted-foreground" />

      <div className="min-w-0">
        <p className="text-sm font-medium">
          {label}
        </p>

        <p className="mt-1 break-words text-sm text-muted-foreground">
          {value}
        </p>
      </div>
    </div>
  );
}