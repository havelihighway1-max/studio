export default function GroLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="h-screen w-screen">{children}</div>;
}