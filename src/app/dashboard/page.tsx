'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import TransactionList from '../../components/TransactionList';
import TransactionForm from '../../components/TransactionForm';
import MonthlyChart from '../../components/MonthlyChart';

interface Transaction {
  _id: string;
  amount: number;
  description: string;
  date: string;
}

interface MonthlyData {
  month: string;
  total: number;
  count: number;
}

export default function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [isAddingTransaction, setIsAddingTransaction] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchTransactions();
    fetchMonthlyData();
  }, []);

  const fetchTransactions = async () => {
    const res = await fetch('/api/transactions');
    const data = await res.json();
    setTransactions(data);
  };

  const fetchMonthlyData = async () => {
    const res = await fetch('/api/transactions/monthly');
    const data = await res.json();
    setMonthlyData(data);
  };

  const handleAddTransaction = async (formData: { amount: number; description: string; date: string }) => {
    await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    setIsAddingTransaction(false);
    fetchTransactions();
    fetchMonthlyData();
  };

  const handleUpdateTransaction = async (formData: { amount: number; description: string; date: string }) => {
    if (!editingTransaction) return;
    
    await fetch(`/api/transactions/${editingTransaction._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    setEditingTransaction(null);
    fetchTransactions();
    fetchMonthlyData();
  };

  const handleDeleteTransaction = async (id: string): Promise<void> => {
    await fetch(`/api/transactions/${id}`, {
      method: 'DELETE',
    });
    fetchTransactions();
    fetchMonthlyData();
  };

  const handleAddClick = () => {
    setIsAddingTransaction(true);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const filteredTransactions = transactions.filter((transaction) =>
    transaction.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto py-10 space-y-8">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Finance Dashboard</h1>
          <Button onClick={handleAddClick}>
            Add Transaction
          </Button>
        </div>
        <div className="w-full">
          <Input
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <MonthlyChart data={monthlyData} />
        </CardContent>
      </Card>

      {(isAddingTransaction || editingTransaction) && (
        <Card ref={formRef}>
          <CardHeader>
            <CardTitle>
              {editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TransactionForm
              initialData={editingTransaction}
              onSubmit={editingTransaction ? handleUpdateTransaction : handleAddTransaction}
              onCancel={() => {
                setIsAddingTransaction(false);
                setEditingTransaction(null);
              }}
            />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <TransactionList
            transactions={filteredTransactions}
            onDelete={handleDeleteTransaction}
            onEdit={setEditingTransaction}
          />
        </CardContent>
      </Card>
    </div>
  );
}
