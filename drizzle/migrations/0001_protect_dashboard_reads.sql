DROP POLICY IF EXISTS "Anyone can read feedback analytics" ON public.feedback;
REVOKE SELECT ON public.feedback FROM anon, authenticated;
REVOKE SELECT (id, rating, category, review_text, sentiment, is_demo, created_at) ON public.feedback FROM anon, authenticated;
GRANT SELECT ON public.feedback TO service_role;