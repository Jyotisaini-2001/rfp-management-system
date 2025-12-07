import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, FileText } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { rfpAPI } from '../services/api';
import type { RFP } from '../types';
import { getStatusColor, formatDate, formatCurrency } from '../lib/utils';

export default function RFPList() {
  const [rfps, setRfps] = useState<RFP[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRFPs();
  }, []);

  const loadRFPs = async () => {
    try {
      const response = await rfpAPI.getAll();
      setRfps(response.data);
    } catch (error) {
      console.error('Error loading RFPs:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">RFPs</h1>
          <p className="text-slate-600 mt-2 text-lg">Manage all your Request for Proposals</p>
        </div>
        <Link to="/rfps/create">
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Create RFP
          </Button>
        </Link>
      </div>

      {rfps.length === 0 ? (
        <Card className="p-12 text-center">
          <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium mb-2">No RFPs yet</h3>
          <p className="text-gray-500 mb-6">Create your first RFP to get started</p>
          <Link to="/rfps/create">
            <Button>Create Your First RFP</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rfps.map((rfp) => (
            <Link key={rfp.id} to={`/rfps/${rfp.id}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-semibold text-lg">{rfp.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(rfp.status)}`}>
                      {rfp.status}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Budget:</span>
                      <span className="font-medium">{formatCurrency(rfp.budget.amount, rfp.budget.currency)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Items:</span>
                      <span className="font-medium">{rfp.items.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Vendors:</span>
                      <span className="font-medium">{rfp._count?.vendors || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Proposals:</span>
                      <span className="font-medium">{rfp._count?.proposals || 0}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t text-xs text-gray-500">
                    Created {formatDate(rfp.createdAt)}
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
