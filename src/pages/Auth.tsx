import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { Loader2, Mail, Lock, User, ArrowRight, Zap, Shield, CheckCircle2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { ZACCLogo } from '@/components/layout/ZACCLogo';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
});

const features = [
  "Anonymous & secure reporting",
  "Enterprise-grade compliance",
  "Real-time case management",
  "Multi-language support"
];

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isGodModeLoading, setIsGodModeLoading] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleGodMode = async () => {
    setIsGodModeLoading(true);
    const godModeEmail = 'superadmin@zacc.local';
    const godModePassword = 'GodMode123!';
    
    try {
      const signInResult = await signIn(godModeEmail, godModePassword);
      
      if (!signInResult.error) {
        toast({
          title: '⚡ GodMode Activated',
          description: 'Welcome back, Super Admin.',
        });
        navigate('/');
        setIsGodModeLoading(false);
        return;
      }

      const signUpResult = await signUp(godModeEmail, godModePassword, 'Super Admin');
      
      if (!signUpResult.error) {
        const retryLogin = await signIn(godModeEmail, godModePassword);
        if (!retryLogin.error) {
          toast({
            title: '⚡ GodMode Activated',
            description: 'Super Admin account created. Welcome!',
          });
          navigate('/');
        } else {
          toast({
            title: '⚡ GodMode Ready',
            description: 'Account created. Click GodMode again to enter.',
          });
        }
      } else if (signUpResult.error?.message?.includes('already registered')) {
        const finalAttempt = await signIn(godModeEmail, godModePassword);
        if (!finalAttempt.error) {
          toast({
            title: '⚡ GodMode Activated',
            description: 'Welcome back, Super Admin.',
          });
          navigate('/');
        } else {
          toast({
            title: 'GodMode Failed',
            description: 'Could not access Super Admin account.',
            variant: 'destructive',
          });
        }
      } else {
        toast({
          title: 'GodMode Failed',
          description: signUpResult.error?.message || 'Could not create Super Admin account.',
          variant: 'destructive',
        });
      }
    } catch (err) {
      toast({
        title: 'GodMode Error',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
    }
    
    setIsGodModeLoading(false);
  };

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    try {
      loginSchema.parse({ email: loginEmail, password: loginPassword });
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        err.errors.forEach((error) => {
          if (error.path[0]) {
            fieldErrors[`login_${error.path[0]}`] = error.message;
          }
        });
        setErrors(fieldErrors);
        return;
      }
    }

    setIsLoading(true);
    const { error } = await signIn(loginEmail, loginPassword);
    setIsLoading(false);

    if (error) {
      toast({
        title: 'Login failed',
        description: error.message || 'Invalid email or password',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Welcome back!',
        description: 'You have successfully logged in.',
      });
      navigate('/');
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    try {
      signupSchema.parse({ email: signupEmail, password: signupPassword, fullName: signupName });
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        err.errors.forEach((error) => {
          if (error.path[0]) {
            fieldErrors[`signup_${error.path[0]}`] = error.message;
          }
        });
        setErrors(fieldErrors);
        return;
      }
    }

    setIsLoading(true);
    const { error } = await signUp(signupEmail, signupPassword, signupName);
    setIsLoading(false);

    if (error) {
      if (error.message?.includes('already registered')) {
        toast({
          title: 'Account exists',
          description: 'This email is already registered. Please log in instead.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Signup failed',
          description: error.message || 'Could not create account',
          variant: 'destructive',
        });
      }
    } else {
      toast({
        title: 'Account created!',
        description: 'Welcome to ZACC.',
      });
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left Panel - Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 hero-gradient relative overflow-hidden">
        <div className="absolute inset-0 pattern-grid opacity-10" />
        <div className="relative z-10 flex flex-col justify-center p-12 text-primary-foreground">
          <div className="max-w-md">
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-primary-foreground/20 rounded-xl p-3">
                <Shield className="h-8 w-8" />
              </div>
              <span className="text-3xl font-bold tracking-tight">ZACC</span>
            </div>
            
            <h1 className="text-4xl font-bold mb-4 leading-tight">
              Unlock the Power of Trusted Conversations
            </h1>
            <p className="text-lg opacity-90 mb-8">
              Empower your organization with secure, anonymous reporting channels. 
              Build trust, ensure compliance, and protect your people.
            </p>
            
            <div className="space-y-3">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="text-sm font-medium">{feature}</span>
                </div>
              ))}
            </div>

            <div className="mt-12 pt-8 border-t border-primary-foreground/20">
              <p className="text-sm opacity-75">Trusted by 500+ organizations worldwide</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Auth Forms */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <ZACCLogo size="lg" />
          </div>

          <Card className="border-border shadow-elevated">
            <CardHeader className="space-y-1 text-center pb-4">
              <div className="hidden lg:block">
                <ZACCLogo size="md" />
              </div>
              <CardTitle className="text-2xl font-bold mt-4">Welcome back</CardTitle>
              <CardDescription>
                Sign in to your account or create a new one
              </CardDescription>
            </CardHeader>
            
            {/* GodMode Button */}
            <div className="px-6 pb-4">
              <Button 
                variant="outline" 
                className="w-full border-primary/30 bg-hero-light hover:bg-primary/10 hover:border-primary text-primary font-semibold gap-2"
                onClick={handleGodMode}
                disabled={isGodModeLoading || isLoading}
              >
                {isGodModeLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Zap className="h-4 w-4" />
                )}
                GodMode
              </Button>
              <p className="text-xs text-center text-muted-foreground mt-2">
                One-click Super Admin access
              </p>
            </div>

            <div className="px-6">
              <Separator className="mb-4" />
            </div>

            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mx-6 max-w-[calc(100%-3rem)]">
                <TabsTrigger value="login">Log In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <form onSubmit={handleLogin}>
                  <CardContent className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="login-email"
                          type="email"
                          placeholder="name@example.com"
                          className="pl-9"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          disabled={isLoading}
                        />
                      </div>
                      {errors.login_email && (
                        <p className="text-sm text-destructive">{errors.login_email}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="login-password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="login-password"
                          type="password"
                          placeholder="••••••••"
                          className="pl-9"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          disabled={isLoading}
                        />
                      </div>
                      {errors.login_password && (
                        <p className="text-sm text-destructive">{errors.login_password}</p>
                      )}
                    </div>
                  </CardContent>
                  
                  <CardFooter>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <ArrowRight className="mr-2 h-4 w-4" />
                      )}
                      Log In
                    </Button>
                  </CardFooter>
                </form>
              </TabsContent>
              
              <TabsContent value="signup">
                <form onSubmit={handleSignup}>
                  <CardContent className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-name"
                          type="text"
                          placeholder="John Doe"
                          className="pl-9"
                          value={signupName}
                          onChange={(e) => setSignupName(e.target.value)}
                          disabled={isLoading}
                        />
                      </div>
                      {errors.signup_fullName && (
                        <p className="text-sm text-destructive">{errors.signup_fullName}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="name@example.com"
                          className="pl-9"
                          value={signupEmail}
                          onChange={(e) => setSignupEmail(e.target.value)}
                          disabled={isLoading}
                        />
                      </div>
                      {errors.signup_email && (
                        <p className="text-sm text-destructive">{errors.signup_email}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-password"
                          type="password"
                          placeholder="••••••••"
                          className="pl-9"
                          value={signupPassword}
                          onChange={(e) => setSignupPassword(e.target.value)}
                          disabled={isLoading}
                        />
                      </div>
                      {errors.signup_password && (
                        <p className="text-sm text-destructive">{errors.signup_password}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Must be at least 8 characters
                      </p>
                    </div>
                  </CardContent>
                  
                  <CardFooter>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <ArrowRight className="mr-2 h-4 w-4" />
                      )}
                      Create Account
                    </Button>
                  </CardFooter>
                </form>
              </TabsContent>
            </Tabs>
          </Card>

          <p className="text-center text-sm text-muted-foreground mt-6">
            By continuing, you agree to ZACC's Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;