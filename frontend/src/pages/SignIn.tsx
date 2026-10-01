import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const SignIn = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError("Email and password are required.");
      return;
    }

    setIsSubmitting(true);
    const { error: signInError } = await signIn(email, password);
    setIsSubmitting(false);

    if (signInError) {
      setError(signInError.message || "Unable to sign in.");
      return;
    }

    navigate("/dashboard", { replace: true });
  };

  return (
    <main className="min-h-screen bg-black px-4 py-12 text-white">
      <div className="mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-md flex-col justify-center">
        <Link to="/" className="mb-10 text-center text-2xl font-bold tracking-tight">
          TUBEINSIGHT
        </Link>

        <section className="border border-white/10 bg-white/[0.02] p-6 sm:p-8">
          <div className="mb-8">
            <p className="mb-3 font-mono text-xs uppercase tracking-[1.4px] text-red-500">
              [ Welcome Back ]
            </p>
            <h1 className="text-3xl font-normal">Sign in to TubeInsight</h1>
            <p className="mt-3 text-sm leading-6 text-[#7D8187]">
              Continue to your channel and video analysis workspace.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <label className="flex flex-col gap-2 text-sm text-white/70">
              Email
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                className="h-11 border border-white/15 bg-black px-3 text-white outline-none transition-colors placeholder:text-white/30 focus:border-red-500"
                placeholder="you@example.com"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm text-white/70">
              Password
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                className="h-11 border border-white/15 bg-black px-3 text-white outline-none transition-colors placeholder:text-white/30 focus:border-red-500"
                placeholder="Enter your password"
              />
            </label>

            {error && <p className="text-sm text-red-400">{error}</p>}

            <Button type="submit" variant="hero" size="lg" disabled={isSubmitting} className="mt-2 w-full">
              {isSubmitting && <Loader2 className="animate-spin" />}
              {isSubmitting ? "SIGNING IN" : "SIGN IN"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-[#7D8187]">
            Need an account?{" "}
            <Link to="/signup" className="text-white underline underline-offset-4 hover:text-red-400">
              Sign up
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
};

export default SignIn;
