import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { FileText, Users, LayoutDashboard } from 'lucide-react';
import { cn } from './lib/utils';

// Pages
import Dashboard from './pages/Dashboard';
import RFPList from './pages/RFPList';
import RFPCreate from './pages/RFPCreate';
import RFPDetail from './pages/RFPDetail';
import Vendors from './pages/Vendors';

function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'RFPs', href: '/rfps', icon: FileText },
    { name: 'Vendors', href: '/vendors', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white/80 backdrop-blur-lg border-r border-indigo-100 shadow-lg">
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-indigo-100">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
                <span className="text-white font-bold text-lg">R</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gradient">RFP Manager</h1>
                <p className="text-xs text-slate-500 mt-0.5">AI-Powered Procurement</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href ||
                              (item.href !== '/' && location.pathname.startsWith(item.href));

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'gradient-primary text-white shadow-lg shadow-indigo-500/30'
                      : 'text-slate-700 hover:bg-indigo-50 hover:text-indigo-700'
                  )}
                >
                  <Icon className={cn('w-5 h-5 mr-3', isActive ? 'text-white' : 'text-slate-500')} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-indigo-100 bg-indigo-50/50">
            <p className="text-xs text-slate-500 text-center">v1.0.0 | SDE Assignment</p>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="pl-64">
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/rfps" element={<RFPList />} />
          <Route path="/rfps/create" element={<RFPCreate />} />
          <Route path="/rfps/:id" element={<RFPDetail />} />
          <Route path="/vendors" element={<Vendors />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
