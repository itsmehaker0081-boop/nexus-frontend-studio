import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/layout';
import { AppLayout } from '@/components/ui/layout';
import { Eye, EyeOff, Wallet, Users, TrendingUp } from 'lucide-react';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    upiId: '',
  });

  const { login, register } = useAuth();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await register({
          name: formData.name,
          username: formData.username,
          email: formData.email,
          password: formData.password,
          upiId: formData.upiId || undefined,
        });
        setIsLogin(true);
        setFormData({ ...formData, name: '', username: '', upiId: '' });
      }
    } catch (error) {
      console.error('Auth error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout className="bg-gradient-hero">
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
          {/* Hero Section */}
          <div className="text-center lg:text-left text-white space-y-6">
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-6xl font-bold">
                Split expenses
                <br />
                <span className="text-white/90">with friends</span>
              </h1>
              <p className="text-xl text-white/80 max-w-md mx-auto lg:mx-0">
                Track shared expenses, settle up easily, and keep friendships strong.
              </p>
            </div>

            {/* Feature highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto">
                  <Wallet className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold">UPI Payments</h3>
                <p className="text-sm text-white/70">Pay instantly with QR codes</p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold">Group Expenses</h3>
                <p className="text-sm text-white/70">Split bills with groups</p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold">Smart Settlements</h3>
                <p className="text-sm text-white/70">Optimize who owes whom</p>
              </div>
            </div>
          </div>

          {/* Auth Form */}
          <div className="w-full max-w-md mx-auto">
            <Card className="backdrop-blur-sm bg-white/10 border-white/20 text-white">
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold">
                    {isLogin ? 'Welcome back' : 'Create account'}
                  </h2>
                  <p className="text-white/70 mt-2">
                    {isLogin
                      ? 'Sign in to your account'
                      : 'Join thousands of users splitting bills'
                    }
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {!isLogin && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-white">Full Name</Label>
                        <Input
                          id="name"
                          name="name"
                          type="text"
                          required={!isLogin}
                          value={formData.name}
                          onChange={handleInputChange}
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                          placeholder="Enter your full name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="username" className="text-white">Username</Label>
                        <Input
                          id="username"
                          name="username"
                          type="text"
                          required={!isLogin}
                          value={formData.username}
                          onChange={handleInputChange}
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                          placeholder="Choose a username"
                        />
                      </div>
                    </>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                      placeholder="Enter your email"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-white">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={formData.password}
                        onChange={handleInputChange}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/50 pr-10"
                        placeholder="Enter your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  {!isLogin && (
                    <div className="space-y-2">
                      <Label htmlFor="upiId" className="text-white">UPI ID (Optional)</Label>
                      <Input
                        id="upiId"
                        name="upiId"
                        type="text"
                        value={formData.upiId}
                        onChange={handleInputChange}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                        placeholder="your-upi@bank"
                      />
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-white text-primary hover:bg-white/90 font-semibold transition-bounce"
                    disabled={loading}
                  >
                    {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
                  </Button>
                </form>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-white/80 hover:text-white underline transition-colors"
                  >
                    {isLogin
                      ? "Don't have an account? Sign up"
                      : 'Already have an account? Sign in'
                    }
                  </button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default AuthPage;