CREATE TABLE public.feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text,
  email text,
  rating smallint NOT NULL CHECK (rating BETWEEN 1 AND 5),
  category text NOT NULL CHECK (category IN ('Product','Service','Support','Website','Other')),
  review_text text NOT NULL CHECK (char_length(review_text) BETWEEN 3 AND 2000),
  sentiment text NOT NULL CHECK (sentiment IN ('Positive','Neutral','Negative')),
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (customer_name IS NULL OR char_length(customer_name) <= 100),
  CHECK (email IS NULL OR char_length(email) <= 255)
);
GRANT INSERT (customer_name, email, rating, category, review_text, sentiment) ON public.feedback TO anon, authenticated;
GRANT SELECT (id, rating, category, review_text, sentiment, is_demo, created_at) ON public.feedback TO anon, authenticated;
GRANT ALL ON public.feedback TO service_role;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit feedback" ON public.feedback FOR INSERT TO anon, authenticated WITH CHECK (is_demo = false);
CREATE POLICY "Anyone can read feedback analytics" ON public.feedback FOR SELECT TO anon, authenticated USING (true);

INSERT INTO public.feedback (customer_name, rating, category, review_text, sentiment, is_demo, created_at) VALUES
('Demo: A. Mehta',5,'Product','Excellent product, very reliable and easy to use. Love it!','Positive',true, now() - interval '27 days'),
('Demo: J. Carter',4,'Service','Good service and helpful staff, delivery was quick.','Positive',true, now() - interval '24 days'),
('Demo: L. Nguyen',2,'Support','Support was slow to respond and the issue is still not resolved.','Negative',true, now() - interval '21 days'),
('Demo: R. Gupta',3,'Website','The website is okay, checkout works but navigation could be clearer.','Neutral',true, now() - interval '18 days'),
('Demo: S. Park',5,'Support','Amazing support team, they fixed my problem in minutes. Great experience.','Positive',true, now() - interval '15 days'),
('Demo: M. Rossi',1,'Product','Terrible quality, the item broke after two days. Very disappointed.','Negative',true, now() - interval '12 days'),
('Demo: K. Osei',4,'Website','Clean website and fast pages, easy to find what I need.','Positive',true, now() - interval '9 days'),
('Demo: P. Silva',3,'Other','Average experience overall, nothing special.','Neutral',true, now() - interval '6 days'),
('Demo: T. Kim',2,'Service','Delivery was late and the packaging was damaged.','Negative',true, now() - interval '4 days'),
('Demo: D. Brown',5,'Product','Fantastic value, works perfectly. Highly recommend Thrylos.','Positive',true, now() - interval '2 days'),
('Demo: E. Laurent',4,'Support','Friendly and professional support, thank you.','Positive',true, now() - interval '1 day'),
('Demo: H. Ali',3,'Product','Product is fine but the price feels a bit high.','Neutral',true, now() - interval '5 hours');