import { supabase } from '@/lib/supabase/client';
import { Database } from '@/types/database';

export type Post = Database['public']['Tables']['posts']['Row'] & {
    profiles: {
        username: string | null;
        avatar_type: string | null;
    } | null;
};

export type JobExperience = Database['public']['Tables']['job_experiences']['Row'] & {
    jobs: {
        title: string;
        status: string | null;
    } | null;
};

export const supabaseService = {
    // Fetch posts with profile information
    async fetchPosts(): Promise<Post[]> {
        const { data, error } = await supabase
            .from('posts')
            .select(`
                *,
                profiles (
                    username,
                    avatar_type
                )
            `)
            .order('created_at', { ascending: false })
            .limit(20);

        if (error) {
            console.error('Error fetching posts:', error);
            return [];
        }

        return data as Post[];
    },

    // Create a new post
    async createPost(content: string, userId: string): Promise<Post | null> {
        const { data, error } = await supabase
            .from('posts')
            .insert({
                user_id: userId,
                content: content
            })
            .select(`
                *,
                profiles (
                    username,
                    avatar_type
                )
            `)
            .single();

        if (error) {
            console.error('Error creating post:', error);
            return null;
        }

        return data as Post;
    },

    // Fetch job experiences for a user (or all for the village scene if needed)
    // For VillageScene, we might want to show "my" experiences or "all" experiences.
    // Let's assume for now we want to show the current user's experiences or just recent ones.
    // Based on the requirement "VillageScene to display experience data", let's fetch all for now to populate the village.
    async fetchJobExperiences(): Promise<JobExperience[]> {
        const { data, error } = await supabase
            .from('job_experiences')
            .select(`
                *,
                jobs (
                    title,
                    status
                )
            `)
            .order('completed_at', { ascending: false })
            .limit(20);

        if (error) {
            console.error('Error fetching job experiences:', error);
            return [];
        }

        return data as JobExperience[];
    }
};
