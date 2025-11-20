export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    username: string | null
                    avatar_type: string | null
                    current_location_x: number | null
                    current_location_y: number | null
                    updated_at: string
                }
                Insert: {
                    id: string
                    username?: string | null
                    avatar_type?: string | null
                    current_location_x?: number | null
                    current_location_y?: number | null
                    updated_at?: string
                }
                Update: {
                    id?: string
                    username?: string | null
                    avatar_type?: string | null
                    current_location_x?: number | null
                    current_location_y?: number | null
                    updated_at?: string
                }
                Relationships: []
            }
            posts: {
                Row: {
                    id: string
                    user_id: string
                    content: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    content: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    content?: string
                    created_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "posts_user_id_fkey"
                        columns: ["user_id"]
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    }
                ]
            }
            jobs: {
                Row: {
                    id: string
                    title: string
                    status: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    title: string
                    status?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    title?: string
                    status?: string | null
                    created_at?: string
                }
                Relationships: []
            }
            job_experiences: {
                Row: {
                    id: string
                    user_id: string
                    job_id: string
                    completed_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    job_id: string
                    completed_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    job_id?: string
                    completed_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "job_experiences_job_id_fkey"
                        columns: ["job_id"]
                        referencedRelation: "jobs"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "job_experiences_user_id_fkey"
                        columns: ["user_id"]
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    }
                ]
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}
