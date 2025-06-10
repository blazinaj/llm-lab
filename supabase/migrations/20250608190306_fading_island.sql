/*
  # Create benchmark storage tables

  1. New Tables
    - `benchmarks`
      - `id` (uuid, primary key)
      - `name` (text) - user-provided name for the benchmark run
      - `task_id` (text) - reference to the benchmarked task
      - `task_name` (text) - display name of the task
      - `task_category` (text) - category of the task
      - `task_difficulty` (text) - difficulty level
      - `settings` (jsonb) - benchmark settings and configuration
      - `created_at` (timestamp)
      
    - `benchmark_results`
      - `id` (uuid, primary key)  
      - `benchmark_id` (uuid, foreign key)
      - `model_id` (text) - model identifier
      - `model_name` (text) - display name
      - `provider` (text) - model provider
      - `score` (decimal) - overall performance score
      - `quality` (decimal) - output quality score
      - `latency` (integer) - response time in milliseconds
      - `cost` (decimal) - cost of the API call
      - `input_tokens` (integer) - number of input tokens
      - `output_tokens` (integer) - number of output tokens
      - `raw_output` (text) - the actual model output
      - `error` (text, nullable) - error message if failed
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for public access (can be restricted later)
*/

CREATE TABLE IF NOT EXISTS benchmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  task_id text NOT NULL,
  task_name text NOT NULL,
  task_category text NOT NULL,
  task_difficulty text NOT NULL,
  settings jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS benchmark_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  benchmark_id uuid REFERENCES benchmarks(id) ON DELETE CASCADE,
  model_id text NOT NULL,
  model_name text NOT NULL,
  provider text NOT NULL,
  score decimal NOT NULL DEFAULT 0,
  quality decimal NOT NULL DEFAULT 0,
  latency integer NOT NULL DEFAULT 0,
  cost decimal NOT NULL DEFAULT 0,
  input_tokens integer NOT NULL DEFAULT 0,
  output_tokens integer NOT NULL DEFAULT 0,
  raw_output text DEFAULT '',
  error text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE benchmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE benchmark_results ENABLE ROW LEVEL SECURITY;

-- Allow public access for now (can be restricted to authenticated users later)
CREATE POLICY "Allow public access to benchmarks"
  ON benchmarks
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public access to benchmark_results"
  ON benchmark_results
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_benchmarks_created_at ON benchmarks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_benchmarks_task_id ON benchmarks(task_id);
CREATE INDEX IF NOT EXISTS idx_benchmark_results_benchmark_id ON benchmark_results(benchmark_id);
CREATE INDEX IF NOT EXISTS idx_benchmark_results_score ON benchmark_results(score DESC);