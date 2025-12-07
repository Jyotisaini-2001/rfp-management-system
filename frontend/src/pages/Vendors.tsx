import { useEffect, useState } from 'react';
import { Plus, Mail, Phone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { vendorAPI } from '../services/api';
import type { Vendor } from '../types';

export default function Vendors() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contactPerson: '',
    phone: '',
    category: '',
    notes: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVendors();
  }, []);

  const loadVendors = async () => {
    try {
      const response = await vendorAPI.getAll();
      setVendors(response.data);
    } catch (error) {
      console.error('Error loading vendors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await vendorAPI.create({
        ...formData,
        category: formData.category ? formData.category.split(',').map(c => c.trim()) : undefined,
      } as any);
      alert('Vendor created successfully!');
      setShowModal(false);
      setFormData({ name: '', email: '', contactPerson: '', phone: '', category: '', notes: '' });
      loadVendors();
    } catch (error: any) {
      alert('Error creating vendor: ' + (error.response?.data?.error || error.message));
    }
  };

  if (loading) return <div className="text-center py-12">Loading...</div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">Vendors</h1>
          <p className="text-slate-600 mt-2 text-lg">Manage your vendor database</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Vendor
        </Button>
      </div>

      {vendors.length === 0 ? (
        <Card className="p-12 text-center">
          <h3 className="text-lg font-medium mb-2">No vendors yet</h3>
          <p className="text-gray-500 mb-6">Add your first vendor to get started</p>
          <Button onClick={() => setShowModal(true)}>Add Your First Vendor</Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vendors.map((vendor) => (
            <Card key={vendor.id}>
              <CardHeader>
                <CardTitle className="text-lg">{vendor.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="w-4 h-4" />
                    {vendor.email}
                  </div>
                  {vendor.phone && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="w-4 h-4" />
                      {vendor.phone}
                    </div>
                  )}
                  <div>
                    <strong>Contact:</strong> {vendor.contactPerson}
                  </div>
                  {vendor.category && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {vendor.category.split(',').map((cat, idx) => (
                        <span key={idx} className="px-2 py-1 bg-gray-100 rounded text-xs">
                          {cat.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Vendor Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle>Add New Vendor</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Company Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Contact Person *</label>
                  <input
                    type="text"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({...formData, contactPerson: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Categories (comma-separated)</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="Electronics, IT Equipment, Office Supplies"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    className="w-full h-24 px-3 py-2 border rounded-lg resize-none"
                  />
                </div>
                <div className="flex gap-4">
                  <Button type="submit">Add Vendor</Button>
                  <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
