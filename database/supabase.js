import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://lefowalykbtzjukrsjkw.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxlZm93YWx5a2J0emp1a3Jzamt3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTczODg4NzQsImV4cCI6MjAzMjk2NDg3NH0.FA8hdG43fLyMazFoLp-RzfUV-lNShlNyZbhtRnl8QyI';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});