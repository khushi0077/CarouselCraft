import { createClient } from '@supabase/supabase-js';
import { Slide } from './contentParser';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface CarouselPost {
  id?: string;
  title: string;
  platform: string;
  status: 'draft' | 'scheduled' | 'published';
  slides_data: Slide[];
  caption: string;
  hashtags: string[];
  scheduled_for?: string;
  published_at?: string;
  template_settings: {
    template: any;
    colors: any;
    logo: string;
  };
  created_at?: string;
  updated_at?: string;
}

export async function saveCarouselPost(post: CarouselPost): Promise<{ data: any; error: any }> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: { message: 'User not authenticated' } };
  }

  const postData = {
    ...post,
    user_id: user.id,
    updated_at: new Date().toISOString()
  };

  if (post.id) {
    const { data, error } = await supabase
      .from('carousel_posts')
      .update(postData)
      .eq('id', post.id)
      .select()
      .maybeSingle();

    return { data, error };
  } else {
    const { data, error } = await supabase
      .from('carousel_posts')
      .insert([postData])
      .select()
      .maybeSingle();

    return { data, error };
  }
}

export async function getCarouselPosts(): Promise<{ data: CarouselPost[] | null; error: any }> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: { message: 'User not authenticated' } };
  }

  const { data, error } = await supabase
    .from('carousel_posts')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return { data, error };
}

export async function deleteCarouselPost(id: string): Promise<{ error: any }> {
  const { error } = await supabase
    .from('carousel_posts')
    .delete()
    .eq('id', id);

  return { error };
}

export async function scheduleCarouselPost(
  post: CarouselPost,
  scheduledDate: Date
): Promise<{ data: any; error: any }> {
  const postWithSchedule = {
    ...post,
    status: 'scheduled' as const,
    scheduled_for: scheduledDate.toISOString()
  };

  return await saveCarouselPost(postWithSchedule);
}

export async function publishCarouselPost(id: string): Promise<{ data: any; error: any }> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: { message: 'User not authenticated' } };
  }

  const { data, error } = await supabase
    .from('carousel_posts')
    .update({
      status: 'published',
      published_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .maybeSingle();

  return { data, error };
}
