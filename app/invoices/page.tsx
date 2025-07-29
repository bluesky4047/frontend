'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Receipt, Search, Mail, Calendar } from 'lucide-react';

interface Invoice {
  id: string;
  name: string;
  email: string;
  date: string;
  items: any[];
  total: number;
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
  const fetchInvoices = async () => {
    try {
      const res = await api.get('/invoice'); // ✅ endpoint benar
      setInvoices(res.data.data || res.data); // pastikan struktur sesuai dengan response API kamu
    } catch (err: any) {
      console.error(err);
      setError('Gagal memuat invoice');
    } finally {
      setLoading(false);
    }
  };

  fetchInvoices();
}, []);

  const filteredInvoices = invoices.filter(invoice =>
    invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(price);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Invoice Data</h1>
        <p className="text-gray-600">View and manage all customer invoices</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search by invoice ID or Name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {loading && <p className="text-center text-gray-500">Loading...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredInvoices.map((invoice) => (
          <Card key={invoice.id}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Receipt className="h-5 w-5 text-blue-600" />
                <span>{invoice.id}</span>
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-2">
              <div className="text-gray-700">
                <p><strong>Customer:</strong> {invoice.name}</p>
                <p><Mail className="inline h-4 w-4" /> {invoice.email}</p>
                <p><Calendar className="inline h-4 w-4" /> {formatDate(invoice.date)}</p>
              </div>

              <div className="flex justify-between">
                <span className="text-sm">Items:</span>
                <Badge variant="outline">{invoice.items.length}</Badge>
              </div>

              <div className="flex justify-between items-center">
                <span className="font-medium">Total:</span>
                <span className="text-lg font-bold text-blue-600">{formatPrice(invoice.total)}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {!loading && filteredInvoices.length === 0 && (
        <div className="text-center py-12">
          <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No invoices found</h3>
          <p className="text-gray-600">Try adjusting your search criteria.</p>
        </div>
      )}
    </div>
  );
}
