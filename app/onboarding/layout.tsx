export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative z-10 min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      {children}
    </div>
  );
}
