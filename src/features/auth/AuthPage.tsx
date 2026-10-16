import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Logo, Card, Button, Input, useToast } from '@/components/ui';
import {
  useSignUp,
  useSignIn,
  useProviderSignIn,
  useJoinWithCode,
  useDemoSignIn,
} from '@/hooks/mutations';

const signUpSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  consent: z.literal(true, {
    errorMap: () => ({ message: 'You must confirm you are the parent or guardian' }),
  }),
});

const logInSchema = z.object({
  identifier: z.string().min(1, 'Username or email is required'),
  password: z.string().min(1, 'Password is required'),
});

const childCodeSchema = z.object({
  code: z.string().regex(/^\d{6}$/, 'Enter a valid 6-digit family code'),
});

type SignUpForm = z.infer<typeof signUpSchema>;
type LogInForm = z.infer<typeof logInSchema>;
type ChildCodeForm = z.infer<typeof childCodeSchema>;

export function AuthPage() {
  const [role, setRole] = useState<'parent' | 'child'>('parent');
  const [mode, setMode] = useState<'signup' | 'login'>('signup');
  const navigate = useNavigate();
  const toast = useToast();

  const signUpMutation = useSignUp();
  const signInMutation = useSignIn();
  const providerMutation = useProviderSignIn();
  const joinCodeMutation = useJoinWithCode();
  const demoMutation = useDemoSignIn();

  const signUpForm = useForm<SignUpForm>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { username: '', email: '', password: '', consent: undefined as unknown as true },
  });

  const logInForm = useForm<LogInForm>({
    resolver: zodResolver(logInSchema),
    defaultValues: { identifier: '', password: '' },
  });

  const childForm = useForm<ChildCodeForm>({
    resolver: zodResolver(childCodeSchema),
    defaultValues: { code: '' },
  });

  const handleSignUp = (data: SignUpForm) => {
    signUpMutation.mutate(
      { email: data.email, username: data.username, password: data.password, role: 'parent' },
      {
        onSuccess: () => {
          toast.success('Account created successfully!');
          navigate('/parent');
        },
        onError: (err) => {
          toast.error(err.message);
        },
      },
    );
  };

  const handleLogIn = (data: LogInForm) => {
    signInMutation.mutate(
      { identifier: data.identifier, password: data.password },
      {
        onSuccess: () => {
          toast.success('Logged in successfully!');
          navigate('/parent');
        },
        onError: (err) => {
          toast.error(err.message);
        },
      },
    );
  };

  const handleChildJoin = (data: ChildCodeForm) => {
    joinCodeMutation.mutate(data.code, {
      onSuccess: () => {
        toast.success('Device paired successfully!');
        navigate('/child');
      },
      onError: (err) => {
        toast.error(err.message);
      },
    });
  };

  const handleProvider = (provider: 'google' | 'apple' | 'other') => {
    providerMutation.mutate(provider, {
      onSuccess: () => {
        toast.success(`Signed in with ${provider}`);
        navigate('/parent');
      },
      onError: (err) => {
        toast.error(err.message);
      },
    });
  };

  const handleDemo = () => {
    demoMutation.mutate('parent', {
      onSuccess: () => {
        toast.success('Signed in as demo parent');
        navigate('/parent');
      },
      onError: (err) => {
        toast.error(err.message);
      },
    });
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-6">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Left column: Branding */}
        <div className="flex flex-col items-start gap-6">
          <Logo subtitle="PARENT" className="scale-110 origin-left" />
          <h1 className="text-3xl font-semibold text-navy leading-tight">
            Develop your child's literacy skills - join GameRead today!
          </h1>
          <p className="text-navy-soft text-base">
            Encourage daily reading habits with built-in parental controls, customized reward schedules, and real-time activity tracking.
          </p>
        </div>

        {/* Right column: Auth card */}
        <Card className="p-6 bg-white shadow-window">
          {/* Role tabs */}
          <div className="flex rounded-pill bg-blue/20 p-1 mb-6">
            <button
              type="button"
              onClick={() => setRole('parent')}
              className={`flex-1 py-2 text-sm font-semibold rounded-pill transition-colors ${
                role === 'parent' ? 'bg-navy text-cream shadow' : 'text-navy hover:text-accent'
              }`}
            >
              Parent
            </button>
            <button
              type="button"
              onClick={() => setRole('child')}
              className={`flex-1 py-2 text-sm font-semibold rounded-pill transition-colors ${
                role === 'child' ? 'bg-navy text-cream shadow' : 'text-navy hover:text-accent'
              }`}
            >
              Child
            </button>
          </div>

          {role === 'child' ? (
            /* Child family code login */
            <form onSubmit={childForm.handleSubmit(handleChildJoin)} className="space-y-4">
              <div className="text-center space-y-2 mb-4">
                <h2 className="text-xl font-semibold text-navy">Enter Family Code</h2>
                <p className="text-sm text-navy-soft">
                  Ask your parent for your 6-digit family pairing code to connect this device.
                </p>
              </div>

              <Input
                label="6-Digit Family Code"
                type="text"
                maxLength={6}
                placeholder="123456"
                error={childForm.formState.errors.code?.message}
                {...childForm.register('code')}
              />

              <Button
                type="submit"
                variant="primary"
                className="w-full h-11 text-base uppercase tracking-wide mt-2"
                loading={joinCodeMutation.isPending}
              >
                Connect Device
              </Button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    demoMutation.mutate('child', {
                      onSuccess: () => {
                        toast.success('Entered child demo mode');
                        navigate('/child');
                      },
                    });
                  }}
                  className="text-sm text-accent hover:underline font-medium"
                >
                  Try the child demo
                </button>
              </div>
            </form>
          ) : (
            /* Parent Sign Up / Log In */
            <div>
              {/* Mode Switcher */}
              <div className="flex justify-between items-center border-b border-navy/10 pb-3 mb-5">
                <h2 className="text-xl font-semibold text-navy">
                  {mode === 'signup' ? 'Create Account' : 'Welcome Back'}
                </h2>
                <button
                  type="button"
                  onClick={() => setMode(mode === 'signup' ? 'login' : 'signup')}
                  className="text-sm font-semibold text-accent hover:underline"
                >
                  {mode === 'signup' ? 'Log in instead' : 'Sign up instead'}
                </button>
              </div>

              {mode === 'signup' ? (
                <form onSubmit={signUpForm.handleSubmit(handleSignUp)} className="space-y-4">
                  <Input
                    label="Username"
                    type="text"
                    placeholder="e.g. SarahM"
                    error={signUpForm.formState.errors.username?.message}
                    {...signUpForm.register('username')}
                  />

                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="parent@example.com"
                    error={signUpForm.formState.errors.email?.message}
                    {...signUpForm.register('email')}
                  />

                  <div>
                    <Input
                      label="Password"
                      type="password"
                      placeholder="••••••••"
                      error={signUpForm.formState.errors.password?.message}
                      {...signUpForm.register('password')}
                    />
                    <p className="text-xs text-navy-soft mt-1">At least 6 characters</p>
                  </div>

                  <div className="space-y-1">
                    <label className="flex items-center gap-2 cursor-pointer text-sm text-navy">
                      <input
                        type="checkbox"
                        className="rounded border-navy/30 text-accent focus:ring-accent h-4 w-4"
                        {...signUpForm.register('consent')}
                      />
                      <span>I'm the parent or guardian</span>
                    </label>
                    {signUpForm.formState.errors.consent?.message && (
                      <p className="text-xs text-danger font-medium">
                        {signUpForm.formState.errors.consent.message}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full h-11 text-base uppercase tracking-wide mt-2"
                    loading={signUpMutation.isPending}
                  >
                    Create Account
                  </Button>
                </form>
              ) : (
                <form onSubmit={logInForm.handleSubmit(handleLogIn)} className="space-y-4">
                  <Input
                    label="Username or Email"
                    type="text"
                    placeholder="parent@example.com"
                    error={logInForm.formState.errors.identifier?.message}
                    {...logInForm.register('identifier')}
                  />

                  <Input
                    label="Password"
                    type="password"
                    placeholder="••••••••"
                    error={logInForm.formState.errors.password?.message}
                    {...logInForm.register('password')}
                  />

                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full h-11 text-base uppercase tracking-wide mt-2"
                    loading={signInMutation.isPending}
                  >
                    Log In
                  </Button>
                </form>
              )}

              {/* Social Logins */}
              <div className="mt-6 space-y-3">
                <div className="relative flex items-center justify-center">
                  <div className="border-t border-navy/10 w-full" />
                  <span className="bg-white px-3 text-xs text-navy-soft uppercase absolute">
                    Continue with
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2">
                  <Button
                    type="button"
                    variant="solid"
                    className="h-10 text-xs"
                    onClick={() => handleProvider('google')}
                    disabled={providerMutation.isPending}
                  >
                    Google
                  </Button>
                  <Button
                    type="button"
                    variant="solid"
                    className="h-10 text-xs"
                    onClick={() => handleProvider('apple')}
                    disabled={providerMutation.isPending}
                  >
                    Apple
                  </Button>
                  <Button
                    type="button"
                    variant="solid"
                    className="h-10 text-xs"
                    onClick={() => handleProvider('other')}
                    disabled={providerMutation.isPending}
                  >
                    Other
                  </Button>
                </div>

                <div className="text-center pt-3 border-t border-navy/10">
                  <button
                    type="button"
                    onClick={handleDemo}
                    className="text-sm font-semibold text-accent hover:underline"
                    disabled={demoMutation.isPending}
                  >
                    Try the demo
                  </button>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}