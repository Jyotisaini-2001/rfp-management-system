import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Mail, Award, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { rfpAPI, vendorAPI, proposalAPI } from '../services/api';
import type { RFP, Vendor, Proposal, ComparisonResult } from '../types';
import { getStatusColor, formatDate, formatCurrency } from '../lib/utils';

export default function RFPDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [rfp, setRfp] = useState<RFP | null>(null);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [selectedVendors, setSelectedVendors] = useState<string[]>([]);
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [proposalForm, setProposalForm] = useState({ vendorId: '', email: '', subject: '' });
  const [comparison, setComparison] = useState<ComparisonResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    try {
      const [rfpRes, vendorsRes] = await Promise.all([
        rfpAPI.getOne(id!),
        vendorAPI.getAll(),
      ]);
      setRfp(rfpRes.data);
      setVendors(vendorsRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendRFP = async () => {
    if (!id || selectedVendors.length === 0) return;
    try {
      await rfpAPI.send(id, selectedVendors);
      alert('RFP sent successfully!');
      setShowVendorModal(false);
      loadData();
    } catch (error: any) {
      alert('Error sending RFP: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleReceiveProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      await proposalAPI.receiveInbound({
        rfpId: id,
        vendorId: proposalForm.vendorId,
        email: proposalForm.email,
        subject: proposalForm.subject,
      });
      alert('Proposal received and parsed successfully!');
      setShowProposalModal(false);
      setProposalForm({ vendorId: '', email: '', subject: '' });
      loadData();
    } catch (error: any) {
      alert('Error receiving proposal: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleCompare = async () => {
    if (!id) return;
    try {
      const response = await rfpAPI.compare(id);
      setComparison(response.data);
    } catch (error: any) {
      alert('Error comparing proposals: ' + (error.response?.data?.error || error.message));
    }
  };

  if (loading) return <div className="text-center py-12">Loading...</div>;
  if (!rfp) return <div className="text-center py-12">RFP not found</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <Button variant="ghost" onClick={() => navigate('/rfps')} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to RFPs
        </Button>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">{rfp.title}</h1>
            <p className="text-slate-600 mt-2 text-lg">Created {formatDate(rfp.createdAt)}</p>
          </div>
          <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(rfp.status)}`}>
            {rfp.status}
          </span>
        </div>
      </div>

      <div className="flex gap-4">
        <Button onClick={() => setShowVendorModal(true)}>
          <Send className="w-4 h-4 mr-2" />
          Send to Vendors
        </Button>
        <Button variant="outline" onClick={() => setShowProposalModal(true)}>
          <Mail className="w-4 h-4 mr-2" />
          Receive Proposal
        </Button>
        {rfp.proposals && rfp.proposals.length > 0 && (
          <Button variant="outline" onClick={handleCompare}>
            <Award className="w-4 h-4 mr-2" />
            Compare Proposals
          </Button>
        )}
      </div>

      {/* Proposals */}
      {rfp.proposals && rfp.proposals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Proposals ({rfp.proposals.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {rfp.proposals.map((proposal: Proposal) => {
                const isDefaultData = proposal.parsedData && (
                  proposal.parsedData.totalPrice === 0 ||
                  proposal.parsedData.deliveryTime === "Not specified" ||
                  proposal.parsedData.warranty === "Standard warranty"
                );

                return (
                  <div key={proposal.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium">{proposal.vendor.name}</h4>
                        <p className="text-sm text-gray-500">{proposal.vendor.email}</p>
                      </div>
                      <div className="text-right">
                        {proposal.score && (
                          <div className="text-2xl font-bold text-primary">{proposal.score}/100</div>
                        )}
                        <span className={`inline-block px-2 py-1 rounded-full text-xs ${getStatusColor(proposal.status)}`}>
                          {proposal.status}
                        </span>
                      </div>
                    </div>
                    {proposal.parsedData && (
                      <>
                        {isDefaultData && (
                          <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                            ⚠️ Default values detected. The email may not have contained pricing information. Click "Re-parse" to try again.
                          </div>
                        )}
                        <div className="mt-2 grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <strong>Total:</strong> {formatCurrency(proposal.parsedData.totalPrice, proposal.parsedData.currency)}
                          </div>
                          <div>
                            <strong>Delivery:</strong> {proposal.parsedData.deliveryTime}
                          </div>
                          <div>
                            <strong>Warranty:</strong> {proposal.parsedData.warranty}
                          </div>
                        </div>
                        {proposal.parsedData.items && proposal.parsedData.items.length > 0 && (
                          <div className="mt-3">
                            <strong className="text-sm">Items:</strong>
                            <ul className="mt-1 space-y-1 text-xs">
                              {proposal.parsedData.items.map((item: any, idx: number) => (
                                <li key={idx}>
                                  {item.quantity}x {item.name} @ {formatCurrency(item.unitPrice, proposal.parsedData.currency)} = {formatCurrency(item.totalPrice, proposal.parsedData.currency)}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        <div className="mt-3 flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={async () => {
                              try {
                                await proposalAPI.reparse(proposal.id);
                                alert('Proposal re-parsed successfully!');
                                loadData();
                              } catch (error: any) {
                                alert('Error re-parsing: ' + (error.response?.data?.error || error.message));
                              }
                            }}
                          >
                            Re-parse with AI
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={async () => {
                              if (confirm('Are you sure you want to delete this proposal?')) {
                                try {
                                  await proposalAPI.delete(proposal.id);
                                  alert('Proposal deleted successfully!');
                                  loadData();
                                } catch (error: any) {
                                  alert('Error deleting: ' + (error.response?.data?.error || error.message));
                                }
                              }
                            }}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Comparison Results */}
      {comparison && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              AI Recommendation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-6 bg-primary/5 rounded-lg mb-6">
              <h3 className="text-lg font-semibold mb-2">Recommended Vendor</h3>
              <p className="text-2xl font-bold text-primary mb-2">{comparison.recommendation.vendorName}</p>
              <p className="text-gray-700">{comparison.recommendation.reasoning}</p>
            </div>
            <h4 className="font-medium mb-4">All Rankings</h4>
            <div className="space-y-4">
              {comparison.rankings.map((ranking, idx) => (
                <div key={idx} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h5 className="font-medium">{ranking.vendorName}</h5>
                    <div className="text-2xl font-bold">{ranking.score}/100</div>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-sm mb-2">
                    <div>Price: {ranking.priceScore}</div>
                    <div>Delivery: {ranking.deliveryScore}</div>
                    <div>Compliance: {ranking.complianceScore}</div>
                    <div>Terms: {ranking.termsScore}</div>
                  </div>
                  <div className="text-sm">
                    <strong>Strengths:</strong> {ranking.strengths.join(', ')}
                  </div>
                  <div className="text-sm text-gray-600">
                    <strong>Weaknesses:</strong> {ranking.weaknesses.join(', ')}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Vendor Selection Modal */}
      {showVendorModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Select Vendors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-6">
                {vendors.map((vendor) => (
                  <label key={vendor.id} className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedVendors.includes(vendor.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedVendors([...selectedVendors, vendor.id]);
                        } else {
                          setSelectedVendors(selectedVendors.filter(id => id !== vendor.id));
                        }
                      }}
                      className="mr-3"
                    />
                    <div>
                      <div className="font-medium">{vendor.name}</div>
                      <div className="text-sm text-gray-500">{vendor.email}</div>
                    </div>
                  </label>
                ))}
              </div>
              <div className="flex gap-4">
                <Button onClick={handleSendRFP} disabled={selectedVendors.length === 0}>
                  Send to {selectedVendors.length} Vendor(s)
                </Button>
                <Button variant="outline" onClick={() => setShowVendorModal(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Proposal Modal */}
      {showProposalModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle>Receive Vendor Proposal</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleReceiveProposal} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Vendor</label>
                  <select
                    value={proposalForm.vendorId}
                    onChange={(e) => setProposalForm({...proposalForm, vendorId: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  >
                    <option value="">Select vendor...</option>
                    {vendors.map((v) => (
                      <option key={v.id} value={v.id}>{v.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email Subject (optional)</label>
                  <input
                    type="text"
                    value={proposalForm.subject}
                    onChange={(e) => setProposalForm({...proposalForm, subject: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="Re: RFP for Office Equipment"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email Content</label>
                  <textarea
                    value={proposalForm.email}
                    onChange={(e) => setProposalForm({...proposalForm, email: e.target.value})}
                    className="w-full h-48 px-3 py-2 border rounded-lg resize-none"
                    placeholder="Paste the vendor's proposal email here..."
                    required
                  />
                </div>
                <div className="flex gap-4">
                  <Button type="submit">Receive & Parse Proposal</Button>
                  <Button type="button" variant="outline" onClick={() => setShowProposalModal(false)}>
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
