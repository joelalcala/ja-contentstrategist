import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hddkbmkaixmeayxazquc.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhkZGtibWthaXhtZWF5eGF6cXVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjg0MTQ1MTIsImV4cCI6MjA0Mzk5MDUxMn0.VRe5VVvECtesNvqmGj_b7elgsNNgVkrlbk7RkHxauSA'

export const supabase = createClient(supabaseUrl, supabaseKey)