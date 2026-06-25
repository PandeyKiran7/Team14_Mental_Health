import ContentManagerLayoutClient from "@/components/content-manager/ContentManagerLayoutClient";

export default function ContentManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ContentManagerLayoutClient>{children}</ContentManagerLayoutClient>;
}
