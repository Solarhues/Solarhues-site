js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xnlhgnnxunqghvdfuvke.supabase.co';
const supabaseKey = 'sb_publishable_xNBsUzhB6ujPKglfHpQkqQ_zNNpgBmH';

export const supabase = createClient(supabaseUrl, supabaseKey);
