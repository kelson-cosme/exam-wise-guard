import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDestinatarios, useAddDestinatario, useDeleteDestinatario } from "@/hooks/useDestinatarios";
import { useProfile } from "@/hooks/useProfile";
import { Trash2, X } from "lucide-react";

export const ConfiguracoesEmail = () => {
  const { data: profile } = useProfile();
  const { data: destinatarios, isLoading } = useDestinatarios();
  const addDestinatario = useAddDestinatario();
  const deleteDestinatario = useDeleteDestinatario();
  const [newEmail, setNewEmail] = useState("");

  const handleAddEmail = () => {
    if (newEmail && profile?.empresa_id) {
      addDestinatario.mutate({ email: newEmail, empresa_id: profile.empresa_id }, {
        onSuccess: () => setNewEmail(""),
      });
    }
  };

  if (isLoading || !profile) return <div>Carregando configurações...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurações de Notificação</CardTitle>
        <CardDescription>
          Adicione ou remova os e-mails que receberão os alertas automáticos de vencimento para a empresa <strong>{profile.empresas?.nome}</strong>.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="new-email">Adicionar Novo Destinatário</Label>
          <div className="flex space-x-2">
            <Input
              id="new-email"
              type="email"
              placeholder="email@exemplo.com"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
            />
            <Button onClick={handleAddEmail} disabled={addDestinatario.isPending}>
              {addDestinatario.isPending ? "Adicionando..." : "Adicionar"}
            </Button>
          </div>
        </div>
        <div className="space-y-2">
          <Label>Destinatários Atuais</Label>
          <div className="space-y-2 rounded-md border p-4">
            {destinatarios && destinatarios.length > 0 ? (
              destinatarios.map(dest => (
                <div key={dest.id} className="flex items-center justify-between">
                  <span>{dest.email}</span>
                  <Button variant="ghost" size="icon" onClick={() => deleteDestinatario.mutate(dest.id)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Nenhum destinatário configurado.</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};