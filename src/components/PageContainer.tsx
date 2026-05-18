export default function PageContainer({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-[1800px] page-padding">
      {children}
    </div>
  );
}