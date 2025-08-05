import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from 'lucide-react';

import Logo from "@/img/logoFinal.png"
import Rebrand from "@/img/rebrand.png"

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      // A navegação será tratada pelo onAuthStateChange no AuthContext,
      // mas podemos forçar aqui caso necessário.
      navigate('/');
    }
    setLoading(false);
  };

  return (
    <div className="flex justify-end min-h-screen bg-background ">

      <div className=' w-full flex justify-center items-center '>
        <img src={Rebrand} alt="" className='absolute bottom-0 left-0 max-w-[60vh]'/>
        <img src={Logo} alt="" className='max-w-[80vh]'/>
      </div>

      <Card className="min-h-screen w-[45%]   flex flex-col justify-center">
      {/* <Card className="w-full max-w-md  bg-red-600"> */}
        <CardHeader className=''>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Acesse sua conta para gerenciar os exames.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Erro no Login</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;