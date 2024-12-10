import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://lefowalykbtzjukrsjkw.supabase.co'; 


const SUPABASE_SECRET_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxlZm93YWx5a2J0emp1a3Jzamt3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcxNzM4ODg3NCwiZXhwIjoyMDMyOTY0ODc0fQ.eV82A799v6YwZpRMr5lNvNXwnqJVWxOABUPei7vdIhw';

export const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
  auth: {
    // storage: AsyncStorage,
    // autoRefreshToken: true,
    // persistSession: true,
    // detectSessionInUrl: false,
  },
});