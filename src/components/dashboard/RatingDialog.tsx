import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Star, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Props {
  evaluatedUserId: string;
  evaluatedName: string;
  transactionId?: string;
  trigger?: React.ReactNode;
}

const RatingDialog = ({ evaluatedUserId, evaluatedName, transactionId, trigger }: Props) => {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const submit = async () => {
    if (!user) return;
    setLoading(true);
    const { error } = await supabase.from("evaluations").insert({
      evaluator_id: user.id,
      evaluated_id: evaluatedUserId,
      transaction_id: transactionId || "00000000-0000-0000-0000-000000000000",
      note: rating,
      commentaire: comment.slice(0, 500),
    });
    setLoading(false);
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Merci !", description: "Votre évaluation a été enregistrée" });
      setOpen(false);
      setComment("");
      setRating(5);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button variant="outline" size="sm"><Star className="h-4 w-4 mr-1" /> Noter</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Évaluer {evaluatedName}</DialogTitle>
          <DialogDescription>
            Votre note aide les autres à faire confiance à ce partenaire.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                onMouseEnter={() => setHover(n)}
                onMouseLeave={() => setHover(0)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className={`h-10 w-10 ${
                    n <= (hover || rating) ? "fill-lokalpay-gold text-lokalpay-gold" : "text-muted"
                  }`}
                />
              </button>
            ))}
          </div>

          <Textarea
            placeholder="Commentaire (optionnel) — partagez votre expérience"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={500}
            rows={3}
          />

          <Button onClick={submit} variant="hero" className="w-full h-11" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Envoyer l'évaluation"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RatingDialog;
