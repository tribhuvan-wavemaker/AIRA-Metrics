import React from 'react';
import { Activity } from 'lucide-react';
import { GoogleSignIn } from './GoogleSignIn';
import { useAuth } from '../contexts/AuthContext';
import { GoogleLoginResponse } from 'react-google-login';

export function LoginPage() {
  const { login } = useAuth();

  const handleGoogleSuccess = (response: GoogleLoginResponse) => {
    console.log('Google Sign-In Success:', response);
    login(response);
  };

  const handleGoogleFailure = (error: any) => {
    console.error('Google Sign-In Error:', error);
    // You could show a toast notification here
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-blue-600 p-3 rounded-full">
              <Activity className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            AIRA Metrics
          </h2>
          <p className="text-gray-600">
            Sign in to access your analytics dashboard
          </p>
        </div>

        <div className="bg-white py-8 px-6 shadow-lg rounded-lg">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 text-center mb-4">
                Welcome back
              </h3>
              <p className="text-sm text-gray-600 text-center mb-6">
                Please sign in with your Google account to continue
              </p>
            </div>

            <GoogleSignIn
              onSuccess={handleGoogleSuccess}
              onFailure={handleGoogleFailure}
            />

            <div className="text-center">
              <p className="text-xs text-gray-500">
                By signing in, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-500">
            Need help? Contact support at{' '}
            <a href="mailto:support@example.com" className="text-blue-600 hover:text-blue-500">
              support@example.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}