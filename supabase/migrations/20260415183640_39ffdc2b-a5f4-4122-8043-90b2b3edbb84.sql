-- Create trigger on transactions to recalculate score
CREATE TRIGGER recalculate_score_after_transaction
  AFTER INSERT ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.recalculate_score_on_transaction();