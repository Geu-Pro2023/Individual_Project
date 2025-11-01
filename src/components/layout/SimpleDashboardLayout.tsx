interface SimpleDashboardLayoutProps {
  children: React.ReactNode;
}

export const SimpleDashboardLayout = ({ children }: SimpleDashboardLayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple Header */}
      <header className="bg-white shadow-sm border-b p-4">
        <h1 className="text-xl font-bold">Titweng Admin</h1>
      </header>
      
      {/* Simple Sidebar */}
      <div className="flex">
        <aside className="w-64 bg-white shadow-sm min-h-screen p-4">
          <nav className="space-y-2">
            <a href="/" className="block p-2 bg-blue-100 rounded">Dashboard</a>
            <a href="#" className="block p-2 hover:bg-gray-100 rounded">Cattle</a>
            <a href="#" className="block p-2 hover:bg-gray-100 rounded">Reports</a>
          </nav>
        </aside>
        
        {/* Main Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};