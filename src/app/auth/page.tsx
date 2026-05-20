
// SUPABASE_PLACEHOLDER: Auth connected to Supabase
"use client"

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useSupabaseUser } from '@/lib/supabase/hooks'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form'
import { 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  Loader2, 
  LogOut,
  Eye,
  EyeOff,
  Sparkles,
  ChevronLeft
} from 'lucide-react'
import { signInWithEmail, signUpWithEmail, signOut } from '@/lib/supabase/auth'
//import { useUser } from '@/lib/supabase'//
import { cn } from '@/lib/utils'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

// Validation Schemas
const signInSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
})

const signUpSchema = z.object({
  name: z.string().min(2, { message: "First name is required" }),
  surname: z.string().min(2, { message: "Surname is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
})

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
})

type AuthState = 'signin' | 'signup' | 'forgot-password'

export default function AuthPage() {
  const { user, loading } = useSupabaseUser()
  const router = useRouter()
  const [authState, setAuthState] = useState<AuthState>('signin')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [resetSent, setResetSent] = useState(false)

  // Sign In Form
  const signInForm = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  })

  // Sign Up Form
  const signUpForm = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { name: "", surname: "", email: "", password: "" },
  })

  // Forgot Password Form
  const forgotForm = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  })

  const onSignIn = async (values: z.infer<typeof signInSchema>) => {
    setIsSubmitting(true)
    await signInWithEmail(values.email, values.password)
    setIsSubmitting(false)
  }

  const onSignUp = async (values: z.infer<typeof signUpSchema>) => {
    setIsSubmitting(true)
    await signUpWithEmail(values.email, values.password)
    setIsSubmitting(false)
  }

  const onForgotPassword = async (values: z.infer<typeof forgotPasswordSchema>) => {
    setIsSubmitting(true)
    console.log("Placeholder Password Reset:", values)
    await new Promise(resolve => setTimeout(resolve, 1500))
    setResetSent(true)
    setIsSubmitting(false)
  }

  const handleGoogleAuth = async () => {
  try {
    console.log('GOOGLE LOGIN CLICKED')

    const supabase = createBrowserSupabaseClient()

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'http://localhost:3000/auth/callback',
      },
    })

    if (error) {
      console.error('OAuth Error:', error)
    }
  } catch (err) {
    console.error('Google Auth Crash:', err)
  }
}

const handleSignOut = async () => {
  await signOut()
} 
  
    if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )

  // Logged In State
  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <Card className="max-w-md w-full border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white">
          <CardHeader className="text-center p-8 pb-4">
            <div className="mx-auto p-4 bg-primary/5 rounded-full w-fit mb-4">
              <User className="w-12 h-12 text-primary" />
            </div>
            <CardTitle className="text-2xl font-headline font-bold">Welcome back!</CardTitle>
            <CardDescription className="text-slate-500 font-medium">
              You are signed in as <span className="text-primary font-bold">{user.email}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8 pt-4">
            <div className="space-y-4">
              <Button 
                variant="outline" 
                className="w-full h-14 rounded-2xl border-slate-200 font-bold gap-2 text-slate-600 hover:bg-slate-50"
                onClick={() => router.push('/dashboard')}
              >
                Go to Dashboard <ArrowRight className="w-4 h-4" />
              </Button>
              <Button 
                variant="destructive" 
                className="w-full h-14 rounded-2xl font-bold gap-2 shadow-lg shadow-rose-100"
                onClick={handleSignOut}
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="max-w-[480px] w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-primary text-white rounded-2xl shadow-xl shadow-primary/20 mb-4">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-headline font-bold text-slate-900 tracking-tight">
            {authState === 'signin' && 'Sign in to your account'}
            {authState === 'signup' && 'Create your account'}
            {authState === 'forgot-password' && 'Reset your password'}
          </h1>
          <p className="text-slate-500 font-medium italic">
            "Your journey to mastery starts here."
          </p>
        </div>

        <Card className="border-none shadow-2xl rounded-[2.5rem] bg-white overflow-hidden">
          <CardContent className="p-8 sm:p-10 space-y-6">
            
            {authState !== 'forgot-password' && (
              <>
                <Button 
                  variant="outline" 
                  className="w-full h-14 rounded-2xl border-slate-200 font-bold text-slate-600 gap-3 hover:bg-slate-50 transition-all active:scale-[0.98]"
                  onClick={handleGoogleAuth}
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c1.61-3.12 2.54-6.81 2.54-10.32Z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23Z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.16H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.84l3.66-2.75Z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.16l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53Z"
                    />
                  </svg>
                  Continue with Google
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-100" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-4 text-slate-400 font-bold tracking-widest">Or continue with email</span>
                  </div>
                </div>
              </>
            )}

            {authState === 'signin' && (
              <Form {...signInForm}>
                <form onSubmit={signInForm.handleSubmit(onSignIn)} className="space-y-4">
                  <FormField
                    control={signInForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold uppercase tracking-widest text-slate-400">Email Address</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                            <Input placeholder="name@example.com" className="pl-11 h-14 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={signInForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex justify-between items-center">
                          <FormLabel className="text-xs font-bold uppercase tracking-widest text-slate-400">Password</FormLabel>
                          <button 
                            type="button" 
                            className="text-[10px] font-bold text-primary uppercase tracking-wider hover:underline"
                            onClick={() => {
                              setAuthState('forgot-password');
                              setResetSent(false);
                              forgotForm.reset();
                            }}
                          >
                            Forgot Password?
                          </button>
                        </div>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                            <Input 
                              type={showPassword ? "text" : "password"} 
                              placeholder="••••••••" 
                              className="pl-11 pr-11 h-14 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white" 
                              {...field} 
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit" 
                    className="w-full h-14 rounded-2xl font-bold text-base shadow-xl shadow-primary/20 transition-all active:scale-[0.98]"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In'}
                  </Button>
                </form>
              </Form>
            )}

            {authState === 'signup' && (
              <Form {...signUpForm}>
                <form onSubmit={signUpForm.handleSubmit(onSignUp)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={signUpForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold uppercase tracking-widest text-slate-400">Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John" className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={signUpForm.control}
                      name="surname"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold uppercase tracking-widest text-slate-400">Surname</FormLabel>
                          <FormControl>
                            <Input placeholder="Doe" className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={signUpForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold uppercase tracking-widest text-slate-400">Email Address</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                            <Input placeholder="name@example.com" className="pl-11 h-14 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={signUpForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold uppercase tracking-widest text-slate-400">Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                            <Input 
                              type={showPassword ? "text" : "password"} 
                              placeholder="••••••••" 
                              className="pl-11 pr-11 h-14 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white" 
                              {...field} 
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit" 
                    className="w-full h-14 rounded-2xl font-bold text-base shadow-xl shadow-primary/20 transition-all active:scale-[0.98]"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Account'}
                  </Button>
                </form>
              </Form>
            )}

            {authState === 'forgot-password' && (
              <div className="space-y-6">
                {!resetSent ? (
                  <>
                    <div className="space-y-2">
                      <p className="text-sm text-slate-500 font-medium leading-relaxed">
                        Enter your email address and we'll send you a link to reset your password.
                      </p>
                    </div>
                    <Form {...forgotForm}>
                      <form onSubmit={forgotForm.handleSubmit(onForgotPassword)} className="space-y-4">
                        <FormField
                          control={forgotForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-bold uppercase tracking-widest text-slate-400">Email Address</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                  <Input placeholder="name@example.com" className="pl-11 h-14 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white" {...field} />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button 
                          type="submit" 
                          className="w-full h-14 rounded-2xl font-bold text-base shadow-xl shadow-primary/20 transition-all active:scale-[0.98]"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send Reset Link'}
                        </Button>
                      </form>
                    </Form>
                  </>
                ) : (
                  <div className="text-center space-y-6 py-4 animate-in fade-in zoom-in-95 duration-500">
                    <div className="mx-auto p-4 bg-emerald-50 text-emerald-600 rounded-full w-fit">
                      <Mail className="w-8 h-8" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-slate-900">Check your email</h3>
                      <p className="text-sm text-slate-500 font-medium">
                        We've sent a password reset link to <span className="font-bold text-slate-800">{forgotForm.getValues().email}</span>.
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full h-14 rounded-2xl border-slate-200 font-bold"
                      onClick={() => setResetSent(false)}
                    >
                      Didn't get the email? Try again
                    </Button>
                  </div>
                )}
                <button 
                  onClick={() => setAuthState('signin')}
                  className="w-full flex items-center justify-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-primary transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" /> Back to Sign In
                </button>
              </div>
            )}

          </CardContent>
          
          <CardFooter className="p-8 bg-slate-50/50 border-t border-slate-100 flex justify-center">
            <p className="text-sm font-medium text-slate-500">
              {authState === 'signin' && (
                <>
                  Don't have an account?
                  <button 
                    onClick={() => {
                      setAuthState('signup');
                      signUpForm.reset();
                    }}
                    className="ml-2 font-bold text-primary hover:underline transition-all"
                  >
                    Create one now
                  </button>
                </>
              )}
              {authState === 'signup' && (
                <>
                  Already have an account?
                  <button 
                    onClick={() => {
                      setAuthState('signin');
                      signInForm.reset();
                    }}
                    className="ml-2 font-bold text-primary hover:underline transition-all"
                  >
                    Sign In instead
                  </button>
                </>
              )}
              
              {authState === 'forgot-password' && (
                <button 
                  onClick={() => setAuthState('signup')}
                  className="font-bold text-primary hover:underline transition-all"
                >
                  Create an account
                </button>
              )}
            </p>
          </CardFooter>
        </Card>

        {/* Footer info */}
        <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-loose">
          By continuing, you agree to our Terms of Service <br /> and Privacy Intelligence Protocols.
        </p>
      </div>
    </div>
  )
}
