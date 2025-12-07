import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Users, TrendingUp, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { rfpAPI, vendorAPI } from '../services/api';
import type { RFP, Vendor } from '../types';
import { getStatusColor, formatDate } from '../lib/utils';

export default function Dashboard() {
  const [rfps, setRfps] = useState<RFP[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [rfpsRes, vendorsRes] = await Promise.all([
        rfpAPI.getAll(),
        vendorAPI.getAll(),
      ]);
      setRfps(rfpsRes.data);
      setVendors(vendorsRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    totalRFPs: rfps.length,
    activeRFPs: rfps.filter(r => ['SENT', 'EVALUATING'].includes(r.status)).length,
    totalVendors: vendors.length,
    totalProposals: rfps.reduce((sum, rfp) => sum + (rfp._count?.proposals || 0), 0),
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-600 mt-2 text-lg">Welcome to your AI-Powered RFP Management System</p>
        </div>
        <Link to="/rfps/create">
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Create RFP
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-indigo-200 hover:border-indigo-300 transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-slate-700">Total RFPs</CardTitle>
            <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
              <FileText className="h-5 w-5 text-indigo-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gradient">{stats.totalRFPs}</div>
            <p className="text-xs text-slate-500 mt-1">{stats.activeRFPs} active</p>
          </CardContent>
        </Card>

        <Card className="border-indigo-200 hover:border-indigo-300 transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-slate-700">Total Vendors</CardTitle>
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gradient">{stats.totalVendors}</div>
            <p className="text-xs text-slate-500 mt-1">Registered vendors</p>
          </CardContent>
        </Card>

        <Card className="border-indigo-200 hover:border-indigo-300 transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-slate-700">Proposals Received</CardTitle>
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gradient">{stats.totalProposals}</div>
            <p className="text-xs text-slate-500 mt-1">All time</p>
          </CardContent>
        </Card>

        <Card className="border-indigo-200 hover:border-indigo-300 transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-slate-700">Success Rate</CardTitle>
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {rfps.length > 0 ? Math.round((rfps.filter(r => r.status === 'AWARDED').length / rfps.length) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">RFPs awarded</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent RFPs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent RFPs</CardTitle>
          </CardHeader>
          <CardContent>
            {rfps.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No RFPs yet</p>
                <Link to="/rfps/create">
                  <Button variant="outline" className="mt-4">Create your first RFP</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {rfps.slice(0, 5).map((rfp) => (
                  <Link key={rfp.id} to={`/rfps/${rfp.id}`}>
                    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div>
                        <h4 className="font-medium">{rfp.title}</h4>
                        <p className="text-sm text-gray-500">{formatDate(rfp.createdAt)}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(rfp.status)}`}>
                        {rfp.status}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Link to="/rfps/create">
                <Button className="w-full justify-start" variant="outline">
                  <FileText className="w-4 h-4 mr-2" />
                  Create New RFP
                </Button>
              </Link>
              <Link to="/vendors">
                <Button className="w-full justify-start" variant="outline">
                  <Users className="w-4 h-4 mr-2" />
                  Manage Vendors
                </Button>
              </Link>
              <Link to="/rfps">
                <Button className="w-full justify-start" variant="outline">
                  <FileText className="w-4 h-4 mr-2" />
                  View All RFPs
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
