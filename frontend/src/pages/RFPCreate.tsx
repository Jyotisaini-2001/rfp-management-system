import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { rfpAPI } from '../services/api';
import type { RFP } from '../types';
import { formatCurrency } from '../lib/utils';

export default function RFPCreate() {
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<RFP | null>(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setLoading(true);
    setError('');

    try {
      const response = await rfpAPI.create(input);
      setPreview(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create RFP');
      console.error('Error creating RFP:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    if (preview) {
      navigate(`/rfps/${preview.id}`);
    }
  };

  const handleReset = () => {
    setPreview(null);
    setInput('');
    setError('');
  };

  const exampleInput = `I need to procure laptops and monitors for our new office. Budget is $50,000 total. Need delivery within 30 days. We need 20 laptops with 16GB RAM and 15 monitors 27-inch. Payment terms should be net 30, and we need at least 1 year warranty.`;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <Button
          variant="ghost"
          onClick={() => navigate('/rfps')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to RFPs
        </Button>
        <h1 className="text-4xl font-bold text-slate-900">Create New RFP</h1>
        <p className="text-slate-600 mt-2 text-lg">Describe what you need in natural language, and AI will structure it for you</p>
      </div>

      {!preview ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Describe Your Requirements
            </CardTitle>
            <CardDescription>
              Tell us what you want to procure. Include items, quantities, specifications, budget, timeline, and any special requirements.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="input" className="block text-sm font-medium text-gray-700 mb-2">
                  Procurement Requirements
                </label>
                <textarea
                  id="input"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={exampleInput}
                  className="w-full h-48 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                  disabled={loading}
                />
                <p className="mt-2 text-sm text-gray-500">
                  Minimum 10 characters. Be specific about items, quantities, deadlines, and budget.
                </p>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={loading || input.trim().length < 10}
                  className="flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing with AI...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Generate RFP with AI
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setInput(exampleInput)}
                  disabled={loading}
                >
                  Use Example
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Review Generated RFP</CardTitle>
            <CardDescription>AI has structured your requirements. Review and confirm to create the RFP.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Title */}
            <div>
              <h3 className="text-lg font-semibold">{preview.title}</h3>
              <p className="text-sm text-gray-500 mt-1">Status: {preview.status}</p>
            </div>

            {/* Items */}
            <div>
              <h4 className="font-medium mb-2">Items Required</h4>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Item</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Quantity</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Specifications</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.items.map((item, idx) => (
                      <tr key={idx} className="border-t">
                        <td className="px-4 py-2">{item.name}</td>
                        <td className="px-4 py-2">{item.quantity}</td>
                        <td className="px-4 py-2">
                          {Object.entries(item.specifications).map(([k, v]) => (
                            <span key={k} className="inline-block mr-2 text-sm">
                              <strong>{k}:</strong> {String(v)}
                            </span>
                          ))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Budget & Timeline */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Budget</h4>
                <p className="text-2xl font-bold text-primary">
                  {formatCurrency(preview.budget.amount, preview.budget.currency)}
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Timeline</h4>
                <p className="text-sm"><strong>Response by:</strong> {preview.timeline.responseDeadline}</p>
                <p className="text-sm"><strong>Delivery by:</strong> {preview.timeline.deliveryDeadline}</p>
              </div>
            </div>

            {/* Terms */}
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Terms & Conditions</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Payment Terms:</strong> {preview.terms.paymentTerms}
                </div>
                <div>
                  <strong>Warranty:</strong> {preview.terms.warranty}
                </div>
              </div>
            </div>

            {/* Requirements */}
            {preview.requirements.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Additional Requirements</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                  {preview.requirements.map((req, idx) => (
                    <li key={idx}>{req}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Original Input */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2 text-sm text-gray-700">Original Input</h4>
              <p className="text-sm text-gray-600">{preview.rawInput}</p>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <Button onClick={handleConfirm}>
                Confirm & Create RFP
              </Button>
              <Button variant="outline" onClick={handleReset}>
                Start Over
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
