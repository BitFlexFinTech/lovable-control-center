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
import { Loader2, Mail, Lock, User, ArrowRight } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
});

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

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
        description: 'Welcome to Control Center.',
      });
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
      
      <Card className="w-full max-w-md relative z-10 border-border/50 shadow-2xl">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
            <span className="text-2xl font-bold text-primary">CC</span>
          </div>
          <CardTitle className="text-2xl font-bold">Control Center</CardTitle>
          <CardDescription>
            Manage all your sites from one place
          </CardDescription>
        </CardHeader>
        
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
    </div>
  );
};

export default Auth;
