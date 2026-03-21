import Sidebar from "./Sidebar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="ml-60 flex-1 overflow-auto">
        <div className="min-h-screen p-8">{children}</div>
      </main>
    </div>
  );
}
