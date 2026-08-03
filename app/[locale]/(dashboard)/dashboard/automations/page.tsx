import { redirect } from "next/navigation";

type AutomationsRedirectPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function AutomationsRedirectPage({
  params,
}: AutomationsRedirectPageProps) {
  const { locale } =
    await params;

  redirect(
    `/${locale}/dashboard/workflows`,
  );
}
