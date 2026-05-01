import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Clock, MapPin, Plus, ArrowLeft, Users, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "@/assets/lokalpay-logo.png";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { toast } from "@/hooks/use-toast";

interface Meeting {
  id: string;
  organizer_id: string;
  invitee_id: string;
  title: string;
  description: string;
  meeting_date: string;
  location: string;
  status: string;
}

interface ProfileMin {
  user_id: string;
  display_name: string;
  lokalpay_id: string;
  market: string;
}

const statusMap: Record<string, { label: string; color: string }> = {
  pending: { label: "En attente", color: "bg-lokalpay-gold/20 text-lokalpay-gold" },
  accepted: { label: "Acceptée", color: "bg-primary/20 text-primary" },
  declined: { label: "Refusée", color: "bg-destructive/20 text-destructive" },
  completed: { label: "Terminée", color: "bg-muted text-muted-foreground" },
};

const MeetingsPage = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [profiles, setProfiles] = useState<ProfileMin[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ invitee_id: "", title: "", description: "", meeting_date: "", location: "" });

  const fetchData = async () => {
    const [{ data: m }, { data: p }] = await Promise.all([
      supabase.from("meetings").select("*").order("meeting_date", { ascending: true }),
      supabase.from("profiles").select("user_id, display_name, lokalpay_id, market"),
    ]);
    if (m) setMeetings(m as Meeting[]);
    if (p) setProfiles(p as ProfileMin[]);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const getProfileName = (userId: string) => profiles.find(p => p.user_id === userId)?.display_name || "—";

  const handleCreate = async () => {
    if (!user || !form.invitee_id || !form.title || !form.meeting_date) return;
    const { error } = await supabase.from("meetings").insert({
      organizer_id: user.id,
      invitee_id: form.invitee_id,
      title: form.title,
      description: form.description,
      meeting_date: form.meeting_date,
      location: form.location,
    });
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Rencontre créée !" });
      setDialogOpen(false);
      setForm({ invitee_id: "", title: "", description: "", meeting_date: "", location: "" });
      fetchData();
    }
  };

  const handleStatusUpdate = async (meetingId: string, status: string) => {
    await supabase.from("meetings").update({ status }).eq("id", meetingId);
    fetchData();
  };

  const otherProfiles = profiles.filter(p => p.user_id !== user?.id);

  return (
    <div className="min-h-screen bg-warm">
      <header className="bg-card border-b border-border sticky top-0 z-40 shadow-card">
        <div className="container mx-auto flex items-center justify-between h-14 px-4">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="LokalPay" className="h-8 w-8" />
            <span className="font-display font-bold text-lg text-foreground">LokalPay</span>
          </Link>
          <div className="flex items-center gap-3">
            <LanguageSwitcher variant="compact" />
            <Button variant="ghost" size="sm" asChild>
              <Link to="/dashboard"><ArrowLeft className="h-4 w-4 mr-1" /> Tableau de bord</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
              <Calendar className="h-6 w-6 text-primary" /> Rencontres Professionnelles
            </h1>
            <p className="text-muted-foreground text-sm mt-1">Planifiez des rendez-vous avec d'autres commerçants</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="hero"><Plus className="h-4 w-4 mr-1" /> Nouvelle</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Planifier une rencontre</DialogTitle>
                <DialogDescription>Choisissez un commerçant et planifiez un rendez-vous professionnel</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Commerçant</label>
                  <Select onValueChange={(v) => setForm(f => ({ ...f, invitee_id: v }))}>
                    <SelectTrigger><SelectValue placeholder="Choisir un commerçant" /></SelectTrigger>
                    <SelectContent>
                      {otherProfiles.map(p => (
                        <SelectItem key={p.user_id} value={p.user_id}>{p.display_name} ({p.lokalpay_id})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Sujet</label>
                  <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Ex: Discussion partenariat" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Description</label>
                  <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Détails de la rencontre..." />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-foreground">Date & Heure</label>
                    <Input type="datetime-local" value={form.meeting_date} onChange={e => setForm(f => ({ ...f, meeting_date: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Lieu</label>
                    <Input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="Ex: Marché Total" />
                  </div>
                </div>
                <Button variant="hero" className="w-full" onClick={handleCreate}>Créer la rencontre</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="text-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" /></div>
        ) : meetings.length === 0 ? (
          <Card className="shadow-card border-0">
            <CardContent className="p-12 text-center text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">Aucune rencontre planifiée</p>
              <p className="text-sm mt-1">Créez votre première rencontre professionnelle</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {meetings.map(m => {
              const st = statusMap[m.status] || statusMap.pending;
              const isOrganizer = m.organizer_id === user?.id;
              const isInvitee = m.invitee_id === user?.id;
              return (
                <Card key={m.id} className="shadow-card border-0 hover:shadow-elevated transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-display font-bold text-foreground">{m.title}</h3>
                          <Badge className={`text-xs ${st.color}`}>{st.label}</Badge>
                        </div>
                        {m.description && <p className="text-sm text-muted-foreground mb-3">{m.description}</p>}
                        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {new Date(m.meeting_date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                          </span>
                          {m.location && (
                            <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {m.location}</span>
                          )}
                          <span className="flex items-center gap-1">
                            <Users className="h-3.5 w-3.5" />
                            {isOrganizer ? `→ ${getProfileName(m.invitee_id)}` : `← ${getProfileName(m.organizer_id)}`}
                          </span>
                        </div>
                      </div>
                      {isInvitee && m.status === "pending" && (
                        <div className="flex gap-2 ml-4">
                          <Button size="sm" variant="hero" onClick={() => handleStatusUpdate(m.id, "accepted")}>
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleStatusUpdate(m.id, "declined")}>
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MeetingsPage;
