import React from 'react';
import { Header } from './components/Header';
import { StatsGrid } from './components/StatsGrid';
import { ImageTable } from './components/ImageTable';
import { QuickActions } from './components/QuickActions';
import { useRealtime } from './hooks/useRealtime';
import { useAuth } from './hooks/useAuth';
import { toast } from 'react-hot-toast';
import { Shield, Lock, Mail, Eye, EyeOff, Database, Cloud, Server } from 'lucide-react';

function AuthenticatedApp() {
  useRealtime();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <StatsGrid />
        <QuickActions />
        <ImageTable />
      </main>
    </div>
  );
}

function BackgroundAnimation() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Animated grid */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `linear-gradient(#4338ca 1px, transparent 1px), linear-gradient(to right, #4338ca 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
          animation: 'slide 20s linear infinite',
        }}
      />

      {/* Floating icons */}
      {[...Array(15)].map((_, i) => (
        <div
          key={i}
          className="absolute text-blue-200/10"
          style={{
            animation: `float ${10 + Math.random() * 10}s linear infinite`,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            transform: `scale(${0.5 + Math.random()})`,
          }}
        >
          {i % 3 === 0 ? (
            <Database size={40} />
          ) : i % 3 === 1 ? (
            <Cloud size={40} />
          ) : (
            <Server size={40} />
          )}
        </div>
      ))}

      {/* Gradient overlay */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-blue-600/90 to-blue-800/90"
        style={{ mixBlendMode: 'multiply' }}
      />
    </div>
  );
}

function UnauthenticatedApp() {
  const { signIn, signUp, resendConfirmation } = useAuth();
  const [isSignUp, setIsSignUp] = React.useState(false);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [cooldownTime, setCooldownTime] = React.useState(0);
  const [needsConfirmation, setNeedsConfirmation] = React.useState(false);

  React.useEffect(() => {
    let timer: number;
    if (cooldownTime > 0) {
      timer = window.setInterval(() => {
        setCooldownTime((time) => Math.max(0, time - 1));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldownTime]);

  const handleResendConfirmation = async () => {
    if (cooldownTime > 0) return;
    
    try {
      await resendConfirmation(email);
      toast.success('Confirmation email sent! Please check your inbox.');
      setCooldownTime(60);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to resend confirmation';
      if (errorMessage.includes('rate_limit')) {
        const seconds = errorMessage.match(/\d+/)?.[0] || '60';
        setCooldownTime(parseInt(seconds, 10));
        toast.error(`Please wait ${seconds} seconds before trying again`);
      } else {
        toast.error(errorMessage);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || cooldownTime > 0) return;

    setIsSubmitting(true);
    try {
      if (isSignUp) {
        await signUp(email, password);
        setNeedsConfirmation(true);
        toast.success('Please check your email for confirmation instructions');
      } else {
        await signIn(email, password);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
      
      if (errorMessage.includes('email_not_confirmed')) {
        setNeedsConfirmation(true);
        toast.error('Please confirm your email before signing in');
      } else if (errorMessage.includes('rate_limit')) {
        const seconds = errorMessage.match(/\d+/)?.[0] || '60';
        setCooldownTime(parseInt(seconds, 10));
        toast.error(`Please wait ${seconds} seconds before trying again`);
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-blue-600 p-12 relative overflow-hidden">
        <BackgroundAnimation />
        <div className="w-full max-w-md mx-auto flex flex-col justify-between text-white relative z-10">
          <div>
            <div className="flex items-center space-x-3">
              <Shield className="h-12 w-12" />
              <span className="text-2xl font-bold">Accuknox</span>
            </div>
            <h2 className="mt-12 text-4xl font-bold leading-tight">
              Runtime Powered Zero Trust CNAPP
            </h2>
            <p className="mt-4 text-lg text-blue-100">
              Secure your container images with advanced vulnerability scanning and real-time monitoring.
            </p>
          </div>
          
          <div className="space-y-6 backdrop-blur-sm bg-white/5 p-6 rounded-lg">
            <div className="flex items-center space-x-4 text-sm">
              <Shield className="h-5 w-5 text-blue-300" />
              <span>Advanced vulnerability detection</span>
            </div>
            <div className="flex items-center space-x-4 text-sm">
              <Lock className="h-5 w-5 text-blue-300" />
              <span>Real-time security monitoring</span>
            </div>
            <div className="flex items-center space-x-4 text-sm">
              <Mail className="h-5 w-5 text-blue-300" />
              <span>Instant security alerts</span>
            </div>
          </div>

          <div className="text-sm text-blue-200">
            © 2025 Accuknox. All rights reserved.
          </div>
        </div>
      </div>

      {/* Right side - Auth form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">
              {isSignUp ? 'Create your account' : 'Welcome back'}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {isSignUp 
                ? 'Start securing your container images today'
                : 'Sign in to access your security dashboard'}
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <div className="mt-1 relative">
                  <input
                    id="email"
                    type="email"
                    required
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isSubmitting}
                  />
                  <Mail className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1 relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {needsConfirmation && (
              <div className="rounded-md bg-blue-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <Mail className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">
                      Email confirmation required
                    </h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <p>Please check your email for confirmation instructions.</p>
                      <button
                        type="button"
                        onClick={handleResendConfirmation}
                        disabled={cooldownTime > 0}
                        className="mt-2 text-blue-800 hover:text-blue-900 font-medium disabled:opacity-50"
                      >
                        {cooldownTime > 0 
                          ? `Resend confirmation in ${cooldownTime}s` 
                          : 'Resend confirmation email'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || cooldownTime > 0}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                isSubmitting || cooldownTime > 0
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              }`}
            >
              {cooldownTime > 0 
                ? `Wait ${cooldownTime}s` 
                : isSubmitting 
                  ? 'Processing...' 
                  : isSignUp 
                    ? 'Create account' 
                    : 'Sign in'}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setNeedsConfirmation(false);
                }}
                disabled={isSubmitting}
                className="text-sm text-blue-600 hover:text-blue-500 font-medium disabled:opacity-50"
              >
                {isSignUp 
                  ? 'Already have an account? Sign in' 
                  : "Don't have an account? Sign up"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-gray-600">Loading your security dashboard...</p>
        </div>
      </div>
    );
  }

  return user ? <AuthenticatedApp /> : <UnauthenticatedApp />;
}