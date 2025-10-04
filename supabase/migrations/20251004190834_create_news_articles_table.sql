-- Create news_articles table based on NewsCardDto type
CREATE TABLE IF NOT EXISTS public.news_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image TEXT,
  headline TEXT NOT NULL,
  description TEXT,
  category JSONB NOT NULL DEFAULT '[]'::jsonb,
  trust_score INTEGER NOT NULL CHECK (trust_score >= 0 AND trust_score <= 100),
  trust_explanation TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index on trust_score for filtering/sorting
CREATE INDEX IF NOT EXISTS idx_news_articles_trust_score ON public.news_articles(trust_score DESC);

-- Create GIN index on category for efficient JSONB operations
CREATE INDEX IF NOT EXISTS idx_news_articles_category ON public.news_articles USING GIN(category);

-- Create index on created_at for sorting by date
CREATE INDEX IF NOT EXISTS idx_news_articles_created_at ON public.news_articles(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.news_articles ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (anyone can read news articles)
CREATE POLICY "Allow public read access" ON public.news_articles
  FOR SELECT
  USING (true);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.news_articles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
