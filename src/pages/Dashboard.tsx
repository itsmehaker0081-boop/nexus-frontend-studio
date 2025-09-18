import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, Container, AppLayout } from '@/components/ui/layout';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Users, 
  Receipt, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight,
  Wallet,
  Bell
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface Balance {
  userId: string;
  amount: number;
}

interface Expense {
  _id: string;
  description: string;
  amount: number;
  paidBy: {
    _id: string;
    name: string;
    username: string;
  };
  splitDetails: Array<{
    user: {
      _id: string;
      name: string;
      username: string;
    };
    finalShare: number;
    status: 'pending' | 'paid';
  }>;
  group?: {
    _id: string;
    name: string;
  };
  createdAt: string;
}

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [totalBalance, setTotalBalance] = useState(0);
  const [totalOwed, setTotalOwed] = useState(0);
  const [totalOwing, setTotalOwing] = useState(0);

  // Fetch expenses
  const { data: expensesData, isLoading: expensesLoading } = useQuery({
    queryKey: ['expenses'],
    queryFn: () => apiClient.getMyExpenses(),
  });

  // Fetch friends
  const { data: friendsData } = useQuery({
    queryKey: ['friends'],
    queryFn: () => apiClient.getFriends(),
  });

  // Fetch groups
  const { data: groupsData } = useQuery({
    queryKey: ['groups'],
    queryFn: () => apiClient.getMyGroups(),
  });

  // Fetch settlement data
  const { data: settlementData } = useQuery({
    queryKey: ['settlement', user?.id],
    queryFn: () => apiClient.getGlobalSettlement(user?.id),
    enabled: !!user?.id,
  });

  useEffect(() => {
    if (settlementData?.success && user) {
      const balances = settlementData.data.balances;
      const userBalance = balances[user.id] || 0;
      
      setTotalBalance(userBalance);
      
      // Calculate total owed and owing
      let owed = 0;
      let owing = 0;
      
      Object.entries(balances).forEach(([userId, balance]) => {
        if (userId !== user.id) {
          if (balance < 0) {
            owing += Math.abs(balance);
          } else if (balance > 0) {
            owed += balance;
          }
        }
      });
      
      setTotalOwed(owed);
      setTotalOwing(owing);
    }
  }, [settlementData, user]);

  const recentExpenses = expensesData?.data?.expenses?.slice(0, 5) || [];
  const friendsCount = friendsData?.data?.friends?.length || 0;
  const groupsCount = groupsData?.data?.groups?.length || 0;

  return (
    <AppLayout>
      {/* Header */}
      <div className="bg-gradient-primary text-white">
        <Container>
          <div className="flex items-center justify-between py-6">
            <div>
              <h1 className="text-2xl font-bold">Hello, {user?.name}!</h1>
              <p className="text-white/80">Here's your expense overview</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                <Bell className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={logout} className="text-white hover:bg-white/20">
                Logout
              </Button>
            </div>
          </div>
        </Container>
      </div>

      <Container>
        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 -mt-8 mb-8">
          <Card className="bg-gradient-success text-white shadow-success">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm font-medium">Total Balance</p>
                <p className="text-2xl font-bold">
                  ₹{Math.abs(totalBalance).toLocaleString()}
                  {totalBalance !== 0 && (
                    <span className="text-lg ml-1">
                      {totalBalance > 0 ? '🎉' : '💸'}
                    </span>
                  )}
                </p>
                <p className="text-xs text-white/70 mt-1">
                  {totalBalance > 0 ? 'You are owed' : totalBalance < 0 ? 'You owe' : 'All settled up!'}
                </p>
              </div>
              <Wallet className="w-8 h-8 text-white/60" />
            </div>
          </Card>

          <Card className="bg-gradient-expense text-white shadow-expense">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm font-medium">You Owe</p>
                <p className="text-2xl font-bold">₹{totalOwing.toLocaleString()}</p>
                <p className="text-xs text-white/70 mt-1">To friends & groups</p>
              </div>
              <ArrowUpRight className="w-8 h-8 text-white/60" />
            </div>
          </Card>

          <Card className="bg-gradient-success text-white shadow-success">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm font-medium">You Are Owed</p>
                <p className="text-2xl font-bold">₹{totalOwed.toLocaleString()}</p>
                <p className="text-xs text-white/70 mt-1">From friends & groups</p>
              </div>
              <ArrowDownRight className="w-8 h-8 text-white/60" />
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Button className="h-16 bg-gradient-primary hover:shadow-primary transition-bounce" size="lg">
            <Plus className="w-5 h-5 mr-2" />
            Add Expense
          </Button>
          <Button variant="outline" className="h-16 hover:bg-secondary transition-smooth" size="lg">
            <Users className="w-5 h-5 mr-2" />
            Settle Up
          </Button>
          <Button variant="outline" className="h-16 hover:bg-secondary transition-smooth" size="lg">
            <TrendingUp className="w-5 h-5 mr-2" />
            View Balances
          </Button>
        </div>

        {/* Stats and Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Stats */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <h3 className="font-semibold text-lg mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{friendsCount} Friends</p>
                      <p className="text-sm text-muted-foreground">Connected</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{groupsCount} Groups</p>
                      <p className="text-sm text-muted-foreground">Active</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Receipt className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{recentExpenses.length} Expenses</p>
                      <p className="text-sm text-muted-foreground">This month</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Recent Expenses */}
          <Card className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">Recent Expenses</h3>
              <Button variant="ghost" size="sm">View All</Button>
            </div>
            
            {expensesLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-muted h-16 rounded-lg" />
                ))}
              </div>
            ) : recentExpenses.length > 0 ? (
              <div className="space-y-3">
                {recentExpenses.map((expense) => {
                  const userShare = expense.splitDetails.find(
                    detail => detail.user._id === user?.id
                  );
                  const isPaid = userShare?.status === 'paid';
                  
                  return (
                    <div
                      key={expense._id}
                      className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          expense.paidBy._id === user?.id 
                            ? 'bg-success/20 text-success' 
                            : 'bg-expense/20 text-expense'
                        }`}>
                          <Receipt className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-medium">{expense.description}</p>
                          <p className="text-sm text-muted-foreground">
                            {expense.group ? `${expense.group.name} • ` : ''}
                            Paid by {expense.paidBy.name}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-semibold">
                          ₹{expense.amount.toLocaleString()}
                        </p>
                        {userShare && (
                          <p className={`text-sm ${isPaid ? 'text-success' : 'text-expense'}`}>
                            Your share: ₹{userShare.finalShare.toLocaleString()}
                            {isPaid ? ' ✓' : ''}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Receipt className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No expenses yet</p>
                <p className="text-sm">Add your first expense to get started!</p>
              </div>
            )}
          </Card>
        </div>
      </Container>
    </AppLayout>
  );
};

export default Dashboard;