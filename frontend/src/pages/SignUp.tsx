import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const SignUp = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
      setError("Email, password, and password confirmation are required.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    const { error: signUpError } = await signUp(email, password);
    setIsSubmitting(false);

    if (signUpError) {
      setError(signUpError.message || "Unable to create your account.");
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
              [ Create Account ]
            </p>
            <h1 className="text-3xl font-normal">Start your analysis</h1>
            <p className="mt-3 text-sm leading-6 text-[#7D8187]">
              Create a local demo account to access your TubeInsight dashboard.
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
                autoComplete="new-password"
                className="h-11 border border-white/15 bg-black px-3 text-white outline-none transition-colors placeholder:text-white/30 focus:border-red-500"
                placeholder="Enter a password"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm text-white/70">
              Confirm password
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                autoComplete="new-password"
                className="h-11 border border-white/15 bg-black px-3 text-white outline-none transition-colors placeholder:text-white/30 focus:border-red-500"
                placeholder="Re-enter your password"
              />
            </label>

            {error && <p className="text-sm text-red-400">{error}</p>}

            <Button type="submit" variant="hero" size="lg" disabled={isSubmitting} className="mt-2 w-full">
              {isSubmitting && <Loader2 className="animate-spin" />}
              {isSubmitting ? "CREATING ACCOUNT" : "CREATE ACCOUNT"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-[#7D8187]">
            Already have an account?{" "}
            <Link to="/signin" className="text-white underline underline-offset-4 hover:text-red-400">
              Sign in
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
};

export default SignUp;
