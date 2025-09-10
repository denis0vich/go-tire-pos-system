import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { LogIn, User, Lock } from 'lucide-react';

const Login = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!credentials.username || !credentials.password) {
      toast.error('Please enter both username and password');
      return;
    }

    setLoading(true);
    
    try {
      const result = await login(credentials.username, credentials.password);
      
      if (result.success) {
        toast.success('Login successful!');
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  const handleDemoLogin = async (role) => {
    const demoCredentials = {
      admin: { username: 'admin', password: 'admin123' },
      cashier: { username: 'cashier', password: 'cashier123' }
    };

    setCredentials(demoCredentials[role]);
    setLoading(true);

    try {
      const result = await login(demoCredentials[role].username, demoCredentials[role].password);
      
      if (result.success) {
        toast.success(`Logged in as ${role}!`);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100">
            <LogIn className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            POS System Login
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to your account to continue
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div className="form-group">
              <label htmlFor="username" className="form-label">
                <User className="inline w-4 h-4 mr-1" />
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="form-input"
                placeholder="Enter your username"
                value={credentials.username}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password" className="form-label">
                <Lock className="inline w-4 h-4 mr-1" />
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="form-input"
                placeholder="Enter your password"
                value={credentials.password}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full"
            >
              {loading ? (
                <>
                  <div className="spinner"></div>
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Sign in
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 text-gray-500">Demo Accounts</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleDemoLogin('admin')}
              disabled={loading}
              className="btn btn-outline w-full"
            >
              Admin Demo
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('cashier')}
              disabled={loading}
              className="btn btn-outline w-full"
            >
              Cashier Demo
            </button>
          </div>
          
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              Use demo accounts to explore the system features
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
